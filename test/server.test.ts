import assert from "node:assert/strict";
import plugin, { type ThreadSummary } from "../server";

type SummaryHandler = (input: {
  threadId: string;
}) => Promise<ThreadSummary>;

let summaryHandler: SummaryHandler | undefined;
const logMessages: string[] = [];

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
        return { branchName: "feature/hover-cards", isGitRepo: true };
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
    threads: {
      async get() {
        return {
          environmentId: "env_1",
          projectId: "proj_1",
          runtime: { displayStatus: "active" },
          updatedAt: 123,
        };
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
    },
  },
};

plugin(fakeBb as never);
assert.ok(summaryHandler, "registers the threadSummary RPC handler");

const summary = await summaryHandler({ threadId: "thr_1" });
assert.deepEqual(summary, {
  latestUserMessage: "Fix the hover card today",
  pullRequest: {
    kind: "available",
    number: 42,
    signal: "Checks failing",
    state: "open",
    title: "Add thread hover cards",
  },
  repository: {
    branch: "feature/hover-cards",
    isGitRepository: true,
    name: "acme/bb-plugin-thread-hover-cards",
  },
  status: "active",
  updatedAt: 123,
});
assert.deepEqual(logMessages, ["Thread hover cards loaded."]);
