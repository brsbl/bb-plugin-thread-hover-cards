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
      url: z.string().url(),
    })
    .strict(),
  z.object({ kind: z.literal("absent") }).strict(),
  z.object({ kind: z.literal("unavailable") }).strict(),
]);

export const threadSummarySchema = z
  .object({
    currentTurnStartedAt: z.number().nullable(),
    latestAssistantMessage: z.string().nullable(),
    latestUserMessage: z.string().nullable(),
    pullRequest: pullRequestSummarySchema,
    provider: z
      .object({
        displayName: z.string(),
        id: z.string(),
        logoUrl: z.string().nullable(),
        model: z.string(),
      })
      .strict(),
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
  const normalized = value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return normalized.length > 1_600
    ? `${normalized.slice(0, 1_599).trimEnd()}…`
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
    .join("\n\n");
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

function isRunningStatus(status: ThreadSummary["status"]): boolean {
  return (
    status === "active" ||
    status === "host-reconnecting" ||
    status === "provisioning" ||
    status === "starting" ||
    status === "stopping"
  );
}

const TURN_START_WINDOW = 256;

async function currentTurnStartedAt(
  bb: BbPluginApi,
  threadId: string,
  status: ThreadSummary["status"],
): Promise<number | null> {
  if (!isRunningStatus(status)) return null;

  const timeline = await safely(
    bb.sdk.threads.timeline({
      threadId,
      segmentLimit: "1",
      summaryOnly: "true",
    }),
  );
  if (!timeline) return null;

  const anchorSeq = timeline.timelinePage.olderCursor?.anchorSeq ?? 1;

  const events = await safely(
    bb.sdk.threads.events.list({
      threadId,
      afterSeq: String(Math.max(0, anchorSeq - 1)),
      limit: String(TURN_START_WINDOW),
    }),
  );
  const turnStart = events?.find(
    (event) =>
      event.type === "turn/started" &&
      event.data.parentToolCallId === undefined,
  );
  return turnStart?.createdAt ?? null;
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
      const [
        history,
        project,
        environment,
        pullRequestResult,
        executionOptions,
        providers,
        providerModels,
        threadOutput,
        turnStartedAt,
      ] =
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
          safely(bb.sdk.threads.defaultExecutionOptions({ threadId })),
          safely(
            bb.sdk.providers.list(
              thread.environmentId
                ? { environmentId: thread.environmentId }
                : undefined,
            ),
          ),
          safely(
            bb.sdk.providers.models(
              thread.environmentId
                ? {
                    environmentId: thread.environmentId,
                    providerId: thread.providerId,
                  }
                : { providerId: thread.providerId },
            ),
          ),
          thread.runtime.displayStatus === "idle"
            ? safely(bb.sdk.threads.output({ threadId }))
            : Promise.resolve(null),
          currentTurnStartedAt(
            bb,
            threadId,
            thread.runtime.displayStatus,
          ),
        ]);

      const isGitRepository =
        environment?.isGitRepo ?? project?.gitRemoteUrl != null;
      const provider = providers?.find(
        (candidate) => candidate.id === thread.providerId,
      );
      const normalizedAssistantMessage = normalizeMessage(
        threadOutput?.output ?? "",
      );
      const selectedModel = executionOptions?.model;
      const model = [
        ...(providerModels?.models ?? []),
        ...(providerModels?.selectedOnlyModels ?? []),
      ].find(
        (candidate) =>
          candidate.model === selectedModel || candidate.id === selectedModel,
      );

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
          url: source.url,
        };
      } else {
        pullRequest = { kind: "unavailable" };
      }

      return {
        currentTurnStartedAt: turnStartedAt,
        latestAssistantMessage: normalizedAssistantMessage || null,
        latestUserMessage: history ? latestVisibleMessage(history) : null,
        pullRequest,
        provider: {
          displayName: provider?.displayName ?? thread.providerId,
          id: thread.providerId,
          logoUrl: provider?.logoUrl ?? null,
          model:
            model?.displayName ?? selectedModel ?? "Model unavailable",
        },
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
