import { definePluginApp } from "@bb/plugin-sdk/app";
import {
  AlarmClockIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  ClaudeIcon,
  CursorIcon,
  Folder01Icon,
  GitBranchIcon,
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

const REASONING_LABELS: Record<
  NonNullable<ThreadSummary["provider"]["reasoningLevel"]>,
  string
> = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra High",
  ultracode: "Ultracode",
  max: "Max",
  ultra: "Ultra",
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
): "danger" | "merged" | "muted" | "success" {
  switch (pullRequest.state) {
    case "open":
      return "success";
    case "draft":
      return "muted";
    case "closed":
      return "danger";
    case "merged":
      return "merged";
  }
}

function compactLocalPath(path: string): string {
  const normalized = path.trim().replace(/[\\/]+$/, "");
  if (!normalized) return path.trim() || "Local";

  const separator =
    normalized.includes("\\") && !normalized.includes("/") ? "\\" : "/";
  const abbreviated =
    separator === "\\"
      ? normalized.replace(/^[A-Za-z]:\\Users\\[^\\]+(?=\\|$)/i, "~")
      : normalized.replace(/^\/(?:Users|home)\/[^/]+(?=\/|$)/, "~");
  const segments = abbreviated.split(/[\\/]/).filter(Boolean);

  if (
    segments[0] === "~" &&
    segments[1] === ".bb" &&
    segments.length > 3
  ) {
    return `~${separator}.bb${separator}…${separator}${segments.at(-1)}`;
  }
  if (segments.length <= 4) return abbreviated;
  if (segments[0] === "~") {
    return `~${separator}…${separator}${segments.slice(-2).join(separator)}`;
  }
  return `…${separator}${segments.slice(-3).join(separator)}`;
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

function runTime(timestamp: number, endedAt = Date.now()): string {
  const elapsedSeconds = Math.max(0, Math.floor((endedAt - timestamp) / 1000));
  const seconds = elapsedSeconds % 60;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 1) return `${seconds}s`;

  const minutes = elapsedMinutes % 60;
  const hours = Math.floor(elapsedMinutes / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function refreshRunTime(card: HTMLElement): void {
  const runtime = card.querySelector<HTMLElement>("[data-turn-started-at]");
  if (runtime) {
    const timestamp = Number(runtime.dataset.turnStartedAt);
    const endedAt = runtime.dataset.turnEndedAt
      ? Number(runtime.dataset.turnEndedAt)
      : Date.now();
    const value = runTime(timestamp, endedAt);
    runtime.querySelector<HTMLElement>("[data-time-value]")!.textContent = value;
    runtime.title = runtime.dataset.turnEndedAt
      ? `Completed in ${value}`
      : `Run time ${value}`;
  }
}

function formatModelLabel(value: string, providerId: string): string {
  const formatted = value
    .split("-")
    .map((part) => {
      if (part.toLowerCase() === "gpt") return "GPT";
      if (/^\d+(\.\d+)*$/.test(part)) return part;
      if (/^[a-z]+$/i.test(part)) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      }
      return part;
    })
    .join("-");

  if (providerId === "codex") return formatted.replace(/^GPT-/i, "");
  if (providerId === "claude-code") {
    return formatted.replace(/^Claude\s+/i, "");
  }
  return formatted;
}

function permissionLabel(
  permissionMode: ThreadSummary["permissionMode"],
): string | null {
  if (permissionMode === "full") return "Full access";
  if (permissionMode === "workspace-write") return "Workspace write";
  if (permissionMode === "readonly") return "Read only";
  return null;
}

function permissionMetadata(summary: ThreadSummary): HTMLSpanElement | null {
  const label = permissionLabel(summary.permissionMode);
  if (!label) return null;

  const access = element("span", "bb-thread-hover-card__access", label);
  access.dataset.permissionMode = summary.permissionMode!;
  access.setAttribute("aria-label", `Permission: ${label}`);
  access.title = `Permission: ${label}`;
  return access;
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
    ["strong", /(?<!\\)\*\*(\S(?:[^\n]*?\S)?)(?<!\\)\*\*/],
    ["strong", /(?<![\\\w])__(\S(?:[^\n]*?\S)?)(?<!\\)__(?!\w)/],
    ["strike", /~~(.+?)~~/],
    ["emphasis", /(?<!\\)\*(?!\*)(\S(?:[^*\n]*?\S)?)(?<!\\)\*(?!\*)/],
    ["emphasis", /(?<![\\\w])_(?!_)(\S(?:[^_\n]*?\S)?)(?<!\\)_(?![\w_])/],
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
  const modelLabel = formatModelLabel(
    summary.provider.model,
    summary.provider.id,
  );
  const reasoningLabel = summary.provider.reasoningLevel
    ? REASONING_LABELS[summary.provider.reasoningLevel]
    : null;
  provider.title = reasoningLabel
    ? `${summary.provider.displayName} · ${modelLabel} · ${reasoningLabel} reasoning`
    : `${summary.provider.displayName} · ${modelLabel}`;
  const providerIdentity = element(
    "div",
    "bb-thread-hover-card__provider-identity",
  );
  providerIdentity.append(
    element(
      "span",
      "bb-thread-hover-card__provider-model bb-thread-hover-card__truncate",
      modelLabel,
    ),
  );
  if (reasoningLabel) {
    const reasoning = element(
      "span",
      "bb-thread-hover-card__reasoning",
      reasoningLabel,
    );
    reasoning.title = `${reasoningLabel} reasoning`;
    providerIdentity.append(reasoning);
  }
  provider.append(
    providerIcon(summary.provider),
    element(
      "span",
      "bb-thread-hover-card__sr-only",
      `${summary.provider.displayName}, `,
    ),
    providerIdentity,
  );
  header.append(provider);

  if (summary.currentTurnStartedAt !== null) {
    const times = element("div", "bb-thread-hover-card__times");
    const runtime = element("span", "bb-thread-hover-card__runtime");
    runtime.dataset.turnStartedAt = String(summary.currentTurnStartedAt);
    const isDone = summary.status === "idle";
    if (isDone) runtime.dataset.turnEndedAt = String(summary.updatedAt);
    const runtimeValue = element("span", "bb-thread-hover-card__time-value");
    runtimeValue.dataset.timeValue = "";
    const runtimeStatus = statusPresentation(summary.status);
    const usesThreadStatusIcon =
      (runtimeStatus.animated || isDone) &&
      runtimeStatus.icon !== null &&
      runtimeStatus.iconName !== null;
    const runtimeIcon = icon(
      usesThreadStatusIcon ? runtimeStatus.icon! : AlarmClockIcon,
      usesThreadStatusIcon ? runtimeStatus.iconName! : "AlarmClockIcon",
      "bb-thread-hover-card__icon bb-thread-hover-card__time-icon",
    );
    if (usesThreadStatusIcon) {
      runtimeIcon.dataset.tone = runtimeStatus.tone;
      if (runtimeStatus.animated) runtimeIcon.dataset.animated = "true";
    }
    runtime.append(
      runtimeIcon,
      element("span", "bb-thread-hover-card__sr-only", "Run time "),
      runtimeValue,
    );
    times.append(runtime);
    header.append(times);
  }

  const content: HTMLElement[] = [header];
  const summaryMessage = summary.latestAssistantMessage;

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
    request.append(messagePreview(summaryMessage, true));
    content.push(request);
  }

  const hasMeaningfulProject =
    summary.repository.name !== "Repository unavailable";
  if (summary.repository.isGitRepository || hasMeaningfulProject) {
    const context = element("section", "bb-thread-hover-card__context");
    context.dataset.hasBranch = String(
      summary.repository.isGitRepository &&
        Boolean(summary.repository.branch),
    );
    const project = element("span", "bb-thread-hover-card__project");
    const projectName = element(
      "span",
      "bb-thread-hover-card__project-name",
      summary.repository.name,
    );
    projectName.title = summary.repository.name;
    project.append(
      icon(
        Folder01Icon,
        "Folder01Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon",
      ),
      projectName,
    );
    context.append(project);

    if (summary.repository.isGitRepository && summary.repository.branch) {
      const branch = element("span", "bb-thread-hover-card__branch");
      const branchName = element(
        "span",
        "bb-thread-hover-card__branch-name",
        summary.repository.branch,
      );
      branchName.title = summary.repository.branch;
      branch.append(
        icon(
          GitBranchIcon,
          "GitBranchIcon",
          "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon",
        ),
        branchName,
      );
      context.append(branch);
    }

    if (
      summary.repository.isGitRepository &&
      summary.pullRequest.kind === "available"
    ) {
      const pullRequest = element("span", "bb-thread-hover-card__pr");
      pullRequest.dataset.kind = summary.pullRequest.kind;
      const pullRequestLink = element("a", "bb-thread-hover-card__pr-link");
      pullRequestLink.href = summary.pullRequest.url;
      pullRequestLink.target = "_blank";
      pullRequestLink.rel = "noopener noreferrer";
      pullRequestLink.setAttribute(
        "aria-label",
        `Pull request #${summary.pullRequest.number}: ${summary.pullRequest.title}. ${summary.pullRequest.signal}. Opens in a new tab.`,
      );
      pullRequestLink.title = summary.pullRequest.title;
      pullRequestLink.append(
        icon(
          LinkSquare01Icon,
          "LinkSquare01Icon",
          "bb-thread-hover-card__icon bb-thread-hover-card__link-icon",
        ),
        element(
          "span",
          "bb-thread-hover-card__pr-number",
          `#${summary.pullRequest.number}`,
        ),
      );
      const pullRequestStatus = element(
        "span",
        "bb-thread-hover-card__pr-status",
        summary.pullRequest.signal,
      );
      pullRequestStatus.dataset.tone = pullRequestTone(summary.pullRequest);
      pullRequestStatus.dataset.state = summary.pullRequest.state;
      pullRequestLink.append(pullRequestStatus);
      pullRequest.append(pullRequestLink);
      context.append(pullRequest);
    }
    if (summary.repository.isGitRepository) {
      const access = permissionMetadata(summary);
      if (access) context.append(access);
    }
    content.push(context);
  }

  if (!summary.repository.isGitRepository) {
    const localContext =
      summary.repository.path?.trim() ||
      (summary.repository.name === "Repository unavailable"
        ? "Local"
        : summary.repository.name);
    const local = element(
      "section",
      "bb-thread-hover-card__local",
    );
    const localPath = element(
      "span",
      "bb-thread-hover-card__local-path",
      compactLocalPath(localContext),
    );
    localPath.title = localContext;
    local.setAttribute("aria-label", `Local workspace: ${localContext}`);
    local.append(
      icon(
        LaptopIcon,
        "LaptopIcon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon",
      ),
      localPath,
    );
    const access = permissionMetadata(summary);
    if (access) local.append(access);
    content.push(local);
  }

  card.replaceChildren(...content);
  refreshRunTime(card);
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
      if (card && !card.hidden) refreshRunTime(card);
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
        const focusWasInsideCard =
          document.activeElement instanceof Node &&
          hoverCard.contains(document.activeElement);
        renderSummary(hoverCard, summary);
        if (focusWasInsideCard) {
          const replacementPullRequestLink =
            hoverCard.querySelector<HTMLAnchorElement>(
              ".bb-thread-hover-card__pr-link",
            );
          (replacementPullRequestLink ?? activeTrigger)?.focus();
        }
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
