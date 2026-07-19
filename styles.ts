export const HOVER_CARD_CSS = String.raw`
.bb-thread-hover-card {
  position: fixed;
  z-index: 50;
  width: min(20rem, calc(100vw - 1rem));
  max-height: calc(100vh - 1rem);
  overflow: hidden;
  padding: 0.75rem;
  border: 1px solid transparent;
  border-color:
    color-mix(in srgb, var(--foreground) 5%, transparent);
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
.bb-thread-hover-card__provider,
.bb-thread-hover-card__times,
.bb-thread-hover-card__repository,
.bb-thread-hover-card__pr,
.bb-thread-hover-card__meta {
  display: flex;
  min-width: 0;
  align-items: center;
}

.bb-thread-hover-card__header {
  gap: 0.625rem;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  font-weight: 400;
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

.bb-thread-hover-card__status-icon[data-tone="success"] {
  color: var(--success);
}

.bb-thread-hover-card__runtime,
.bb-thread-hover-card__updated,
.bb-thread-hover-card__loading,
.bb-thread-hover-card__meta-label,
.bb-thread-hover-card__repository {
  color: var(--muted-foreground);
}

.bb-thread-hover-card__runtime,
.bb-thread-hover-card__updated {
  flex: none;
  font-variant-numeric: tabular-nums;
}

.bb-thread-hover-card__updated {
  flex: none;
}

.bb-thread-hover-card__provider {
  flex: 1 1 auto;
  gap: 0.375rem;
  color: var(--muted-foreground);
}

.bb-thread-hover-card__times {
  flex: none;
  gap: 0.5rem;
  margin-left: auto;
  white-space: nowrap;
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

.bb-thread-hover-card__status-icon {
  margin-top: 0.125rem;
}

.bb-thread-hover-card__message {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.bb-thread-hover-card__provider-icon {
  width: 0.8125rem;
  height: 0.8125rem;
  color: color-mix(in srgb, var(--muted-foreground) 82%, transparent);
  object-fit: contain;
}

.bb-thread-hover-card__provider-model {
  color: var(--muted-foreground);
  font-weight: 400;
}

.bb-thread-hover-card__repository {
  gap: 0.375rem;
  margin-top: 0.375rem;
  overflow: hidden;
  white-space: nowrap;
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
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  color: var(--foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-thread-hover-card__branch {
  max-width: 6.5rem;
  flex: 0 1 auto;
  min-width: 2.5rem;
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

.bb-thread-hover-card__pr {
  flex: none;
  gap: 0.25rem;
  margin-left: auto;
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

.bb-thread-hover-card__local {
  color: var(--foreground);
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
