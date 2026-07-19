import { definePluginApp } from "@bb/plugin-sdk/app";
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  ClaudeIcon,
  CursorIcon,
  Folder01Icon,
  LaptopIcon,
  LinkSquare01Icon,
  Loading03Icon,
  OpenAiIcon,
  PiIcon,
  SourceCodeIcon,
} from "./icons";
import type { ThreadSummary } from "./server";
import { HOVER_CARD_CSS } from "./styles";
import { markdownPreview } from "./markdown-preview";

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

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
type HugeiconDefinition = readonly (
  readonly [string, { readonly [key: string]: string | number }]
)[];

interface StatusPresentation {
  animated: boolean;
  icon: HugeiconDefinition | null;
  iconName:
    | "CancelCircleIcon"
    | "CheckmarkCircle02Icon"
    | "Loading03Icon"
    | null;
  label: string;
  tone: "danger" | "muted" | "success" | "warning" | "working";
}

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

function icon(
  definition: HugeiconDefinition,
  name: string,
  className: string,
): SVGSVGElement {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.classList.add(...className.split(/\s+/).filter(Boolean));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("data-icon", name);
  svg.setAttribute("aria-hidden", "true");

  for (const [tag, attributes] of definition) {
    const child = document.createElementNS(SVG_NAMESPACE, tag);
    for (const [attribute, value] of Object.entries(attributes)) {
      if (attribute === "key" || value === undefined || value === null) {
        continue;
      }
      const normalizedAttribute = attribute.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`,
      );
      child.setAttribute(normalizedAttribute, String(value));
    }
    svg.append(child);
  }

  return svg;
}

function statusPresentation(
  status: ThreadSummary["status"],
): StatusPresentation {
  switch (status) {
    case "active":
    case "host-reconnecting":
    case "provisioning":
    case "starting":
    case "stopping":
      return {
        animated: true,
        icon: Loading03Icon,
        iconName: "Loading03Icon",
        label: "Agent working",
        tone: "working",
      };
    case "error":
      return {
        animated: false,
        icon: CancelCircleIcon,
        iconName: "CancelCircleIcon",
        label: "Thread failed",
        tone: "danger",
      };
    case "waiting-for-host":
      return {
        animated: false,
        icon: null,
        iconName: null,
        label: "Waiting for host",
        tone: "warning",
      };
    case "idle":
      return {
        animated: false,
        icon: CheckmarkCircle02Icon,
        iconName: "CheckmarkCircle02Icon",
        label: "Agent finished",
        tone: "success",
      };
  }
}

function pullRequestTone(
  pullRequest: Extract<ThreadSummary["pullRequest"], { kind: "available" }>,
): "danger" | "muted" | "success" | "warning" {
  const signal = pullRequest.signal.toLowerCase();
  if (
    signal.includes("failing") ||
    signal.includes("blocked") ||
    signal.includes("changes requested") ||
    signal.includes("conflict")
  ) {
    return "danger";
  }
  if (
    pullRequest.state === "merged" ||
    signal.includes("passing") ||
    signal.includes("ready to merge")
  ) {
    return "success";
  }
  if (
    pullRequest.state === "draft" ||
    signal.includes("pending") ||
    signal.includes("review requested")
  ) {
    return "warning";
  }
  return "muted";
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

function runTime(timestamp: number): string {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  const seconds = elapsedSeconds % 60;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 1) return `${seconds}s`;

  const minutes = elapsedMinutes % 60;
  const hours = Math.floor(elapsedMinutes / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function refreshTimes(card: HTMLElement): void {
  const runtime = card.querySelector<HTMLElement>("[data-turn-started-at]");
  if (runtime) {
    const timestamp = Number(runtime.dataset.turnStartedAt);
    runtime.textContent = `Run ${runTime(timestamp)}`;
  }

  const updated = card.querySelector<HTMLElement>("[data-updated-at]");
  if (updated) {
    const timestamp = Number(updated.dataset.updatedAt);
    updated.textContent = `Updated ${relativeTime(timestamp)}`;
  }
}

interface InlinePattern {
  match: RegExpMatchArray;
  type: "code" | "emphasis" | "image" | "link" | "strike" | "strong";
}

function nextInlinePattern(source: string): InlinePattern | null {
  const patterns: Array<[InlinePattern["type"], RegExp]> = [
    ["image", /!\[([^\]]*)\]\([^)]+\)/],
    ["link", /\[([^\]]+)\]\([^)]+\)/],
    ["code", /`([^`\n]+)`/],
    ["strong", /(?:\*\*|__)(.+?)(?:\*\*|__)/],
    ["strike", /~~(.+?)~~/],
    ["emphasis", /(?:\*|_)([^*_\n]+)(?:\*|_)/],
  ];
  let next: InlinePattern | null = null;
  for (const [type, pattern] of patterns) {
    const match = source.match(pattern);
    if (!match || match.index === undefined) continue;
    if (!next || match.index < (next.match.index ?? Number.POSITIVE_INFINITY)) {
      next = { match, type };
    }
  }
  return next;
}

function appendInlineMarkdown(
  parent: HTMLElement,
  source: string,
  allowEmphasis: boolean,
): void {
  let remaining = source;
  while (remaining) {
    const next = nextInlinePattern(remaining);
    if (!next || next.match.index === undefined) {
      parent.append(
        document.createTextNode(
          remaining.replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, "$1"),
        ),
      );
      return;
    }

    if (next.match.index > 0) {
      parent.append(
        document.createTextNode(
          remaining
            .slice(0, next.match.index)
            .replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, "$1"),
        ),
      );
    }

    const value = next.match[1] ?? "";
    if (next.type === "code") {
      parent.append(element("code", "bb-thread-hover-card__inline-code", value));
    } else if (next.type === "image") {
      parent.append(document.createTextNode(value || "Image"));
    } else if (next.type === "link") {
      const label = element("span", "bb-thread-hover-card__inline-link");
      appendInlineMarkdown(label, value, allowEmphasis);
      parent.append(label);
    } else if (next.type === "strike") {
      const strike = element("s", "bb-thread-hover-card__inline-strike");
      appendInlineMarkdown(strike, value, allowEmphasis);
      parent.append(strike);
    } else if (allowEmphasis) {
      const emphasis = element(
        next.type === "strong" ? "strong" : "em",
        next.type === "strong"
          ? "bb-thread-hover-card__inline-strong"
          : "bb-thread-hover-card__inline-emphasis",
      );
      appendInlineMarkdown(emphasis, value, allowEmphasis);
      parent.append(emphasis);
    } else {
      appendInlineMarkdown(parent, value, allowEmphasis);
    }

    remaining = remaining.slice(next.match.index + next.match[0].length);
  }
}

function messagePreview(
  source: string,
  allowEmphasis: boolean,
): HTMLParagraphElement {
  const message = element("p", "bb-thread-hover-card__message");
  const preview = markdownPreview(source);
  if (preview) {
    message.dataset.markdownBlock = preview.kind;
    appendInlineMarkdown(message, preview.inline, allowEmphasis);
  }
  return message;
}

function providerIcon(
  provider: ThreadSummary["provider"],
): HTMLImageElement | SVGSVGElement {
  if (provider.logoUrl) {
    const image = element(
      "img",
      "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon",
    );
    image.src = provider.logoUrl;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.addEventListener(
      "error",
      () => {
        image.replaceWith(
          icon(
            SourceCodeIcon,
            "SourceCodeIcon",
            "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon",
          ),
        );
      },
      { once: true },
    );
    return image;
  }

  const providerDefinition =
    provider.id === "codex"
      ? { definition: OpenAiIcon, name: "OpenAiIcon", viewBox: "0 0 24 24" }
      : provider.id === "claude-code"
        ? { definition: ClaudeIcon, name: "ClaudeIcon", viewBox: "0 0 149 149" }
        : provider.id === "pi"
          ? { definition: PiIcon, name: "PiIcon", viewBox: "100 100 600 600" }
          : provider.id === "acp-cursor"
            ? {
                definition: CursorIcon,
                name: "CursorIcon",
                viewBox: "0 0 24 24",
              }
            : {
                definition: SourceCodeIcon,
                name: "SourceCodeIcon",
                viewBox: "0 0 24 24",
              };
  const providerMark = icon(
    providerDefinition.definition,
    providerDefinition.name,
    "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon",
  );
  providerMark.setAttribute("viewBox", providerDefinition.viewBox);
  return providerMark;
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
  const provider = element("div", "bb-thread-hover-card__provider");
  provider.setAttribute(
    "aria-label",
    `${summary.provider.displayName}, ${summary.provider.model}`,
  );
  provider.title = `${summary.provider.displayName} · ${summary.provider.model}`;
  provider.append(
    providerIcon(summary.provider),
    element(
      "span",
      "bb-thread-hover-card__provider-model bb-thread-hover-card__truncate",
      summary.provider.model,
    ),
  );
  header.append(provider);

  const times = element("div", "bb-thread-hover-card__times");
  if (summary.currentTurnStartedAt !== null) {
    const runtime = element("span", "bb-thread-hover-card__runtime");
    runtime.dataset.turnStartedAt = String(summary.currentTurnStartedAt);
    times.append(runtime);
  }
  const updated = element("span", "bb-thread-hover-card__updated");
  updated.dataset.updatedAt = String(summary.updatedAt);
  times.append(updated);
  header.append(times);

  const content: HTMLElement[] = [header];
  const showsAssistantMessage =
    summary.status === "idle" && summary.latestAssistantMessage !== null;
  const summaryMessage = showsAssistantMessage
    ? summary.latestAssistantMessage
    : summary.latestUserMessage;

  if (summaryMessage) {
    const request = element("section", "bb-thread-hover-card__summary");
    const statusDetails = statusPresentation(summary.status);
    if (statusDetails.icon && statusDetails.iconName) {
      const statusIcon = icon(
        statusDetails.icon,
        statusDetails.iconName,
        "bb-thread-hover-card__icon bb-thread-hover-card__status-icon",
      );
      statusIcon.dataset.tone = statusDetails.tone;
      if (statusDetails.animated) statusIcon.dataset.animated = "true";
      statusIcon.removeAttribute("aria-hidden");
      statusIcon.setAttribute("aria-label", statusDetails.label);
      statusIcon.setAttribute("role", "img");
      request.append(statusIcon);
    }
    request.append(messagePreview(summaryMessage, showsAssistantMessage));
    content.push(request);
  }

  const repository = element(
    "section",
    "bb-thread-hover-card__repository",
  );
  if (!summary.repository.isGitRepository) {
    repository.append(
      icon(
        LaptopIcon,
        "LaptopIcon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon",
      ),
      element("span", "bb-thread-hover-card__local", "Local"),
    );
  } else {
    repository.append(
      icon(
        Folder01Icon,
        "Folder01Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon",
      ),
      element("span", "bb-thread-hover-card__truncate", summary.repository.name),
    );
    if (summary.repository.branch) {
      repository.append(
        element(
          "span",
          "bb-thread-hover-card__branch",
          summary.repository.branch,
        ),
      );
    }

    if (summary.pullRequest.kind !== "absent") {
      const pullRequestLine = element("span", "bb-thread-hover-card__pr");
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
            `#${summary.pullRequest.number}`,
          ),
        );
        const pullRequestStatus = element(
          "span",
          "bb-thread-hover-card__pr-status",
          summary.pullRequest.signal,
        );
        pullRequestStatus.dataset.tone = pullRequestTone(summary.pullRequest);
        pullRequestLink.append(
          pullRequestStatus,
          icon(
            LinkSquare01Icon,
            "LinkSquare01Icon",
            "bb-thread-hover-card__icon bb-thread-hover-card__link-icon",
          ),
        );
        pullRequestLine.append(
          element("span", "bb-thread-hover-card__meta-label", "PR"),
          pullRequestLink,
        );
      } else {
        pullRequestLine.append(
          element("span", "bb-thread-hover-card__meta-label", "PR"),
          element("span", "", "PR unavailable"),
        );
      }
      repository.append(pullRequestLine);
    }
  }
  content.push(repository);

  card.replaceChildren(...content);
  refreshTimes(card);
}

function installHoverCards(): HoverCardController {
  let card: HTMLDivElement | null = null;
  let activeTrigger: HTMLAnchorElement | null = null;
  let openTimer: ReturnType<typeof setTimeout> | null = null;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;
  let timeTimer: ReturnType<typeof setInterval> | null = null;
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
    if (timeTimer) clearInterval(timeTimer);
    timeTimer = setInterval(() => {
      if (card && !card.hidden) refreshTimes(card);
    }, 1_000);

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
    if (timeTimer) {
      clearInterval(timeTimer);
      timeTimer = null;
    }
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
