import { defineRpcContract, type BbPluginApi } from "@bb/plugin-sdk";
import { z } from "zod";

const displayStatusSchema = z.enum([
  "active",
  "error",
  "host-reconnecting",
  "idle",
  "provisioning",
  "starting",
  "stopping",
  "waiting-for-host",
]);

const pullRequestSummarySchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("available"),
      number: z.number().int().positive(),
      signal: z.string(),
      state: z.enum(["closed", "draft", "merged", "open"]),
      title: z.string(),
    })
    .strict(),
  z.object({ kind: z.literal("absent") }).strict(),
  z.object({ kind: z.literal("unavailable") }).strict(),
]);

export const threadSummarySchema = z
  .object({
    latestUserMessage: z.string().nullable(),
    pullRequest: pullRequestSummarySchema,
    repository: z
      .object({
        branch: z.string().nullable(),
        isGitRepository: z.boolean(),
        name: z.string(),
      })
      .strict(),
    status: displayStatusSchema,
    updatedAt: z.number(),
  })
  .strict();

export type ThreadSummary = z.infer<typeof threadSummarySchema>;

export const rpcContract = defineRpcContract({
  threadSummary: {
    input: z.object({ threadId: z.string().min(1) }).strict(),
    output: threadSummarySchema,
  },
});

async function safely<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

function normalizeMessage(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 300
    ? `${normalized.slice(0, 297).trimEnd()}…`
    : normalized;
}

function latestVisibleMessage(
  history: Awaited<ReturnType<BbPluginApi["sdk"]["threads"]["promptHistory"]>>,
): string | null {
  const latest = [...history].sort((left, right) => right.createdAt - left.createdAt)[0];
  if (!latest) return null;

  const text = latest.input
    .flatMap((item) =>
      item.type === "text" && item.visibility !== "agent-only"
        ? [item.text]
        : [],
    )
    .join(" ");
  const normalized = normalizeMessage(text);
  return normalized || null;
}

function repositoryName(remoteUrl: string | null, fallback: string): string {
  if (!remoteUrl) return fallback;

  const scpPath = remoteUrl.match(/^[^@]+@[^:]+:(.+)$/)?.[1];
  let path = scpPath;
  if (!path) {
    try {
      path = new URL(remoteUrl).pathname;
    } catch {
      path = remoteUrl;
    }
  }

  const segments = path
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .split(/[/:]/)
    .filter(Boolean);
  return segments.slice(-2).join("/") || fallback;
}

const PULL_REQUEST_SIGNALS = {
  blocked: "Blocked",
  checks_failed: "Checks failing",
  checks_pending: "Checks pending",
  changes_requested: "Changes requested",
  closed: "Closed",
  conflicts: "Conflicts",
  draft: "Draft",
  merged: "Merged",
  review_requested: "Review requested",
  ready_to_merge: "Ready to merge",
} as const;

export default function plugin(bb: BbPluginApi): void {
  bb.rpc.register(rpcContract, {
    async threadSummary({ threadId }) {
      const thread = await bb.sdk.threads.get({ threadId });
      const [history, project, environment, pullRequestResult] =
        await Promise.all([
          safely(bb.sdk.threads.promptHistory({ threadId, limit: "1" })),
          safely(bb.sdk.projects.get({ projectId: thread.projectId })),
          thread.environmentId
            ? safely(
                bb.sdk.environments.get({
                  environmentId: thread.environmentId,
                }),
              )
            : Promise.resolve(null),
          thread.environmentId
            ? safely(
                bb.sdk.environments.pullRequest({
                  environmentId: thread.environmentId,
                }),
              )
            : Promise.resolve(null),
        ]);

      const isGitRepository =
        environment?.isGitRepo ?? project?.gitRemoteUrl != null;

      let pullRequest: ThreadSummary["pullRequest"];
      if (!isGitRepository || pullRequestResult?.outcome === "absent") {
        pullRequest = { kind: "absent" };
      } else if (pullRequestResult?.outcome === "available") {
        const source = pullRequestResult.pullRequest;
        const signal =
          source.attention === "none"
            ? source.checks.state === "passing"
              ? "Checks passing"
              : source.state === "open"
                ? "Open"
                : source.state[0]!.toUpperCase() + source.state.slice(1)
            : PULL_REQUEST_SIGNALS[source.attention];
        pullRequest = {
          kind: "available",
          number: source.number,
          signal,
          state: source.state,
          title: source.title,
        };
      } else {
        pullRequest = { kind: "unavailable" };
      }

      return {
        latestUserMessage: history ? latestVisibleMessage(history) : null,
        pullRequest,
        repository: {
          branch: environment?.branchName ?? null,
          isGitRepository,
          name: repositoryName(
            project?.gitRemoteUrl ?? null,
            project?.name ?? "Repository unavailable",
          ),
        },
        status: thread.runtime.displayStatus,
        updatedAt: thread.updatedAt,
      };
    },
  });

  bb.log.info("Thread hover cards loaded.");
}
