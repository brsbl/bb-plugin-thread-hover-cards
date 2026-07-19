import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

const dom = new JSDOM(
  `<head>
    <link data-bb-plugin-css="thread-hover-cards" href="/plugins/thread-hover-cards/app.css">
  </head>
  <body>
    <div class="group/thread-row">
      <a data-sidebar-thread-id="thr_1" href="/threads/thr_1">Thread</a>
    </div>
  </body>`,
  { url: "http://localhost" },
);

const { window } = dom;
Object.assign(globalThis, {
  document: window.document,
  Element: window.Element,
  Event: window.Event,
  FocusEvent: window.FocusEvent,
  HTMLElement: window.HTMLElement,
  KeyboardEvent: window.KeyboardEvent,
  MutationObserver: window.MutationObserver,
  Node: window.Node,
  PointerEvent: window.PointerEvent,
  window,
  requestAnimationFrame(callback) {
    callback(0);
    return 1;
  },
});

const requestBodies = [];
let delayedRefresh = null;
let delayNextRefreshFor = null;
globalThis.fetch = async (_url, init) => {
  const request = JSON.parse(init.body);
  requestBodies.push(request);
  const isLocal = request.threadId === "thr_local";
  const hasNoPullRequest = request.threadId === "thr_no_pr";
  const pullRequestUnavailable = request.threadId === "thr_pr_unavailable";
  const response = new Response(
    JSON.stringify({
      ok: true,
      result: {
        currentTurnStartedAt: isLocal ? null : Date.now() - 65_000,
        latestAssistantMessage: isLocal
          ? "**Done**—hover cards are *ready* for foo_bar_baz, \\_literal\\_, and __tests__ with `Cmd+R`.\n\n## Canary\nIgnore this secondary section.\n\n| Work | PR | Status |\n| --- | --- | --- |\n| Hover cards | #42 | Ready |"
          : null,
        latestUserMessage:
          "**Create** concise hover cards for foo_bar_baz and \\_literal\\_",
        pullRequest:
          isLocal || hasNoPullRequest
            ? { kind: "absent" }
            : pullRequestUnavailable
              ? { kind: "unavailable" }
              : {
              kind: "available",
              number: 42,
              signal: "Checks passing",
              state: "open",
              title: "Thread previews",
              url: "https://github.com/acme/bb/pull/42",
            },
        provider: {
          displayName: "Codex",
          id: "codex",
          logoUrl: null,
          model: "GPT-5.6-Sol",
        },
        repository: isLocal
          ? {
              branch: null,
              isGitRepository: false,
              name: "Personal",
            }
          : {
              branch: "feature/hover-cards",
              isGitRepository: true,
              name: "acme/bb",
            },
        status: isLocal ? "idle" : "active",
        updatedAt: Date.now(),
      },
    }),
    { headers: { "content-type": "application/json" }, status: 200 },
  );
  if (delayNextRefreshFor === request.threadId) {
    delayNextRefreshFor = null;
    return new Promise((resolve) => {
      delayedRefresh = () => resolve(response);
    });
  }
  return response;
};

globalThis.__bbPluginRuntime = {
  pluginSdkApp: {
    definePluginApp(setup) {
      return { __bbPluginApp: true, setup };
    },
  },
};

await import("../dist/app.js");
window.document.dispatchEvent(
  new window.Event("DOMContentLoaded", { bubbles: true }),
);

const trigger = window.document.querySelector("[data-sidebar-thread-id]");
assert.ok(trigger);

const style = window.document.getElementById("bb-thread-hover-card-styles");
assert.ok(style);
assert.match(style.textContent, /\.bb-thread-hover-card \{/);
assert.match(
  style.textContent,
  /background: color-mix\(in srgb, var\(--popover\) 82%, transparent\)/,
);
assert.match(style.textContent, /backdrop-filter: blur\(18px\)/);
assert.match(style.textContent, /var\(--foreground\) 4%, transparent/);
assert.match(style.textContent, /font-weight: 400/);
assert.match(
  style.textContent,
  /\.bb-thread-hover-card__message[\s\S]*?font-weight: 350/,
);
assert.match(
  style.textContent,
  /\.bb-thread-hover-card__header[\s\S]*?var\(--font-mono/,
);
assert.match(
  style.textContent,
  /\.bb-thread-hover-card__repository[\s\S]*?var\(--font-mono/,
);
assert.match(style.textContent, /\.bb-thread-hover-card__branch-row/);
assert.match(style.textContent, /max-width: 100%/);
assert.match(style.textContent, /\.bb-thread-hover-card__pr-status/);
assert.match(style.textContent, /var\(--success\) 9%, transparent/);
assert.match(style.textContent, /@supports not/);

const pointerOver = new window.Event("pointerover", { bubbles: true });
Object.defineProperties(pointerOver, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: null },
});
trigger.dispatchEvent(pointerOver);
await new Promise((resolve) => setTimeout(resolve, 120));

assert.equal(window.document.getElementById("bb-thread-hover-card"), null);
await new Promise((resolve) => setTimeout(resolve, 60));

const card = window.document.getElementById("bb-thread-hover-card");
assert.ok(card);
assert.equal(card.hidden, false);
assert.equal(card.dataset.bbPlugin, "thread-hover-cards");
assert.equal(card.hasAttribute("data-bb-portaled-overlay"), true);
assert.equal(trigger.getAttribute("aria-describedby"), "bb-thread-hover-card");
assert.deepEqual(requestBodies, [{ threadId: "thr_1" }]);
assert.doesNotMatch(card.textContent, /Agent working/);
assert.equal(
  card.querySelector(".bb-thread-hover-card__runtime [data-time-value]")
    ?.textContent,
  "1m",
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__updated [data-time-value]")
    ?.textContent,
  "now",
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__runtime .bb-thread-hover-card__sr-only")
    ?.textContent,
  "Run time ",
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__updated .bb-thread-hover-card__sr-only")
    ?.textContent,
  "Updated ",
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__provider .bb-thread-hover-card__sr-only")
    ?.textContent,
  "Codex, ",
);
assert.ok(card.querySelector('[data-icon="AlarmClockIcon"]'));
assert.ok(card.querySelector('[data-icon="Appointment02Icon"]'));
assert.match(
  card.textContent,
  /Create concise hover cards for foo_bar_baz and _literal_/,
);
assert.equal(card.querySelector(".bb-thread-hover-card__inline-strong"), null);
assert.equal(card.querySelector(".bb-thread-hover-card__inline-emphasis"), null);
assert.match(card.textContent, /5\.6-Sol/);
assert.doesNotMatch(card.textContent, /gpt-5\.6-sol/);
assert.match(card.textContent, /acme\/bb/);
assert.match(card.textContent, /#42Checks passing/);
assert.doesNotMatch(card.textContent, /Latest request/i);
assert.ok(card.querySelector('[data-icon="Loading03Icon"]'));
assert.ok(
  card
    .querySelector(".bb-thread-hover-card__summary")
    ?.querySelector('[data-icon="Loading03Icon"]'),
);
assert.ok(card.querySelector('[data-icon="OpenAiIcon"]'));
assert.ok(
  card
    .querySelector(".bb-thread-hover-card__header")
    ?.querySelector('[data-icon="OpenAiIcon"]'),
);
assert.ok(card.querySelector('[data-icon="Folder01Icon"]'));
assert.ok(card.querySelector('[data-icon="LinkSquare01Icon"]'));
assert.equal(
  card.querySelector(".bb-thread-hover-card__provider")?.parentElement,
  card.querySelector(".bb-thread-hover-card__header"),
);
assert.equal(card.querySelectorAll(".bb-thread-hover-card__repository").length, 1);

const pullRequestLink = card.querySelector(".bb-thread-hover-card__pr-link");
assert.ok(pullRequestLink);
assert.equal(
  pullRequestLink.firstElementChild?.getAttribute("data-icon"),
  "LinkSquare01Icon",
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__repository")?.nextElementSibling,
  card.querySelector(".bb-thread-hover-card__branch-row"),
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__branch")?.parentElement,
  card.querySelector(".bb-thread-hover-card__branch-row"),
);
assert.equal(
  card.querySelector(".bb-thread-hover-card__pr .bb-thread-hover-card__meta-label"),
  null,
);
assert.equal(pullRequestLink.href, "https://github.com/acme/bb/pull/42");
assert.equal(pullRequestLink.target, "_blank");
assert.equal(
  card.querySelector(".bb-thread-hover-card__pr-status")?.dataset.tone,
  "success",
);

trigger.focus();
const focusedPointerOut = new window.Event("pointerout", { bubbles: true });
Object.defineProperties(focusedPointerOut, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: window.document.body },
});
trigger.dispatchEvent(focusedPointerOut);
await new Promise((resolve) => setTimeout(resolve, 140));
assert.equal(card.hidden, false);

trigger.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Tab" }),
);
assert.equal(window.document.activeElement, pullRequestLink);

card.dispatchEvent(new window.Event("pointerleave"));
await new Promise((resolve) => setTimeout(resolve, 140));
assert.equal(card.hidden, false);
assert.equal(window.document.activeElement, pullRequestLink);

pullRequestLink.dispatchEvent(
  new window.KeyboardEvent("keydown", {
    bubbles: true,
    key: "Tab",
    shiftKey: true,
  }),
);
assert.equal(window.document.activeElement, trigger);

trigger.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Tab" }),
);
pullRequestLink.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
);
assert.equal(card.hidden, true);
assert.equal(trigger.hasAttribute("aria-describedby"), false);
assert.equal(window.document.activeElement, trigger);
await new Promise((resolve) => setTimeout(resolve, 20));
assert.equal(card.hidden, true);

const realDateNow = Date.now;
Date.now = () => realDateNow() + 11_000;
delayNextRefreshFor = "thr_1";
trigger.blur();
trigger.focus();
await new Promise((resolve) => setTimeout(resolve, 20));

assert.equal(card.hidden, false);
const stalePullRequestLink = card.querySelector(
  ".bb-thread-hover-card__pr-link",
);
assert.ok(stalePullRequestLink);
trigger.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Tab" }),
);
assert.equal(window.document.activeElement, stalePullRequestLink);
assert.ok(delayedRefresh);
delayedRefresh();
await new Promise((resolve) => setTimeout(resolve, 20));

const refreshedPullRequestLink = card.querySelector(
  ".bb-thread-hover-card__pr-link",
);
assert.ok(refreshedPullRequestLink);
assert.notEqual(refreshedPullRequestLink, stalePullRequestLink);
assert.equal(window.document.activeElement, refreshedPullRequestLink);
Date.now = realDateNow;
delayedRefresh = null;
refreshedPullRequestLink.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
);
assert.equal(card.hidden, true);

trigger.dataset.sidebarThreadId = "thr_2";
const quickPointerOver = new window.Event("pointerover", { bubbles: true });
Object.defineProperties(quickPointerOver, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: null },
});
trigger.dispatchEvent(quickPointerOver);
await new Promise((resolve) => setTimeout(resolve, 50));

const quickPointerOut = new window.Event("pointerout", { bubbles: true });
Object.defineProperties(quickPointerOut, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: window.document.body },
});
trigger.dispatchEvent(quickPointerOut);
await new Promise((resolve) => setTimeout(resolve, 280));

assert.equal(card.hidden, true);
assert.deepEqual(requestBodies, [
  { threadId: "thr_1" },
  { threadId: "thr_1" },
]);

trigger.blur();
trigger.dataset.sidebarThreadId = "thr_local";
trigger.focus();
await new Promise((resolve) => setTimeout(resolve, 20));

assert.equal(card.hidden, false);
assert.match(card.textContent, /Local/);
assert.match(
  card.textContent,
  /Done—hover cards are ready for foo_bar_baz, _literal_, and tests with Cmd\+R\./,
);
assert.doesNotMatch(card.textContent, /Create concise hover cards/);
assert.doesNotMatch(card.textContent, /##|\|\s*Work\s*\||---|Canary/);
assert.doesNotMatch(card.textContent, /No Git repository/);
assert.ok(card.querySelector(".bb-thread-hover-card__inline-strong"));
assert.ok(card.querySelector(".bb-thread-hover-card__inline-emphasis"));
assert.ok(card.querySelector(".bb-thread-hover-card__inline-code"));
assert.ok(card.querySelector('[data-icon="LaptopIcon"]'));
assert.ok(card.querySelector('[data-icon="CheckmarkCircle02Icon"]'));
assert.equal(
  card.querySelector(".bb-thread-hover-card__status-icon")?.dataset.tone,
  "success",
);
assert.equal(card.querySelector(".bb-thread-hover-card__runtime"), null);
assert.deepEqual(requestBodies, [
  { threadId: "thr_1" },
  { threadId: "thr_1" },
  { threadId: "thr_local" },
]);

trigger.blur();
await new Promise((resolve) => setTimeout(resolve, 140));
trigger.dataset.sidebarThreadId = "thr_no_pr";
trigger.focus();
await new Promise((resolve) => setTimeout(resolve, 20));

assert.equal(card.hidden, false);
assert.match(card.textContent, /acme\/bb/);
assert.doesNotMatch(card.textContent, /No PR/);
assert.equal(card.querySelector(".bb-thread-hover-card__pr"), null);
assert.equal(card.querySelectorAll(".bb-thread-hover-card__repository").length, 1);
assert.deepEqual(requestBodies, [
  { threadId: "thr_1" },
  { threadId: "thr_1" },
  { threadId: "thr_local" },
  { threadId: "thr_no_pr" },
]);

trigger.blur();
await new Promise((resolve) => setTimeout(resolve, 140));
trigger.dataset.sidebarThreadId = "thr_pr_unavailable";
trigger.focus();
await new Promise((resolve) => setTimeout(resolve, 20));

assert.equal(card.hidden, false);
assert.equal(card.querySelector(".bb-thread-hover-card__pr"), null);
assert.doesNotMatch(card.textContent, /PR unavailable/);
assert.deepEqual(requestBodies, [
  { threadId: "thr_1" },
  { threadId: "thr_1" },
  { threadId: "thr_local" },
  { threadId: "thr_no_pr" },
  { threadId: "thr_pr_unavailable" },
]);

const pluginCssLink = window.document.querySelector(
  'link[data-bb-plugin-css="thread-hover-cards"]',
);
assert.ok(pluginCssLink);
pluginCssLink.remove();
await new Promise((resolve) => setTimeout(resolve, 0));

assert.equal(card.isConnected, false);
assert.equal(window.document.getElementById("bb-thread-hover-card-styles"), null);

const replacementCssLink = window.document.createElement("link");
replacementCssLink.dataset.bbPluginCss = "thread-hover-cards";
replacementCssLink.href = "/plugins/thread-hover-cards/app.css?hash=next";
window.document.head.append(replacementCssLink);
await new Promise((resolve) => setTimeout(resolve, 0));

assert.ok(window.document.getElementById("bb-thread-hover-card-styles"));

trigger.blur();
trigger.dataset.sidebarThreadId = "thr_reload";
const reloadPointerOver = new window.Event("pointerover", { bubbles: true });
Object.defineProperties(reloadPointerOver, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: null },
});
trigger.dispatchEvent(reloadPointerOver);
await new Promise((resolve) => setTimeout(resolve, 120));

assert.equal(window.document.getElementById("bb-thread-hover-card"), null);
await new Promise((resolve) => setTimeout(resolve, 60));

const reloadedCard = window.document.getElementById("bb-thread-hover-card");
assert.ok(reloadedCard);
assert.equal(reloadedCard.hidden, false);
assert.deepEqual(requestBodies, [
  { threadId: "thr_1" },
  { threadId: "thr_1" },
  { threadId: "thr_local" },
  { threadId: "thr_no_pr" },
  { threadId: "thr_pr_unavailable" },
  { threadId: "thr_reload" },
]);
trigger.focus();
const reloadedPullRequestLink = reloadedCard.querySelector(
  ".bb-thread-hover-card__pr-link",
);
assert.ok(reloadedPullRequestLink);
trigger.dispatchEvent(
  new window.KeyboardEvent("keydown", { bubbles: true, key: "Tab" }),
);
assert.equal(window.document.activeElement, reloadedPullRequestLink);

globalThis.__bbThreadHoverCards?.dispose();
assert.equal(window.document.getElementById("bb-thread-hover-card-styles"), null);
dom.window.close();
