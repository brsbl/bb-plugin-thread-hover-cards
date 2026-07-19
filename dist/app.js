// bb-plugin-runtime-shim:@bb/plugin-sdk/app
var runtime = globalThis.__bbPluginRuntime;
if (runtime == null || runtime.pluginSdkApp == null) {
  throw new Error('Cannot load "@bb/plugin-sdk/app": this bundle must be loaded by the BB app, which provides the shared plugin runtime (globalThis.__bbPluginRuntime).');
}
var mod = runtime.pluginSdkApp;
var {
  definePluginApp,
  useBbContext,
  useBbNavigate,
  useComposer,
  useRealtime,
  useRealtimeConnectionState,
  useRpc,
  useSettings
} = mod;

// styles.ts
var HOVER_CARD_CSS = String.raw`
.bb-thread-hover-card {
  position: fixed;
  z-index: 50;
  width: min(20rem, calc(100vw - 1rem));
  max-height: calc(100vh - 1rem);
  overflow: hidden;
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 0.5rem);
  background: var(--popover);
  color: var(--popover-foreground);
  box-shadow: 0 0.75rem 2rem
    color-mix(in srgb, var(--foreground) 14%, transparent);
  font-family: inherit;
  font-size: 0.75rem;
  line-height: 1.35;
  pointer-events: auto;
  user-select: text;
}

.bb-thread-hover-card.is-visible {
  animation: bb-thread-hover-card-in 120ms ease-out both;
}

.bb-thread-hover-card__header,
.bb-thread-hover-card__status,
.bb-thread-hover-card__meta {
  display: flex;
  min-width: 0;
  align-items: center;
}

.bb-thread-hover-card__header {
  justify-content: space-between;
  gap: 0.75rem;
  font-weight: 500;
}

.bb-thread-hover-card__status {
  gap: 0.375rem;
}

.bb-thread-hover-card__status-dot {
  width: 0.45rem;
  height: 0.45rem;
  flex: none;
  border-radius: 999px;
  background: var(--muted-foreground);
}

.bb-thread-hover-card__status-dot[data-status="active"] {
  background: var(--primary);
}

.bb-thread-hover-card__status-dot[data-status="error"] {
  background: var(--destructive);
}

.bb-thread-hover-card__status-dot[data-status="provisioning"],
.bb-thread-hover-card__status-dot[data-status="starting"],
.bb-thread-hover-card__status-dot[data-status="stopping"],
.bb-thread-hover-card__status-dot[data-status="host-reconnecting"],
.bb-thread-hover-card__status-dot[data-status="waiting-for-host"] {
  background: var(--warning);
}

.bb-thread-hover-card__updated,
.bb-thread-hover-card__eyebrow,
.bb-thread-hover-card__loading,
.bb-thread-hover-card__meta-label,
.bb-thread-hover-card__repository {
  color: var(--muted-foreground);
}

.bb-thread-hover-card__updated {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.bb-thread-hover-card__section,
.bb-thread-hover-card__repository {
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid var(--border);
}

.bb-thread-hover-card__eyebrow,
.bb-thread-hover-card__message,
.bb-thread-hover-card__meta,
.bb-thread-hover-card__loading {
  margin: 0;
}

.bb-thread-hover-card__eyebrow {
  margin-bottom: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.025em;
  text-transform: uppercase;
}

.bb-thread-hover-card__message {
  display: -webkit-box;
  overflow: hidden;
  color: var(--foreground);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.bb-thread-hover-card__repository {
  display: grid;
  gap: 0.375rem;
}

.bb-thread-hover-card__meta {
  gap: 0.375rem;
}

.bb-thread-hover-card__meta-label {
  flex: none;
}

.bb-thread-hover-card__truncate {
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-thread-hover-card__branch {
  min-width: 0;
  overflow: hidden;
  padding: 0.0625rem 0.3rem;
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--foreground) 7%, transparent);
  color: var(--foreground);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.6875rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-thread-hover-card__pr[data-kind="available"]::before {
  width: 0.35rem;
  height: 0.35rem;
  flex: none;
  border-radius: 999px;
  background: var(--success);
  content: "";
}

.bb-thread-hover-card__pr-link {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.25rem;
  color: var(--foreground);
  outline: none;
  text-decoration: none;
}

.bb-thread-hover-card__pr-link:hover {
  text-decoration: underline;
  text-underline-offset: 0.125rem;
}

.bb-thread-hover-card__pr-link:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.bb-thread-hover-card__external-mark {
  flex: none;
}

.bb-thread-hover-card__loading {
  padding: 0.125rem 0;
}

@keyframes bb-thread-hover-card-in {
  from {
    opacity: 0;
    transform: translateX(-0.2rem) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .bb-thread-hover-card.is-visible {
    animation: none;
  }
}
`;

// app.tsx
var CARD_ID = "bb-thread-hover-card";
var STYLE_ID = "bb-thread-hover-card-styles";
var THREAD_TRIGGER_SELECTOR = "a[data-sidebar-thread-id]";
var THREAD_ROW_SELECTOR = ".group\\/thread-row";
var OPEN_DELAY_MS = 150;
var CLOSE_DELAY_MS = 120;
var CACHE_TTL_MS = 1e4;
var STATUS_LABELS = {
  active: "Working",
  error: "Error",
  "host-reconnecting": "Reconnecting",
  idle: "Idle",
  provisioning: "Provisioning",
  starting: "Starting",
  stopping: "Stopping",
  "waiting-for-host": "Waiting for host"
};
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== void 0) node.textContent = text;
  return node;
}
function findThreadTrigger(target) {
  if (!(target instanceof Element)) return null;
  const direct = target.closest(THREAD_TRIGGER_SELECTOR);
  if (direct) return direct;
  const row = target.closest(THREAD_ROW_SELECTOR);
  return row?.querySelector(THREAD_TRIGGER_SELECTOR) ?? null;
}
function threadIdFor(trigger) {
  const value = trigger.dataset.sidebarThreadId?.trim();
  return value ? value : null;
}
function relativeTime(timestamp) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1e3));
  if (elapsedSeconds < 10) return "now";
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;
  return new Intl.DateTimeFormat(void 0, {
    month: "short",
    day: "numeric"
  }).format(timestamp);
}
async function fetchSummary(threadId) {
  const response = await fetch(
    "/api/v1/plugins/thread-hover-cards/rpc/threadSummary",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ threadId })
    }
  );
  const envelope = await response.json();
  if (!response.ok || !envelope.ok) {
    throw new Error(
      envelope.ok ? "Thread summary request failed." : envelope.error?.message
    );
  }
  return envelope.result;
}
function renderLoading(card) {
  card.replaceChildren(
    element(
      "p",
      "bb-thread-hover-card__loading",
      "Loading thread summary\u2026"
    )
  );
}
function renderError(card) {
  card.replaceChildren(
    element("p", "bb-thread-hover-card__loading", "Summary unavailable")
  );
}
function renderSummary(card, summary) {
  const header = element("div", "bb-thread-hover-card__header");
  const status = element("div", "bb-thread-hover-card__status");
  const dot = element("span", "bb-thread-hover-card__status-dot");
  dot.dataset.status = summary.status;
  dot.setAttribute("aria-hidden", "true");
  status.append(dot, element("span", "", STATUS_LABELS[summary.status]));
  header.append(
    status,
    element(
      "span",
      "bb-thread-hover-card__updated",
      relativeTime(summary.updatedAt)
    )
  );
  const content = [header];
  if (summary.latestUserMessage) {
    const request = element("section", "bb-thread-hover-card__section");
    request.append(
      element("p", "bb-thread-hover-card__eyebrow", "Latest request"),
      element(
        "p",
        "bb-thread-hover-card__message",
        summary.latestUserMessage
      )
    );
    content.push(request);
  }
  const repository = element(
    "section",
    "bb-thread-hover-card__repository"
  );
  if (!summary.repository.isGitRepository) {
    repository.append(
      element("p", "bb-thread-hover-card__meta", "No Git repository")
    );
  } else {
    const repoLine = element("p", "bb-thread-hover-card__meta");
    repoLine.append(
      element("span", "bb-thread-hover-card__meta-label", "Repo"),
      element("span", "bb-thread-hover-card__truncate", summary.repository.name)
    );
    if (summary.repository.branch) {
      repoLine.append(
        element(
          "span",
          "bb-thread-hover-card__branch",
          summary.repository.branch
        )
      );
    }
    repository.append(repoLine);
    const pullRequestLine = element("p", "bb-thread-hover-card__meta");
    pullRequestLine.classList.add("bb-thread-hover-card__pr");
    pullRequestLine.dataset.kind = summary.pullRequest.kind;
    if (summary.pullRequest.kind === "available") {
      const pullRequestLink = element(
        "a",
        "bb-thread-hover-card__pr-link"
      );
      pullRequestLink.href = summary.pullRequest.url;
      pullRequestLink.target = "_blank";
      pullRequestLink.rel = "noopener noreferrer";
      pullRequestLink.setAttribute(
        "aria-label",
        `Pull request #${summary.pullRequest.number}: ${summary.pullRequest.title}. ${summary.pullRequest.signal}. Opens in a new tab.`
      );
      pullRequestLink.title = summary.pullRequest.title;
      pullRequestLink.append(
        element(
          "span",
          "bb-thread-hover-card__truncate",
          `#${summary.pullRequest.number} \xB7 ${summary.pullRequest.signal}`
        )
      );
      const externalMark = element(
        "span",
        "bb-thread-hover-card__external-mark",
        "\u2197"
      );
      externalMark.setAttribute("aria-hidden", "true");
      pullRequestLink.append(externalMark);
      pullRequestLine.append(
        element("span", "bb-thread-hover-card__meta-label", "PR"),
        pullRequestLink
      );
    } else {
      pullRequestLine.textContent = summary.pullRequest.kind === "absent" ? "No pull request" : "Pull request unavailable";
    }
    repository.append(pullRequestLine);
  }
  content.push(repository);
  card.replaceChildren(...content);
}
function installHoverCards() {
  let card = null;
  let activeTrigger = null;
  let openTimer = null;
  let closeTimer = null;
  let disposed = false;
  let requestGeneration = 0;
  const cache = /* @__PURE__ */ new Map();
  const pending = /* @__PURE__ */ new Map();
  const style = element("style", "");
  style.id = STYLE_ID;
  style.textContent = HOVER_CARD_CSS;
  document.getElementById(STYLE_ID)?.remove();
  document.head.append(style);
  function ensureCard() {
    if (card) return card;
    card = element("div", "bb-thread-hover-card");
    card.id = CARD_ID;
    card.hidden = true;
    card.setAttribute("data-bb-plugin", "thread-hover-cards");
    card.setAttribute("data-bb-plugin-root", "");
    card.setAttribute("data-bb-portaled-overlay", "");
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", "Thread summary");
    card.addEventListener("pointerenter", cancelClose);
    card.addEventListener("pointerleave", scheduleClose);
    document.body.append(card);
    return card;
  }
  function positionCard() {
    if (!card || !activeTrigger || card.hidden) return;
    const anchor = activeTrigger.closest(THREAD_ROW_SELECTOR) ?? activeTrigger;
    const anchorRect = anchor.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const margin = 8;
    const gap = 8;
    let left = anchorRect.right + gap;
    if (left + cardRect.width > window.innerWidth - margin) {
      left = Math.max(margin, anchorRect.left - gap - cardRect.width);
    }
    const top = Math.min(
      Math.max(margin, anchorRect.top - 4),
      Math.max(margin, window.innerHeight - cardRect.height - margin)
    );
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  }
  function showCard(trigger) {
    const threadId = threadIdFor(trigger);
    if (!threadId || disposed) return;
    activeTrigger?.removeAttribute("aria-describedby");
    activeTrigger = trigger;
    trigger.setAttribute("aria-describedby", CARD_ID);
    requestGeneration += 1;
    const generation = requestGeneration;
    const hoverCard = ensureCard();
    hoverCard.hidden = false;
    hoverCard.classList.remove("is-visible");
    void hoverCard.offsetWidth;
    hoverCard.classList.add("is-visible");
    const cached = cache.get(threadId);
    if (cached) renderSummary(hoverCard, cached.summary);
    else renderLoading(hoverCard);
    requestAnimationFrame(positionCard);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) return;
    let request = pending.get(threadId);
    if (!request) {
      request = fetchSummary(threadId).finally(() => pending.delete(threadId));
      pending.set(threadId, request);
    }
    void request.then((summary) => {
      cache.set(threadId, { fetchedAt: Date.now(), summary });
      if (disposed || generation !== requestGeneration || activeTrigger !== trigger) {
        return;
      }
      renderSummary(hoverCard, summary);
      requestAnimationFrame(positionCard);
    }).catch(() => {
      if (!cached && !disposed && generation === requestGeneration && activeTrigger === trigger) {
        renderError(hoverCard);
        requestAnimationFrame(positionCard);
      }
    });
  }
  function cancelOpen() {
    if (!openTimer) return;
    clearTimeout(openTimer);
    openTimer = null;
  }
  function cancelClose() {
    if (!closeTimer) return;
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  function scheduleOpen(trigger, delay) {
    cancelOpen();
    cancelClose();
    if (activeTrigger === trigger && card && !card.hidden) return;
    openTimer = setTimeout(() => {
      openTimer = null;
      showCard(trigger);
    }, delay);
  }
  function closeCard() {
    cancelOpen();
    cancelClose();
    requestGeneration += 1;
    activeTrigger?.removeAttribute("aria-describedby");
    activeTrigger = null;
    if (card) {
      card.hidden = true;
      card.classList.remove("is-visible");
    }
  }
  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(closeCard, CLOSE_DELAY_MS);
  }
  function onPointerOver(event) {
    if (event.pointerType === "touch") return;
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    const previousTrigger = findThreadTrigger(event.relatedTarget);
    if (previousTrigger === trigger) return;
    scheduleOpen(trigger, OPEN_DELAY_MS);
  }
  function onPointerOut(event) {
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    if (findThreadTrigger(event.relatedTarget) === trigger) return;
    if (event.relatedTarget instanceof Node && card?.contains(event.relatedTarget)) {
      return;
    }
    scheduleClose();
  }
  function onFocusIn(event) {
    const trigger = findThreadTrigger(event.target);
    if (trigger) scheduleOpen(trigger, 0);
  }
  function onFocusOut(event) {
    if (event.target instanceof Node && card?.contains(event.target)) {
      if (event.relatedTarget instanceof Node && (card.contains(event.relatedTarget) || event.relatedTarget === activeTrigger)) {
        return;
      }
      scheduleClose();
      return;
    }
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    if (findThreadTrigger(event.relatedTarget) === trigger) return;
    if (event.relatedTarget instanceof Node && card?.contains(event.relatedTarget)) {
      return;
    }
    scheduleClose();
  }
  function onKeyDown(event) {
    if (!activeTrigger) return;
    const pullRequestLink = card?.querySelector(".bb-thread-hover-card__pr-link") ?? null;
    if (event.key === "Tab" && !event.shiftKey && event.target === activeTrigger && pullRequestLink) {
      event.preventDefault();
      cancelClose();
      pullRequestLink.focus();
      return;
    }
    if (event.key === "Tab" && event.shiftKey && event.target === pullRequestLink) {
      event.preventDefault();
      cancelClose();
      activeTrigger.focus();
      return;
    }
    if (event.key === "Escape") {
      const trigger = activeTrigger;
      const restoreFocus = event.target instanceof Node && card?.contains(event.target);
      closeCard();
      if (restoreFocus) {
        event.preventDefault();
        trigger.focus();
      }
    }
  }
  function onClick(event) {
    if (findThreadTrigger(event.target)) closeCard();
  }
  document.addEventListener("pointerover", onPointerOver);
  document.addEventListener("pointerout", onPointerOut);
  document.addEventListener("focusin", onFocusIn);
  document.addEventListener("focusout", onFocusOut);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("click", onClick);
  window.addEventListener("resize", positionCard);
  window.addEventListener("scroll", positionCard, true);
  return {
    dispose() {
      disposed = true;
      closeCard();
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", positionCard);
      window.removeEventListener("scroll", positionCard, true);
      card?.remove();
      card = null;
      style.remove();
      cache.clear();
      pending.clear();
    }
  };
}
var pluginGlobal = globalThis;
function start() {
  pluginGlobal.__bbThreadHoverCards?.dispose();
  pluginGlobal.__bbThreadHoverCards = installHoverCards();
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    const onReady = () => start();
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
    pluginGlobal.__bbThreadHoverCards = {
      dispose() {
        document.removeEventListener("DOMContentLoaded", onReady);
      }
    };
  } else {
    start();
  }
}
var app_default = definePluginApp(() => {
});
export {
  app_default as default
};
