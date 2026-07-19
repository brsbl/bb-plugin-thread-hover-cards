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

// node_modules/@hugeicons/core-free-icons/dist/esm/Alert02Icon.js
var Alert02Icon = [
  ["path", { d: "M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M12 9V13", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }],
  ["path", { d: "M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "2" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/ArrowLeft03Icon.js
var ArrowLeft03Icon = [
  ["path", { d: "M4 6L4 18", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M8.00012 12.0005L20.0001 12.0005", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }],
  ["path", { d: "M12 8C12 8 8.00001 10.946 8 12C7.99999 13.0541 12 16 12 16", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "2" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/CancelCircleIcon.js
var CancelCircleIcon = [
  ["path", { d: "M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M14.9994 15L9 9M9.00064 15L15 9", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/Folder01Icon.js
var Folder01Icon = [
  ["path", { d: "M8 7H16.75C18.8567 7 19.91 7 20.6667 7.50559C20.9943 7.72447 21.2755 8.00572 21.4944 8.33329C22 9.08996 22 10.1433 22 12.25C22 15.7612 22 17.5167 21.1573 18.7779C20.7926 19.3238 20.3238 19.7926 19.7779 20.1573C18.5167 21 16.7612 21 13.25 21H12C7.28595 21 4.92893 21 3.46447 19.5355C2 18.0711 2 15.714 2 11V7.94427C2 6.1278 2 5.21956 2.38032 4.53806C2.65142 4.05227 3.05227 3.65142 3.53806 3.38032C4.21956 3 5.1278 3 6.94427 3C8.10802 3 8.6899 3 9.19926 3.19101C10.3622 3.62712 10.8418 4.68358 11.3666 5.73313L12 7", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "0" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/LinkSquare01Icon.js
var LinkSquare01Icon = [
  ["path", { d: "M11.1004 3.00208C7.4515 3.00864 5.54073 3.09822 4.31962 4.31931C3.00183 5.63706 3.00183 7.75796 3.00183 11.9997C3.00183 16.2415 3.00183 18.3624 4.31962 19.6801C5.6374 20.9979 7.75836 20.9979 12.0003 20.9979C16.2421 20.9979 18.3631 20.9979 19.6809 19.6801C20.902 18.4591 20.9916 16.5484 20.9982 12.8996", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M20.4803 3.51751L14.931 9.0515M20.4803 3.51751C19.9863 3.023 16.6587 3.0691 15.9552 3.0791M20.4803 3.51751C20.9742 4.01202 20.9282 7.34329 20.9182 8.04754", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.5", key: "1" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/Loading03Icon.js
var Loading03Icon = [
  ["path", { d: "M12 3V6", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M12 18V21", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "1" }],
  ["path", { d: "M21 12L18 12", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "2" }],
  ["path", { d: "M6 12L3 12", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "3" }],
  ["path", { d: "M18.3635 5.63672L16.2422 7.75804", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "4" }],
  ["path", { d: "M7.75804 16.2422L5.63672 18.3635", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "5" }],
  ["path", { d: "M18.3635 18.3635L16.2422 16.2422", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "6" }],
  ["path", { d: "M7.75804 7.75804L5.63672 5.63672", stroke: "currentColor", strokeLinecap: "round", strokeWidth: "1.5", key: "7" }]
];

// node_modules/@hugeicons/core-free-icons/dist/esm/PauseIcon.js
var PauseIcon = [
  ["path", { d: "M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z", stroke: "currentColor", strokeWidth: "1.5", key: "0" }],
  ["path", { d: "M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z", stroke: "currentColor", strokeWidth: "1.5", key: "1" }]
];

// styles.ts
var HOVER_CARD_CSS = String.raw`
.bb-thread-hover-card {
  position: fixed;
  z-index: 50;
  width: min(20rem, calc(100vw - 1rem));
  max-height: calc(100vh - 1rem);
  overflow: hidden;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-color:
    color-mix(in srgb, var(--foreground) 8%, transparent);
  border-radius: var(--radius-lg, 0.5rem);
  background: var(--popover);
  background: color-mix(in srgb, var(--popover) 82%, transparent);
  color: var(--popover-foreground);
  box-shadow:
    0 0.75rem 2.5rem
      color-mix(in srgb, var(--foreground) 12%, transparent),
    inset 0 1px 0
      color-mix(in srgb, var(--background) 34%, transparent);
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
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

.bb-thread-hover-card__icon {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
  color: var(--muted-foreground);
}

.bb-thread-hover-card__status-icon[data-tone="working"] {
  color: color-mix(in srgb, var(--muted-foreground) 62%, transparent);
}

.bb-thread-hover-card__status-icon[data-tone="danger"] {
  color: var(--destructive);
}

.bb-thread-hover-card__status-icon[data-tone="warning"] {
  color: var(--warning-text, var(--warning));
}

.bb-thread-hover-card__updated,
.bb-thread-hover-card__loading,
.bb-thread-hover-card__meta-label,
.bb-thread-hover-card__repository {
  color: var(--muted-foreground);
}

.bb-thread-hover-card__updated {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.bb-thread-hover-card__repository {
  margin-top: 0.625rem;
  padding-top: 0.625rem;
  border-top: 1px solid
    color-mix(in srgb, var(--foreground) 6%, transparent);
}

.bb-thread-hover-card__summary,
.bb-thread-hover-card__message,
.bb-thread-hover-card__meta,
.bb-thread-hover-card__loading {
  margin: 0;
}

.bb-thread-hover-card__summary {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 0.4375rem;
  margin-top: 0.625rem;
}

.bb-thread-hover-card__summary-icon {
  margin-top: 0.125rem;
  color: color-mix(in srgb, var(--muted-foreground) 78%, transparent);
}

.bb-thread-hover-card__message {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.45;
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

.bb-thread-hover-card__meta-icon {
  color: color-mix(in srgb, var(--muted-foreground) 78%, transparent);
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

.bb-thread-hover-card__pr-status {
  flex: none;
  padding: 0.0625rem 0.3125rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 7%, transparent);
  color: var(--muted-foreground);
  font-size: 0.625rem;
  font-weight: 500;
  line-height: 1.35;
}

.bb-thread-hover-card__pr-status[data-tone="success"] {
  border-color: color-mix(in oklab, var(--success) 18%, transparent);
  background: color-mix(in oklab, var(--success) 9%, transparent);
  color: color-mix(in oklab, var(--success) 80%, var(--foreground));
}

.bb-thread-hover-card__pr-status[data-tone="warning"] {
  border-color:
    color-mix(in oklab, var(--warning-text, var(--warning)) 18%, transparent);
  background:
    color-mix(in oklab, var(--warning-text, var(--warning)) 8%, transparent);
  color: var(--warning-text, var(--warning));
}

.bb-thread-hover-card__pr-status[data-tone="danger"] {
  border-color:
    color-mix(in oklab, var(--destructive-text, var(--destructive)) 18%, transparent);
  background:
    color-mix(in oklab, var(--destructive-text, var(--destructive)) 8%, transparent);
  color: var(--destructive-text, var(--destructive));
}

.bb-thread-hover-card__link-icon {
  flex: none;
  width: 0.8125rem;
  height: 0.8125rem;
  color: var(--muted-foreground);
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

@keyframes bb-thread-hover-card-spin {
  to {
    transform: rotate(360deg);
  }
}

.bb-thread-hover-card__status-icon[data-animated="true"] {
  animation: bb-thread-hover-card-spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .bb-thread-hover-card.is-visible,
  .bb-thread-hover-card__status-icon[data-animated="true"] {
    animation: none;
  }
}

@supports not (
  (backdrop-filter: blur(1px)) or
    (-webkit-backdrop-filter: blur(1px))
) {
  .bb-thread-hover-card {
    background: var(--popover);
  }
}
`;

// app.tsx
var CARD_ID = "bb-thread-hover-card";
var STYLE_ID = "bb-thread-hover-card-styles";
var PLUGIN_CSS_SELECTOR = 'link[data-bb-plugin-css="thread-hover-cards"]';
var THREAD_TRIGGER_SELECTOR = "a[data-sidebar-thread-id]";
var THREAD_ROW_SELECTOR = ".group\\/thread-row";
var OPEN_DELAY_MS = 150;
var CLOSE_DELAY_MS = 120;
var CACHE_TTL_MS = 1e4;
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== void 0) node.textContent = text;
  return node;
}
function icon(definition, name, className) {
  const svg = document.createElementNS(SVG_NAMESPACE, "svg");
  svg.classList.add(...className.split(/\s+/).filter(Boolean));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("data-icon", name);
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attributes] of definition) {
    const child = document.createElementNS(SVG_NAMESPACE, tag);
    for (const [attribute, value] of Object.entries(attributes)) {
      if (attribute === "key" || value === void 0 || value === null) {
        continue;
      }
      const normalizedAttribute = attribute.replace(
        /[A-Z]/g,
        (letter) => `-${letter.toLowerCase()}`
      );
      child.setAttribute(normalizedAttribute, String(value));
    }
    svg.append(child);
  }
  return svg;
}
function statusPresentation(status) {
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
        tone: "working"
      };
    case "error":
      return {
        animated: false,
        icon: CancelCircleIcon,
        iconName: "CancelCircleIcon",
        label: "Thread failed",
        tone: "danger"
      };
    case "waiting-for-host":
      return {
        animated: false,
        icon: Alert02Icon,
        iconName: "Alert02Icon",
        label: "Waiting for host",
        tone: "warning"
      };
    case "idle":
      return {
        animated: false,
        icon: PauseIcon,
        iconName: "PauseIcon",
        label: "Idle",
        tone: "muted"
      };
  }
}
function pullRequestTone(pullRequest) {
  const signal = pullRequest.signal.toLowerCase();
  if (signal.includes("failing") || signal.includes("blocked") || signal.includes("changes requested") || signal.includes("conflict")) {
    return "danger";
  }
  if (pullRequest.state === "merged" || signal.includes("passing") || signal.includes("ready to merge")) {
    return "success";
  }
  if (pullRequest.state === "draft" || signal.includes("pending") || signal.includes("review requested")) {
    return "warning";
  }
  return "muted";
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
  const statusDetails = statusPresentation(summary.status);
  const statusIcon = icon(
    statusDetails.icon,
    statusDetails.iconName,
    "bb-thread-hover-card__icon bb-thread-hover-card__status-icon"
  );
  statusIcon.dataset.tone = statusDetails.tone;
  if (statusDetails.animated) statusIcon.dataset.animated = "true";
  status.append(
    statusIcon,
    element("span", "bb-thread-hover-card__status-label", statusDetails.label)
  );
  header.append(
    status,
    element(
      "span",
      "bb-thread-hover-card__updated",
      `Updated ${relativeTime(summary.updatedAt)}`
    )
  );
  const content = [header];
  if (summary.latestUserMessage) {
    const request = element("section", "bb-thread-hover-card__summary");
    request.append(
      icon(
        ArrowLeft03Icon,
        "ArrowLeft03Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__summary-icon"
      ),
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
    const noRepository = element("p", "bb-thread-hover-card__meta");
    noRepository.append(
      icon(
        Folder01Icon,
        "Folder01Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon"
      ),
      element("span", "", "No Git repository")
    );
    repository.append(noRepository);
  } else {
    const repoLine = element("p", "bb-thread-hover-card__meta");
    repoLine.append(
      icon(
        Folder01Icon,
        "Folder01Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon"
      ),
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
          `#${summary.pullRequest.number}`
        )
      );
      const pullRequestStatus = element(
        "span",
        "bb-thread-hover-card__pr-status",
        summary.pullRequest.signal
      );
      pullRequestStatus.dataset.tone = pullRequestTone(summary.pullRequest);
      pullRequestLink.append(
        pullRequestStatus,
        icon(
          LinkSquare01Icon,
          "LinkSquare01Icon",
          "bb-thread-hover-card__icon bb-thread-hover-card__link-icon"
        )
      );
      pullRequestLine.append(
        element("span", "bb-thread-hover-card__meta-label", "PR"),
        pullRequestLink
      );
    } else {
      pullRequestLine.append(
        element("span", "bb-thread-hover-card__meta-label", "PR"),
        element(
          "span",
          "",
          summary.pullRequest.kind === "absent" ? "No pull request" : "Pull request unavailable"
        )
      );
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
    closeTimer = setTimeout(() => {
      closeTimer = null;
      const focused = document.activeElement;
      if (focused === activeTrigger || focused instanceof Node && card?.contains(focused)) {
        return;
      }
      closeCard();
    }, CLOSE_DELAY_MS);
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
    cancelOpen();
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
      if (restoreFocus) {
        event.preventDefault();
        trigger.focus();
      }
      closeCard();
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
function installHoverCardLifecycle() {
  let controller = null;
  let disposed = false;
  function reconcile() {
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
    }
  };
}
var pluginGlobal = globalThis;
function start() {
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
