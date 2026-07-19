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
    currentTurnCompletedAt: z.number().nullable(),
    currentTurnStartedAt: z.number().nullable(),
    latestAssistantMessage: z.string().nullable(),
    permissionMode: z
      .enum(["full", "readonly", "workspace-write"])
      .nullable(),
    pullRequest: pullRequestSummarySchema,
    provider: z
      .object({
        displayName: z.string(),
        id: z.string(),
        logoUrl: z.string().nullable(),
        model: z.string(),
        reasoningLevel: z
          .enum([
            "none",
            "low",
            "medium",
            "high",
            "xhigh",
            "ultracode",
            "max",
            "ultra",
          ])
          .nullable(),
      })
      .strict(),
    repository: z
      .object({
        branch: z.string().nullable(),
        isGitRepository: z.boolean(),
        name: z.string(),
        path: z.string().nullable(),
      })
      .strict(),
    status: displayStatusSchema,
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

interface TurnTiming {
  completedAt: number | null;
  startedAt: number | null;
}

const SUMMARY_LOOKUP_TIMEOUT_MS = 2_500;
const TARGET_EVENT_LOOKUP_LIMIT = 8;
const TARGET_EVENT_WAIT_MS = "1";

async function currentTurnTiming(
  bb: BbPluginApi,
  threadId: string,
  status: ThreadSummary["status"],
  signal: AbortSignal,
): Promise<TurnTiming> {
  if (!isRunningStatus(status) && status !== "idle") {
    return { completedAt: null, startedAt: null };
  }

  const timeline = await safely(
    bb.sdk.threads.timeline({
      threadId,
      segmentLimit: "1",
      signal,
      summaryOnly: "true",
    }),
  );
  if (!timeline) return { completedAt: null, startedAt: null };

  let eventCursor = Math.max(
    0,
    (timeline.timelinePage.olderCursor?.anchorSeq ?? 1) - 1,
  );
  let startedAt: number | null = null;
  let turnId: string | null = null;

  for (let attempt = 0; attempt < TARGET_EVENT_LOOKUP_LIMIT; attempt += 1) {
    const event = await safely(
      bb.sdk.threads.events.wait({
        afterSeq: String(eventCursor),
        signal,
        threadId,
        type: "turn/started",
        waitMs: TARGET_EVENT_WAIT_MS,
      }),
    );
    if (!event) break;
    eventCursor = event.seq;
    if (
      event.type === "turn/started" &&
      event.data.parentToolCallId === undefined &&
      event.scope.kind === "turn"
    ) {
      startedAt = event.createdAt;
      turnId = event.scope.turnId;
      break;
    }
  }

  if (startedAt === null || turnId === null || status !== "idle") {
    return { completedAt: null, startedAt };
  }

  for (let attempt = 0; attempt < TARGET_EVENT_LOOKUP_LIMIT; attempt += 1) {
    const event = await safely(
      bb.sdk.threads.events.wait({
        afterSeq: String(eventCursor),
        signal,
        threadId,
        type: "turn/completed",
        waitMs: TARGET_EVENT_WAIT_MS,
      }),
    );
    if (!event) break;
    eventCursor = event.seq;
    if (
      event.type === "turn/completed" &&
      event.scope.kind === "turn" &&
      event.scope.turnId === turnId
    ) {
      return { completedAt: event.createdAt, startedAt };
    }
  }

  return { completedAt: null, startedAt };
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
      const signal = AbortSignal.timeout(SUMMARY_LOOKUP_TIMEOUT_MS);
      const [
        project,
        environment,
        pullRequestResult,
        executionOptions,
        providers,
        providerModels,
        conversationOutline,
        turnTiming,
      ] =
        await Promise.all([
          safely(
            bb.sdk.projects.get({ projectId: thread.projectId, signal }),
          ),
          thread.environmentId
            ? safely(
                bb.sdk.environments.get({
                  environmentId: thread.environmentId,
                  signal,
                }),
              )
            : Promise.resolve(null),
          thread.environmentId
            ? safely(
                bb.sdk.environments.pullRequest({
                  environmentId: thread.environmentId,
                  signal,
                }),
              )
            : Promise.resolve(null),
          safely(
            bb.sdk.threads.defaultExecutionOptions({ signal, threadId }),
          ),
          safely(
            bb.sdk.providers.list(
              thread.environmentId
                ? { environmentId: thread.environmentId, signal }
                : { signal },
            ),
          ),
          safely(
            bb.sdk.providers.models(
              thread.environmentId
                ? {
                  environmentId: thread.environmentId,
                  providerId: thread.providerId,
                  signal,
                }
                : { providerId: thread.providerId, signal },
            ),
          ),
          safely(bb.sdk.threads.conversationOutline({ signal, threadId })),
          currentTurnTiming(
            bb,
            threadId,
            thread.runtime.displayStatus,
            signal,
          ),
        ]);

      const isGitRepository =
        environment?.isGitRepo ?? project?.gitRemoteUrl != null;
      const provider = providers?.find(
        (candidate) => candidate.id === thread.providerId,
      );
      const latestAssistantPreview = conversationOutline?.items
        .filter((item) => item.role === "assistant")
        .at(-1)?.preview;
      const normalizedAssistantMessage = normalizeMessage(
        latestAssistantPreview ?? "",
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
        currentTurnCompletedAt: turnTiming.completedAt,
        currentTurnStartedAt: turnTiming.startedAt,
        latestAssistantMessage: normalizedAssistantMessage || null,
        permissionMode: executionOptions?.permissionMode ?? null,
        pullRequest,
        provider: {
          displayName: provider?.displayName ?? thread.providerId,
          id: thread.providerId,
          logoUrl: provider?.logoUrl ?? null,
          model:
            model?.displayName ?? selectedModel ?? "Model unavailable",
          reasoningLevel: executionOptions?.reasoningLevel ?? null,
        },
        repository: {
          branch: environment?.branchName ?? null,
          isGitRepository,
          name: repositoryName(
            project?.gitRemoteUrl ?? null,
            project?.name ?? "Repository unavailable",
          ),
          path: environment?.path ?? null,
        },
        status: thread.runtime.displayStatus,
      };
    },
  });

  bb.log.info("Thread hover cards loaded.");
}
