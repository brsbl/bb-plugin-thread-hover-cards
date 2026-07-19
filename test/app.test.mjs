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
globalThis.fetch = async (_url, init) => {
  requestBodies.push(JSON.parse(init.body));
  return new Response(
    JSON.stringify({
      ok: true,
      result: {
        latestUserMessage: "Create concise hover cards",
        pullRequest: {
          kind: "available",
          number: 42,
          signal: "Checks passing",
          state: "open",
          title: "Thread previews",
          url: "https://github.com/acme/bb/pull/42",
        },
        repository: {
          branch: "feature/hover-cards",
          isGitRepository: true,
          name: "acme/bb",
        },
        status: "active",
        updatedAt: Date.now(),
      },
    }),
    { headers: { "content-type": "application/json" }, status: 200 },
  );
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
assert.match(style.textContent, /@supports not/);

const pointerOver = new window.Event("pointerover", { bubbles: true });
Object.defineProperties(pointerOver, {
  pointerType: { value: "mouse" },
  relatedTarget: { value: null },
});
trigger.dispatchEvent(pointerOver);
await new Promise((resolve) => setTimeout(resolve, 180));

const card = window.document.getElementById("bb-thread-hover-card");
assert.ok(card);
assert.equal(card.hidden, false);
assert.equal(card.dataset.bbPlugin, "thread-hover-cards");
assert.equal(card.hasAttribute("data-bb-portaled-overlay"), true);
assert.equal(trigger.getAttribute("aria-describedby"), "bb-thread-hover-card");
assert.deepEqual(requestBodies, [{ threadId: "thr_1" }]);
assert.match(card.textContent, /Working/);
assert.match(card.textContent, /Create concise hover cards/);
assert.match(card.textContent, /acme\/bb/);
assert.match(card.textContent, /#42 · Checks passing/);

const pullRequestLink = card.querySelector(".bb-thread-hover-card__pr-link");
assert.ok(pullRequestLink);
assert.equal(pullRequestLink.href, "https://github.com/acme/bb/pull/42");
assert.equal(pullRequestLink.target, "_blank");

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
assert.deepEqual(requestBodies, [{ threadId: "thr_1" }]);

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

globalThis.__bbThreadHoverCards?.dispose();
assert.equal(window.document.getElementById("bb-thread-hover-card-styles"), null);
dom.window.close();
