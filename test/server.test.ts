import assert from "node:assert/strict";
import { markdownPreview } from "../markdown-preview";
import plugin, { type ThreadSummary } from "../server";

type SummaryHandler = (input: {
  threadId: string;
}) => Promise<ThreadSummary>;

let summaryHandler: SummaryHandler | undefined;
const logMessages: string[] = [];
let displayStatus: "active" | "idle" = "active";
let outlineCalls = 0;
let assistantPreview = "  Finished   the hover card \n polish.  ";
let timelineRows: Array<{
  completedAt: number | null;
  kind: "turn";
  startedAt: number;
}> = [
  {
    completedAt: null,
    kind: "turn",
    startedAt: 100,
  },
];

const fakeBb = {
  log: {
    info(message: string) {
      logMessages.push(message);
    },
  },
  rpc: {
    register(
      _contract: unknown,
      handlers: { threadSummary: SummaryHandler },
    ) {
      summaryHandler = handlers.threadSummary;
    },
  },
  sdk: {
    environments: {
      async get() {
        return {
          branchName: "feature/hover-cards",
          isGitRepo: true,
          path: "/workspace/thread-hover-cards",
        };
      },
      async pullRequest() {
        return {
          outcome: "available",
          pullRequest: {
            attention: "checks_failed",
            checks: { state: "failing" },
            number: 42,
            state: "open",
            title: "Add thread hover cards",
            url: "https://github.com/acme/bb-plugin-thread-hover-cards/pull/42",
          },
        };
      },
    },
    projects: {
      async get() {
        return {
          gitRemoteUrl: "git@github.com:acme/bb-plugin-thread-hover-cards.git",
          name: "Thread cards",
        };
      },
    },
    providers: {
      async list() {
        return [
          {
            displayName: "Codex",
            id: "codex",
            logoUrl: null,
          },
        ];
      },
      async models() {
        return {
          modelLoadError: null,
          models: [
            {
              id: "gpt-5.6-sol",
              model: "gpt-5.6-sol",
              displayName: "GPT-5.6-Sol",
            },
          ],
          providers: [],
          selectedOnlyModels: [],
        };
      },
    },
    threads: {
      async conversationOutline() {
        outlineCalls += 1;
        return {
          items: [
            {
              attachmentSummary: null,
              id: "assistant_1",
              preview: assistantPreview,
              role: "assistant",
            },
            {
              attachmentSummary: null,
              id: "user_1",
              preview: "A later user row must not replace agent output.",
              role: "user",
            },
          ],
          maxSeq: 20,
        };
      },
      async defaultExecutionOptions() {
        return {
          model: "gpt-5.6-sol",
          permissionMode: "full",
          providerId: "codex",
          reasoningLevel: "xhigh",
          serviceTier: "default",
        };
      },
      async get() {
        return {
          environmentId: "env_1",
          projectId: "proj_1",
          providerId: "codex",
          runtime: { displayStatus },
          updatedAt: 123,
        };
      },
      async timeline() {
        return {
          contextWindowUsage: {
            estimated: false,
            modelContextWindow: 100_000,
            usedTokens: 82_000,
          },
          maxSeq: 20,
          rows: timelineRows,
          timelinePage: {
            olderCursor: null,
          },
        };
      },
    },
  },
};

plugin(fakeBb as never);
assert.ok(summaryHandler, "registers the threadSummary RPC handler");

const summary = await summaryHandler({ threadId: "thr_1" });
assert.deepEqual(summary, {
  currentTurnCompletedAt: null,
  currentTurnStartedAt: 100,
  latestAssistantMessage: "Finished the hover card\npolish.",
  permissionMode: "full",
  pullRequest: {
    kind: "available",
    number: 42,
    signal: "Checks failing",
    state: "open",
    title: "Add thread hover cards",
    url: "https://github.com/acme/bb-plugin-thread-hover-cards/pull/42",
  },
  provider: {
    displayName: "Codex",
    id: "codex",
    logoUrl: null,
    model: "GPT-5.6-Sol",
    reasoningLevel: "xhigh",
  },
  repository: {
    branch: "feature/hover-cards",
    isGitRepository: true,
    name: "acme/bb-plugin-thread-hover-cards",
    path: "/workspace/thread-hover-cards",
  },
  status: "active",
});
assert.equal("permissionMode" in summary.provider, false);
assert.equal(summary.permissionMode, "full");
assert.equal("contextWindowUsage" in summary, false);
assert.equal(outlineCalls, 1);

timelineRows = [
  {
    completedAt: 180,
    kind: "turn",
    startedAt: 100,
  },
  {
    completedAt: null,
    kind: "turn",
    startedAt: 200,
  },
];
const longTurnSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(longTurnSummary.currentTurnStartedAt, 200);

timelineRows = [];
const missingTurnStartSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(missingTurnStartSummary.currentTurnStartedAt, null);

displayStatus = "idle";
timelineRows = [
  {
    completedAt: 220,
    kind: "turn",
    startedAt: 100,
  },
];
const idleSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(idleSummary.currentTurnStartedAt, 100);
assert.equal(idleSummary.currentTurnCompletedAt, 220);
assert.equal(
  idleSummary.latestAssistantMessage,
  "Finished the hover card\npolish.",
);
assert.equal(idleSummary.status, "idle");
assert.equal(outlineCalls, 4);

assistantPreview = " \n\t ";
timelineRows = [
  {
    completedAt: null,
    kind: "turn",
    startedAt: 300,
  },
];
const blankIdleSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(blankIdleSummary.latestAssistantMessage, null);
assert.equal(blankIdleSummary.currentTurnStartedAt, 300);
assert.equal(blankIdleSummary.currentTurnCompletedAt, null);
assert.equal(outlineCalls, 5);
assert.deepEqual(logMessages, ["Thread hover cards loaded."]);
assert.deepEqual(
  markdownPreview(
    "| Work | PR | Status |\n| --- | --- | --- |\n| Hover cards | #42 | Ready |",
  ),
  {
    inline: "Work: Hover cards · PR: #42 · Status: Ready",
    kind: "table",
  },
);
assert.deepEqual(markdownPreview("- First result\n- Second result\n- Extra"), {
  inline: "First result · Second result",
  kind: "list",
});
