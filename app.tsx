import { definePluginApp } from "@bb/plugin-sdk/app";
import type { ThreadSummary } from "./server";
import { HOVER_CARD_CSS } from "./styles";

const CARD_ID = "bb-thread-hover-card";
const STYLE_ID = "bb-thread-hover-card-styles";
const PLUGIN_CSS_SELECTOR =
  'link[data-bb-plugin-css="thread-hover-cards"]';
const THREAD_TRIGGER_SELECTOR = "a[data-sidebar-thread-id]";
const THREAD_ROW_SELECTOR = ".group\\/thread-row";
const OPEN_DELAY_MS = 150;
const CLOSE_DELAY_MS = 120;
const CACHE_TTL_MS = 10_000;

interface CachedSummary {
  fetchedAt: number;
  summary: ThreadSummary;
}

interface HoverCardController {
  dispose(): void;
}

const STATUS_LABELS: Record<ThreadSummary["status"], string> = {
  active: "Working",
  error: "Error",
  "host-reconnecting": "Reconnecting",
  idle: "Idle",
  provisioning: "Provisioning",
  starting: "Starting",
  stopping: "Stopping",
  "waiting-for-host": "Waiting for host",
};

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function findThreadTrigger(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;

  const direct = target.closest<HTMLAnchorElement>(THREAD_TRIGGER_SELECTOR);
  if (direct) return direct;

  const row = target.closest<HTMLElement>(THREAD_ROW_SELECTOR);
  return row?.querySelector<HTMLAnchorElement>(THREAD_TRIGGER_SELECTOR) ?? null;
}

function threadIdFor(trigger: HTMLAnchorElement): string | null {
  const value = trigger.dataset.sidebarThreadId?.trim();
  return value ? value : null;
}

function relativeTime(timestamp: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 10) return "now";
  if (elapsedSeconds < 60) return `${elapsedSeconds}s`;

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) return `${elapsedMinutes}m`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours}h`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(timestamp);
}

async function fetchSummary(threadId: string): Promise<ThreadSummary> {
  const response = await fetch(
    "/api/v1/plugins/thread-hover-cards/rpc/threadSummary",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ threadId }),
    },
  );
  const envelope = (await response.json()) as
    | { ok: true; result: ThreadSummary }
    | { ok: false; error?: { message?: string } };

  if (!response.ok || !envelope.ok) {
    throw new Error(
      envelope.ok ? "Thread summary request failed." : envelope.error?.message,
    );
  }
  return envelope.result;
}

function renderLoading(card: HTMLElement): void {
  card.replaceChildren(
    element(
      "p",
      "bb-thread-hover-card__loading",
      "Loading thread summary…",
    ),
  );
}

function renderError(card: HTMLElement): void {
  card.replaceChildren(
    element("p", "bb-thread-hover-card__loading", "Summary unavailable"),
  );
}

function renderSummary(card: HTMLElement, summary: ThreadSummary): void {
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
      relativeTime(summary.updatedAt),
    ),
  );

  const content: HTMLElement[] = [header];

  if (summary.latestUserMessage) {
    const request = element("section", "bb-thread-hover-card__section");
    request.append(
      element("p", "bb-thread-hover-card__eyebrow", "Latest request"),
      element(
        "p",
        "bb-thread-hover-card__message",
        summary.latestUserMessage,
      ),
    );
    content.push(request);
  }

  const repository = element(
    "section",
    "bb-thread-hover-card__repository",
  );
  if (!summary.repository.isGitRepository) {
    repository.append(
      element("p", "bb-thread-hover-card__meta", "No Git repository"),
    );
  } else {
    const repoLine = element("p", "bb-thread-hover-card__meta");
    repoLine.append(
      element("span", "bb-thread-hover-card__meta-label", "Repo"),
      element("span", "bb-thread-hover-card__truncate", summary.repository.name),
    );
    if (summary.repository.branch) {
      repoLine.append(
        element(
          "span",
          "bb-thread-hover-card__branch",
          summary.repository.branch,
        ),
      );
    }
    repository.append(repoLine);

    const pullRequestLine = element("p", "bb-thread-hover-card__meta");
    pullRequestLine.classList.add("bb-thread-hover-card__pr");
    pullRequestLine.dataset.kind = summary.pullRequest.kind;
    if (summary.pullRequest.kind === "available") {
      const pullRequestLink = element(
        "a",
        "bb-thread-hover-card__pr-link",
      );
      pullRequestLink.href = summary.pullRequest.url;
      pullRequestLink.target = "_blank";
      pullRequestLink.rel = "noopener noreferrer";
      pullRequestLink.setAttribute(
        "aria-label",
        `Pull request #${summary.pullRequest.number}: ${summary.pullRequest.title}. ${summary.pullRequest.signal}. Opens in a new tab.`,
      );
      pullRequestLink.title = summary.pullRequest.title;
      pullRequestLink.append(
        element(
          "span",
          "bb-thread-hover-card__truncate",
          `#${summary.pullRequest.number} · ${summary.pullRequest.signal}`,
        ),
      );
      const externalMark = element(
        "span",
        "bb-thread-hover-card__external-mark",
        "↗",
      );
      externalMark.setAttribute("aria-hidden", "true");
      pullRequestLink.append(externalMark);
      pullRequestLine.append(
        element("span", "bb-thread-hover-card__meta-label", "PR"),
        pullRequestLink,
      );
    } else {
      pullRequestLine.textContent =
        summary.pullRequest.kind === "absent"
          ? "No pull request"
          : "Pull request unavailable";
    }
    repository.append(pullRequestLine);
  }
  content.push(repository);

  card.replaceChildren(...content);
}

function installHoverCards(): HoverCardController {
  let card: HTMLDivElement | null = null;
  let activeTrigger: HTMLAnchorElement | null = null;
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;
  let requestGeneration = 0;
  const cache = new Map<string, CachedSummary>();
  const pending = new Map<string, Promise<ThreadSummary>>();
  const style = element("style", "");
  style.id = STYLE_ID;
  style.textContent = HOVER_CARD_CSS;
  document.getElementById(STYLE_ID)?.remove();
  document.head.append(style);

  function ensureCard(): HTMLDivElement {
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

  function positionCard(): void {
    if (!card || !activeTrigger || card.hidden) return;

    const anchor =
      activeTrigger.closest<HTMLElement>(THREAD_ROW_SELECTOR) ?? activeTrigger;
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
      Math.max(margin, window.innerHeight - cardRect.height - margin),
    );
    card.style.left = `${Math.round(left)}px`;
    card.style.top = `${Math.round(top)}px`;
  }

  function showCard(trigger: HTMLAnchorElement): void {
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

    void request
      .then((summary) => {
        cache.set(threadId, { fetchedAt: Date.now(), summary });
        if (
          disposed ||
          generation !== requestGeneration ||
          activeTrigger !== trigger
        ) {
          return;
        }
        renderSummary(hoverCard, summary);
        requestAnimationFrame(positionCard);
      })
      .catch(() => {
        if (
          !cached &&
          !disposed &&
          generation === requestGeneration &&
          activeTrigger === trigger
        ) {
          renderError(hoverCard);
          requestAnimationFrame(positionCard);
        }
      });
  }

  function cancelOpen(): void {
    if (!openTimer) return;
    clearTimeout(openTimer);
    openTimer = null;
  }

  function cancelClose(): void {
    if (!closeTimer) return;
    clearTimeout(closeTimer);
    closeTimer = null;
  }

  function scheduleOpen(trigger: HTMLAnchorElement, delay: number): void {
    cancelOpen();
    cancelClose();
    if (activeTrigger === trigger && card && !card.hidden) return;
    openTimer = setTimeout(() => {
      openTimer = null;
      showCard(trigger);
    }, delay);
  }

  function closeCard(): void {
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

  function scheduleClose(): void {
    cancelClose();
    closeTimer = setTimeout(() => {
      closeTimer = null;
      const focused = document.activeElement;
      if (
        focused === activeTrigger ||
        (focused instanceof Node && card?.contains(focused))
      ) {
        return;
      }
      closeCard();
    }, CLOSE_DELAY_MS);
  }

  function onPointerOver(event: PointerEvent): void {
    if (event.pointerType === "touch") return;
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    const previousTrigger = findThreadTrigger(event.relatedTarget);
    if (previousTrigger === trigger) return;
    scheduleOpen(trigger, OPEN_DELAY_MS);
  }

  function onPointerOut(event: PointerEvent): void {
    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    if (findThreadTrigger(event.relatedTarget) === trigger) return;
    if (event.relatedTarget instanceof Node && card?.contains(event.relatedTarget)) {
      return;
    }
    cancelOpen();
    scheduleClose();
  }

  function onFocusIn(event: FocusEvent): void {
    const trigger = findThreadTrigger(event.target);
    if (trigger) scheduleOpen(trigger, 0);
  }

  function onFocusOut(event: FocusEvent): void {
    if (event.target instanceof Node && card?.contains(event.target)) {
      if (
        event.relatedTarget instanceof Node &&
        (card.contains(event.relatedTarget) ||
          event.relatedTarget === activeTrigger)
      ) {
        return;
      }
      scheduleClose();
      return;
    }

    const trigger = findThreadTrigger(event.target);
    if (!trigger) return;
    if (findThreadTrigger(event.relatedTarget) === trigger) return;
    if (
      event.relatedTarget instanceof Node &&
      card?.contains(event.relatedTarget)
    ) {
      return;
    }
    scheduleClose();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (!activeTrigger) return;

    const pullRequestLink =
      card?.querySelector<HTMLAnchorElement>(".bb-thread-hover-card__pr-link") ??
      null;
    if (
      event.key === "Tab" &&
      !event.shiftKey &&
      event.target === activeTrigger &&
      pullRequestLink
    ) {
      event.preventDefault();
      cancelClose();
      pullRequestLink.focus();
      return;
    }
    if (
      event.key === "Tab" &&
      event.shiftKey &&
      event.target === pullRequestLink
    ) {
      event.preventDefault();
      cancelClose();
      activeTrigger.focus();
      return;
    }
    if (event.key === "Escape") {
      const trigger = activeTrigger;
      const restoreFocus =
        event.target instanceof Node && card?.contains(event.target);
      if (restoreFocus) {
        event.preventDefault();
        trigger.focus();
      }
      closeCard();
    }
  }

  function onClick(event: MouseEvent): void {
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
    },
  };
}

function installHoverCardLifecycle(): HoverCardController {
  let controller: HoverCardController | null = null;
  let disposed = false;

  function reconcile(): void {
    if (disposed) return;

    const pluginIsActive = document.querySelector(PLUGIN_CSS_SELECTOR) !== null;
    if (pluginIsActive && !controller) {
      controller = installHoverCards();
    } else if (!pluginIsActive && controller) {
      controller.dispose();
      controller = null;
    }
  }

  const observer = new MutationObserver(reconcile);
  observer.observe(document.head, { childList: true });
  reconcile();

  return {
    dispose() {
      disposed = true;
      observer.disconnect();
      controller?.dispose();
      controller = null;
    },
  };
}

const pluginGlobal = globalThis as typeof globalThis & {
  __bbThreadHoverCards?: HoverCardController;
};

function start(): void {
  pluginGlobal.__bbThreadHoverCards?.dispose();
  pluginGlobal.__bbThreadHoverCards = installHoverCardLifecycle();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    const onReady = () => start();
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
    pluginGlobal.__bbThreadHoverCards = {
      dispose() {
        document.removeEventListener("DOMContentLoaded", onReady);
      },
    };
  } else {
    start();
  }
}

// The SDK currently has no thread-row hover slot. This valid, empty app
// definition lets BB load the scoped compatibility bridge above.
export default definePluginApp(() => {});
