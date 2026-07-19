import assert from "node:assert/strict";
import { markdownPreview } from "../markdown-preview";
import plugin, { type ThreadSummary } from "../server";

type SummaryHandler = (input: {
  threadId: string;
}) => Promise<ThreadSummary>;

let summaryHandler: SummaryHandler | undefined;
const logMessages: string[] = [];
let displayStatus: "active" | "idle" = "active";
let outputCalls = 0;
let assistantOutput = "  Finished   the hover card \n polish.  ";
let timelineAnchorSeq: number | null = 10;
let timelineMaxSeq = 20;
let threadEvents = [
  {
    createdAt: 100,
    data: { providerThreadId: "provider_1" },
    id: "event_1",
    scope: { kind: "turn" as const, turnId: "turn_1" },
    seq: 10,
    threadId: "thr_1",
    type: "turn/started" as const,
  },
];
const eventListInputs: Array<{
  afterSeq: string;
  limit: string;
  threadId: string;
}> = [];

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
      async defaultExecutionOptions() {
        return { model: "gpt-5.6-sol" };
      },
      events: {
        async list(input: {
          afterSeq: string;
          limit: string;
          threadId: string;
        }) {
          eventListInputs.push(input);
          return threadEvents;
        },
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
      async output() {
        outputCalls += 1;
        return { output: assistantOutput };
      },
      async promptHistory() {
        return [
          {
            createdAt: 123,
            id: "prompt_1",
            input: [
              {
                type: "text",
                text: "  Fix   the hover card \n today  ",
              },
              {
                type: "text",
                text: "Private context",
                visibility: "agent-only",
              },
            ],
          },
        ];
      },
      async timeline() {
        return {
          maxSeq: timelineMaxSeq,
          timelinePage: {
            olderCursor:
              timelineAnchorSeq === null
                ? null
                : { anchorId: "prompt_1", anchorSeq: timelineAnchorSeq },
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
  currentTurnStartedAt: 100,
  latestAssistantMessage: null,
  latestUserMessage: "Fix the hover card\ntoday",
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
  },
  repository: {
    branch: "feature/hover-cards",
    isGitRepository: true,
    name: "acme/bb-plugin-thread-hover-cards",
    path: "/workspace/thread-hover-cards",
  },
  status: "active",
  updatedAt: 123,
});
assert.equal(outputCalls, 0);
assert.deepEqual(eventListInputs, [
  { afterSeq: "9", limit: "256", threadId: "thr_1" },
]);

timelineAnchorSeq = 9_000;
timelineMaxSeq = 10_000;
threadEvents = [
  {
    createdAt: 200,
    data: { providerThreadId: "provider_1" },
    id: "event_long_turn",
    scope: { kind: "turn" as const, turnId: "turn_2" },
    seq: 9_000,
    threadId: "thr_1",
    type: "turn/started" as const,
  },
];
eventListInputs.length = 0;
const longTurnSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(longTurnSummary.currentTurnStartedAt, 200);
assert.deepEqual(eventListInputs, [
  { afterSeq: "8999", limit: "256", threadId: "thr_1" },
]);

timelineAnchorSeq = null;
timelineMaxSeq = 12_000;
threadEvents = [
  {
    createdAt: 300,
    data: { providerThreadId: "provider_1" },
    id: "event_first_long_turn",
    scope: { kind: "turn" as const, turnId: "turn_3" },
    seq: 4,
    threadId: "thr_1",
    type: "turn/started" as const,
  },
];
eventListInputs.length = 0;
const firstTurnSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(firstTurnSummary.currentTurnStartedAt, 300);
assert.deepEqual(eventListInputs, [
  { afterSeq: "0", limit: "256", threadId: "thr_1" },
]);

threadEvents = [];
eventListInputs.length = 0;
const missingTurnStartSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(missingTurnStartSummary.currentTurnStartedAt, null);
assert.deepEqual(eventListInputs, [
  { afterSeq: "0", limit: "256", threadId: "thr_1" },
]);

displayStatus = "idle";
const idleSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(idleSummary.currentTurnStartedAt, null);
assert.equal(
  idleSummary.latestAssistantMessage,
  "Finished the hover card\npolish.",
);
assert.equal(idleSummary.status, "idle");
assert.equal(outputCalls, 1);

assistantOutput = " \n\t ";
const blankIdleSummary = await summaryHandler({ threadId: "thr_1" });
assert.equal(blankIdleSummary.latestAssistantMessage, null);
assert.equal(outputCalls, 2);
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
