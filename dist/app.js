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

// app.tsx
var CARD_ID = "bb-thread-hover-card";
var THREAD_TRIGGER_SELECTOR = "a[data-sidebar-thread-id]";
var THREAD_ROW_SELECTOR = ".group\\/thread-row";
var OPEN_DELAY_MS = 400;
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
      pullRequestLine.append(
        element("span", "bb-thread-hover-card__meta-label", "PR"),
        element(
          "span",
          "bb-thread-hover-card__truncate",
          `#${summary.pullRequest.number} \xB7 ${summary.pullRequest.signal}`
        )
      );
      pullRequestLine.title = summary.pullRequest.title;
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
  function ensureCard() {
    if (card) return card;
    card = element("div", "bb-thread-hover-card");
    card.id = CARD_ID;
    card.hidden = true;
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
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    if (findThreadTrigger(event.relatedTarget) === trigger) return;
    scheduleClose();
  }
  function onKeyDown(event) {
    if (event.key === "Escape" && activeTrigger) closeCard();
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
