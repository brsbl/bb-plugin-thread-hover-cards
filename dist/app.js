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

// icons.ts
var AlarmClockIcon = [
  [
    "path",
    {
      d: "M20.5 12.5C20.5 17.1944 16.6944 21 12 21C7.30558 21 3.5 17.1944 3.5 12.5C3.5 7.80558 7.30558 4 12 4C16.6944 4 20.5 7.80558 20.5 12.5Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M5.88 18.7031L3.5 21.0031",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ],
  [
    "path",
    {
      d: "M18.14 18.668L20.5 20.998",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "2"
    }
  ],
  [
    "path",
    {
      d: "M5 3L2 6",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "3"
    }
  ],
  [
    "path",
    {
      d: "M22 6L19 3",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "4"
    }
  ],
  [
    "path",
    {
      d: "M12 8V12.5L14 14.5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "5"
    }
  ]
];
var LaptopIcon = [
  [
    "path",
    {
      d: "M20.4999 16.5V8.5C20.4999 6.14298 20.4999 4.96447 19.7676 4.23223C19.0354 3.5 17.8569 3.5 15.4999 3.5H8.49988C6.14286 3.5 4.96434 3.5 4.23211 4.23223C3.49988 4.96447 3.49988 6.14298 3.49988 8.5V16.5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M21.9841 20.5H2.01567C1.63273 20.5 1.38367 20.1088 1.55493 19.7764L3.49988 16.5H20.4999L22.4448 19.7764C22.6161 20.1088 22.367 20.5 21.9841 20.5Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ]
];
var Folder01Icon = [
  [
    "path",
    {
      d: "M8 7H16.75C18.8567 7 19.91 7 20.6667 7.50559C20.9943 7.72447 21.2755 8.00572 21.4944 8.33329C22 9.08996 22 10.1433 22 12.25C22 15.7612 22 17.5167 21.1573 18.7779C20.7926 19.3238 20.3238 19.7926 19.7779 20.1573C18.5167 21 16.7612 21 13.25 21H12C7.28595 21 4.92893 21 3.46447 19.5355C2 18.0711 2 15.714 2 11V7.94427C2 6.1278 2 5.21956 2.38032 4.53806C2.65142 4.05227 3.05227 3.65142 3.53806 3.38032C4.21956 3 5.1278 3 6.94427 3C8.10802 3 8.6899 3 9.19926 3.19101C10.3622 3.62712 10.8418 4.68358 11.3666 5.73313L12 7",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ]
];
var GitBranchIcon = [
  [
    "path",
    {
      d: "M7 19H13C15.8284 19 17.2426 19 18.1213 18.1213C19 17.2426 19 15.8284 19 13V10M19 10C19.7002 10 21.0085 11.9943 21.5 12.5M19 10C18.2998 10 16.9915 11.9943 16.5 12.5",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M5 7L5 17",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ],
  [
    "circle",
    {
      cx: "5",
      cy: "5",
      r: "2",
      stroke: "currentColor",
      strokeWidth: "1.5",
      key: "2"
    }
  ],
  [
    "circle",
    {
      cx: "19",
      cy: "5",
      r: "2",
      stroke: "currentColor",
      strokeWidth: "1.5",
      key: "3"
    }
  ],
  [
    "circle",
    {
      cx: "5",
      cy: "19",
      r: "2",
      stroke: "currentColor",
      strokeWidth: "1.5",
      key: "4"
    }
  ]
];
var LinkSquare01Icon = [
  [
    "path",
    {
      d: "M11.1004 3.00208C7.4515 3.00864 5.54073 3.09822 4.31962 4.31931C3.00183 5.63706 3.00183 7.75796 3.00183 11.9997C3.00183 16.2415 3.00183 18.3624 4.31962 19.6801C5.6374 20.9979 7.75836 20.9979 12.0003 20.9979C16.2421 20.9979 18.3631 20.9979 19.6809 19.6801C20.902 18.4591 20.9916 16.5484 20.9982 12.8996",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M20.4803 3.51751L14.931 9.0515M20.4803 3.51751C19.9863 3.023 16.6587 3.0691 15.9552 3.0791M20.4803 3.51751C20.9742 4.01202 20.9282 7.34329 20.9182 8.04754",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ]
];
var Loading03Icon = [
  [
    "path",
    {
      d: "M12 3V6",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M12 18V21",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ],
  [
    "path",
    {
      d: "M21 12L18 12",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "2"
    }
  ],
  [
    "path",
    {
      d: "M6 12L3 12",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "3"
    }
  ],
  [
    "path",
    {
      d: "M18.3635 5.63672L16.2422 7.75804",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "4"
    }
  ],
  [
    "path",
    {
      d: "M7.75804 16.2422L5.63672 18.3635",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "5"
    }
  ],
  [
    "path",
    {
      d: "M18.3635 18.3635L16.2422 16.2422",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "6"
    }
  ],
  [
    "path",
    {
      d: "M7.75804 7.75804L5.63672 5.63672",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeWidth: "1.5",
      key: "7"
    }
  ]
];
var CancelCircleIcon = [
  [
    "path",
    {
      d: "M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M14.9994 15L9 9M9.00064 15L15 9",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ]
];
var CheckmarkCircle02Icon = [
  [
    "path",
    {
      d: "M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z",
      stroke: "currentColor",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M8 12.5L10.5 15L16 9",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ]
];
var SourceCodeIcon = [
  [
    "path",
    {
      d: "M17 8L18.8398 9.85008C19.6133 10.6279 20 11.0168 20 11.5C20 11.9832 19.6133 12.3721 18.8398 13.1499L17 15",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M7 8L5.16019 9.85008C4.38673 10.6279 4 11.0168 4 11.5C4 11.9832 4.38673 12.3721 5.16019 13.1499L7 15",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "1"
    }
  ],
  [
    "path",
    {
      d: "M14.5 4L9.5 20",
      stroke: "currentColor",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      strokeWidth: "1.5",
      key: "2"
    }
  ]
];
var OpenAiIcon = [
  [
    "path",
    {
      d: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
      fill: "currentColor",
      key: "0"
    }
  ]
];
var ClaudeIcon = [
  [
    "path",
    {
      d: "M29.05 98.54L58.19 82.19L58.68 80.77L58.19 79.98H56.77L51.9 79.68L35.25 79.23L20.81 78.63L6.82 77.88L3.3 77.13L0 72.78L0.340004 70.61L3.3 68.62L7.54 68.99L16.91 69.63L30.97 70.6L41.17 71.2L56.28 72.77H58.68L59.02 71.8L58.2 71.2L57.56 70.6L43.01 60.74L27.26 50.32L19.01 44.32L14.55 41.28L12.3 38.43L11.33 32.21L15.38 27.75L20.82 28.12L22.21 28.49L27.72 32.73L39.49 41.84L54.86 53.16L57.11 55.03L58.01 54.39L58.12 53.94L57.11 52.25L48.75 37.14L39.83 21.77L35.86 15.4L34.81 11.58C34.44 10.01 34.17 8.69 34.17 7.08L38.78 0.820007L41.33 0L47.48 0.820007L50.07 3.07001L53.89 11.81L60.08 25.57L69.68 44.28L72.49 49.83L73.99 54.97L74.55 56.54H75.52V55.64L76.31 45.1L77.77 32.16L79.19 15.51L79.68 10.82L82 5.2L86.61 2.16L90.21 3.88L93.17 8.12L92.76 10.86L91 22.3L87.55 40.22L85.3 52.22H86.61L88.11 50.72L94.18 42.66L104.38 29.91L108.88 24.85L114.13 19.26L117.5 16.6H123.87L128.56 23.57L126.46 30.77L119.9 39.09L114.46 46.14L106.66 56.64L101.79 65.04L102.24 65.71L103.4 65.6L121.02 61.85L130.54 60.13L141.9 58.18L147.04 60.58L147.6 63.02L145.58 68.01L133.43 71.01L119.18 73.86L97.96 78.88L97.7 79.07L98 79.44L107.56 80.34L111.65 80.56H121.66L140.3 81.95L145.17 85.17L148.09 89.11L147.6 92.11L140.1 95.93L129.98 93.53L106.36 87.91L98.26 85.89H97.14V86.56L103.89 93.16L116.26 104.33L131.75 118.73L132.54 122.29L130.55 125.1L128.45 124.8L114.84 114.56L109.59 109.95L97.7 99.94H96.91V100.99L99.65 105L114.12 126.75L114.87 133.42L113.82 135.59L110.07 136.9L105.95 136.15L97.48 124.26L88.74 110.87L81.69 98.87L80.83 99.36L76.67 144.17L74.72 146.46L70.22 148.18L66.47 145.33L64.48 140.72L66.47 131.61L68.87 119.72L70.82 110.27L72.58 98.53L73.63 94.63L73.56 94.37L72.7 94.48L63.85 106.63L50.39 124.82L39.74 136.22L37.19 137.23L32.77 134.94L33.18 130.85L35.65 127.21L50.39 108.46L59.28 96.84L65.02 90.13L64.98 89.16H64.64L25.49 114.58L18.52 115.48L15.52 112.67L15.89 108.06L17.31 106.56L29.08 98.46L29.04 98.5L29.05 98.54Z",
      fill: "currentColor",
      key: "0"
    }
  ]
];
var PiIcon = [
  [
    "path",
    {
      d: "M165.29 165.29H517.36V400H400V517.36H282.65V634.72H165.29ZM282.65 282.65V400H400V282.65Z",
      fill: "currentColor",
      fillRule: "evenodd",
      key: "0"
    }
  ],
  [
    "path",
    {
      d: "M517.36 400H634.72V634.72H517.36Z",
      fill: "currentColor",
      key: "1"
    }
  ]
];
var CursorIcon = [
  [
    "path",
    {
      d: "M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23",
      fill: "currentColor",
      key: "0"
    }
  ]
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
    color-mix(in srgb, var(--foreground) 4%, transparent);
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
.bb-thread-hover-card__provider-identity,
.bb-thread-hover-card__times,
.bb-thread-hover-card__context,
.bb-thread-hover-card__project,
.bb-thread-hover-card__branch,
.bb-thread-hover-card__local,
.bb-thread-hover-card__pr,
.bb-thread-hover-card__access,
.bb-thread-hover-card__meta {
  display: flex;
  min-width: 0;
  align-items: center;
}

.bb-thread-hover-card__header {
  gap: 0.5rem;
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

.bb-thread-hover-card__runtime,
.bb-thread-hover-card__loading,
.bb-thread-hover-card__meta-label {
  color: var(--muted-foreground);
}

.bb-thread-hover-card__runtime {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 0.1875rem;
  font-variant-numeric: tabular-nums;
}

.bb-thread-hover-card__provider {
  flex: 1 1 auto;
  gap: 0.3125rem;
  color: var(--muted-foreground);
}

.bb-thread-hover-card__provider-identity {
  min-width: 0;
  flex: 1 1 auto;
  justify-content: flex-start;
  gap: 0.25rem;
  overflow: hidden;
}

.bb-thread-hover-card__reasoning {
  flex: none;
  color: color-mix(in srgb, var(--muted-foreground) 76%, transparent);
  white-space: nowrap;
}

.bb-thread-hover-card__times {
  flex: none;
  gap: 0.375rem;
  margin-left: auto;
  white-space: nowrap;
}

.bb-thread-hover-card__time-icon {
  width: 0.75rem;
  height: 0.75rem;
  color: color-mix(in srgb, var(--muted-foreground) 74%, transparent);
}

.bb-thread-hover-card__time-icon[data-tone="working"] {
  color: color-mix(in srgb, var(--muted-foreground) 62%, transparent);
}

.bb-thread-hover-card__time-icon[data-tone="danger"] {
  color: var(--destructive);
}

.bb-thread-hover-card__time-icon[data-tone="warning"] {
  color: var(--warning-text, var(--warning));
}

.bb-thread-hover-card__time-icon[data-tone="success"] {
  color: var(--success);
}

.bb-thread-hover-card__summary,
.bb-thread-hover-card__message,
.bb-thread-hover-card__meta,
.bb-thread-hover-card__loading {
  margin: 0;
}

.bb-thread-hover-card__summary {
  min-width: 0;
  margin-top: 0.625rem;
}

.bb-thread-hover-card__message {
  display: -webkit-box;
  min-width: 0;
  overflow: hidden;
  color: color-mix(in srgb, var(--foreground) 88%, transparent);
  font-size: 0.8125rem;
  font-weight: 350;
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

.bb-thread-hover-card__provider-model.bb-thread-hover-card__truncate {
  flex: 0 1 auto;
  color: var(--muted-foreground);
}

.bb-thread-hover-card__context {
  width: 100%;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-top: 0.375rem;
  overflow: hidden;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
  white-space: nowrap;
}

.bb-thread-hover-card__project,
.bb-thread-hover-card__branch {
  gap: 0.25rem;
  overflow: hidden;
}

.bb-thread-hover-card__project {
  max-width: 38%;
  flex: 0 1 auto;
}

.bb-thread-hover-card__context[data-has-branch="false"]
  .bb-thread-hover-card__project {
  max-width: 100%;
  flex: 1 1 auto;
}

.bb-thread-hover-card__branch {
  flex: 1 1 4rem;
  min-width: 0;
}

.bb-thread-hover-card__project-name,
.bb-thread-hover-card__branch-name,
.bb-thread-hover-card__local-path {
  min-width: 0;
  overflow: hidden;
  color: var(--muted-foreground);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-thread-hover-card__project-name,
.bb-thread-hover-card__branch-name,
.bb-thread-hover-card__local-path {
  flex: 1 1 auto;
}

.bb-thread-hover-card__local {
  width: 100%;
  flex-wrap: nowrap;
  gap: 0.375rem;
  margin-top: 0.3125rem;
  overflow: hidden;
  color: var(--muted-foreground);
  font-size: 0.6875rem;
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

.bb-thread-hover-card__pr {
  flex: none;
  align-items: center;
  overflow: visible;
}

.bb-thread-hover-card__access {
  flex: none;
  color: color-mix(in srgb, var(--muted-foreground) 76%, transparent);
  white-space: nowrap;
}

.bb-thread-hover-card__access[data-permission-mode="full"] {
  color: var(--warning-text, var(--warning));
}

.bb-thread-hover-card__pr-link {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.25rem;
  color: var(--foreground);
  outline: none;
  text-decoration: none;
}

.bb-thread-hover-card__pr-number {
  flex: none;
}

.bb-thread-hover-card__inline-code {
  padding: 0.025rem 0.175rem;
  border-radius: 0.2rem;
  background: color-mix(in srgb, var(--foreground) 5%, transparent);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

.bb-thread-hover-card__inline-link {
  text-decoration: underline;
  text-decoration-color: color-mix(in srgb, currentColor 30%, transparent);
  text-underline-offset: 0.1rem;
}

.bb-thread-hover-card__inline-strong {
  font-weight: 550;
}

.bb-thread-hover-card__inline-emphasis {
  font-style: italic;
}

.bb-thread-hover-card__inline-strike {
  color: var(--muted-foreground);
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

.bb-thread-hover-card__pr-status[data-tone="danger"] {
  border-color:
    color-mix(in oklab, var(--destructive-text, var(--destructive)) 18%, transparent);
  background:
    color-mix(in oklab, var(--destructive-text, var(--destructive)) 8%, transparent);
  color: var(--destructive-text, var(--destructive));
}

.bb-thread-hover-card__pr-status[data-tone="merged"] {
  border-color: color-mix(in oklab, var(--pr-merged) 18%, transparent);
  background: color-mix(in oklab, var(--pr-merged) 9%, transparent);
  color: var(--pr-merged);
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

.bb-thread-hover-card__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  margin: -1px;
  padding: 0;
  border: 0;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
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

.bb-thread-hover-card__status-icon[data-animated="true"],
.bb-thread-hover-card__time-icon[data-animated="true"] {
  animation: bb-thread-hover-card-spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .bb-thread-hover-card.is-visible,
  .bb-thread-hover-card__status-icon[data-animated="true"],
  .bb-thread-hover-card__time-icon[data-animated="true"] {
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

// markdown-preview.ts
function tableCells(line) {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
}
function isTableDivider(line) {
  const cells = tableCells(line);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}
function cleanBlockText(value) {
  return value.replace(/<\/?[A-Za-z][^>]*>/g, "").replace(/\s+/g, " ").trim();
}
function tablePreview(lines, start2) {
  if (!lines[start2]?.includes("|") || !isTableDivider(lines[start2 + 1] ?? "")) {
    return null;
  }
  const headers = tableCells(lines[start2]);
  const values = tableCells(lines[start2 + 2] ?? "");
  const pairs = headers.map((header, index) => {
    const value = values[index];
    if (!header || !value) return null;
    return `${cleanBlockText(header)}: ${cleanBlockText(value)}`;
  }).filter((pair) => Boolean(pair)).slice(0, 3);
  const inline = pairs.length > 0 ? pairs.join(" \xB7 ") : headers.join(" \xB7 ");
  return inline ? { inline, kind: "table" } : null;
}
function markdownPreview(source) {
  let lines = source.replace(/\r\n?/g, "\n").split("\n");
  let start2 = lines.findIndex((line) => line.trim().length > 0);
  if (start2 < 0) return null;
  if (lines[start2]?.trim() === "---") {
    const frontmatterEnd = lines.findIndex(
      (line, index) => index > start2 && line.trim() === "---"
    );
    if (frontmatterEnd > start2) {
      lines = lines.slice(frontmatterEnd + 1);
      start2 = lines.findIndex((line) => line.trim().length > 0);
      if (start2 < 0) return null;
    }
  }
  const table = tablePreview(lines, start2);
  if (table) return table;
  const first = lines[start2].trim();
  const fence = first.match(/^(```+|~~~+)\s*[^\s]*\s*$/);
  if (fence) {
    const codeLines = [];
    for (let index = start2 + 1; index < lines.length; index += 1) {
      const line = lines[index];
      if (line.trim().startsWith(fence[1])) break;
      if (line.trim() || codeLines.length > 0) codeLines.push(line.trim());
    }
    const inline2 = cleanBlockText(codeLines.join(" "));
    return inline2 ? { inline: inline2, kind: "code" } : null;
  }
  const heading = first.match(/^#{1,6}\s+(.+)$/);
  if (heading) {
    const inline2 = cleanBlockText(heading[1]);
    return inline2 ? { inline: inline2, kind: "heading" } : null;
  }
  const listItem = first.match(/^(?:[-+*]|\d+[.)])\s+(.+)$/);
  if (listItem) {
    const items = [];
    for (let index = start2; index < lines.length && items.length < 2; index += 1) {
      const match = lines[index].trim().match(/^(?:[-+*]|\d+[.)])\s+(.+)$/);
      if (!match) break;
      items.push(cleanBlockText(match[1].replace(/^\[[ xX]\]\s*/, "")));
    }
    const inline2 = items.filter(Boolean).join(" \xB7 ");
    return inline2 ? { inline: inline2, kind: "list" } : null;
  }
  if (first.startsWith(">")) {
    const quoteLines = [];
    for (let index = start2; index < lines.length; index += 1) {
      const match = lines[index].trim().match(/^>\s?(.*)$/);
      if (!match) break;
      quoteLines.push(match[1]);
    }
    const inline2 = cleanBlockText(quoteLines.join(" "));
    return inline2 ? { inline: inline2, kind: "quote" } : null;
  }
  const paragraph = [];
  for (let index = start2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) break;
    if (index > start2 && tablePreview(lines, index)) break;
    if (index > start2 && /^(?:#{1,6}\s|```|~~~|>|[-+*]\s|\d+[.)]\s)/.test(line)) {
      break;
    }
    paragraph.push(line);
  }
  const inline = cleanBlockText(paragraph.join(" "));
  return inline ? { inline, kind: "paragraph" } : null;
}

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
var REASONING_LABELS = {
  none: "None",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra High",
  ultracode: "Ultracode",
  max: "Max",
  ultra: "Ultra"
};
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
        icon: null,
        iconName: null,
        label: "Waiting for host",
        tone: "warning"
      };
    case "idle":
      return {
        animated: false,
        icon: CheckmarkCircle02Icon,
        iconName: "CheckmarkCircle02Icon",
        label: "Agent finished",
        tone: "success"
      };
  }
}
function pullRequestTone(pullRequest) {
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
function compactLocalPath(path) {
  const normalized = path.trim().replace(/[\\/]+$/, "");
  if (!normalized) return path.trim() || "Local";
  const separator = normalized.includes("\\") && !normalized.includes("/") ? "\\" : "/";
  const abbreviated = separator === "\\" ? normalized.replace(/^[A-Za-z]:\\Users\\[^\\]+(?=\\|$)/i, "~") : normalized.replace(/^\/(?:Users|home)\/[^/]+(?=\/|$)/, "~");
  const segments = abbreviated.split(/[\\/]/).filter(Boolean);
  if (segments[0] === "~" && segments[1] === ".bb" && segments.length > 3) {
    return `~${separator}.bb${separator}\u2026${separator}${segments.at(-1)}`;
  }
  if (segments.length <= 4) return abbreviated;
  if (segments[0] === "~") {
    return `~${separator}\u2026${separator}${segments.slice(-2).join(separator)}`;
  }
  return `\u2026${separator}${segments.slice(-3).join(separator)}`;
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
function runTime(timestamp, endedAt = Date.now()) {
  const elapsedSeconds = Math.max(0, Math.floor((endedAt - timestamp) / 1e3));
  const seconds = elapsedSeconds % 60;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 1) return `${seconds}s`;
  const minutes = elapsedMinutes % 60;
  const hours = Math.floor(elapsedMinutes / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
function refreshRunTime(card) {
  const runtime2 = card.querySelector("[data-turn-started-at]");
  if (runtime2) {
    const timestamp = Number(runtime2.dataset.turnStartedAt);
    const endedAt = runtime2.dataset.turnEndedAt ? Number(runtime2.dataset.turnEndedAt) : Date.now();
    const value = runTime(timestamp, endedAt);
    runtime2.querySelector("[data-time-value]").textContent = value;
    runtime2.title = runtime2.dataset.turnEndedAt ? `Completed in ${value}` : `Run time ${value}`;
  }
}
function formatModelLabel(value, providerId) {
  const formatted = value.split("-").map((part) => {
    if (part.toLowerCase() === "gpt") return "GPT";
    if (/^\d+(\.\d+)*$/.test(part)) return part;
    if (/^[a-z]+$/i.test(part)) {
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    }
    return part;
  }).join("-");
  if (providerId === "codex") return formatted.replace(/^GPT-/i, "");
  if (providerId === "claude-code") {
    return formatted.replace(/^Claude\s+/i, "");
  }
  return formatted;
}
function permissionLabel(permissionMode) {
  if (permissionMode === "full") return "Full access";
  if (permissionMode === "workspace-write") return "Workspace write";
  if (permissionMode === "readonly") return "Read only";
  return null;
}
function permissionMetadata(summary) {
  const label = permissionLabel(summary.permissionMode);
  if (!label) return null;
  const access = element("span", "bb-thread-hover-card__access", label);
  access.dataset.permissionMode = summary.permissionMode;
  access.setAttribute("aria-label", `Permission: ${label}`);
  access.title = `Permission: ${label}`;
  return access;
}
function nextInlinePattern(source) {
  const patterns = [
    ["image", /!\[([^\]]*)\]\([^)]+\)/],
    ["link", /\[([^\]]+)\]\([^)]+\)/],
    ["code", /`([^`\n]+)`/],
    ["strong", /(?<!\\)\*\*(\S(?:[^\n]*?\S)?)(?<!\\)\*\*/],
    ["strong", /(?<![\\\w])__(\S(?:[^\n]*?\S)?)(?<!\\)__(?!\w)/],
    ["strike", /~~(.+?)~~/],
    ["emphasis", /(?<!\\)\*(?!\*)(\S(?:[^*\n]*?\S)?)(?<!\\)\*(?!\*)/],
    ["emphasis", /(?<![\\\w])_(?!_)(\S(?:[^_\n]*?\S)?)(?<!\\)_(?![\w_])/]
  ];
  let next = null;
  for (const [type, pattern] of patterns) {
    const match = source.match(pattern);
    if (!match || match.index === void 0) continue;
    if (!next || match.index < (next.match.index ?? Number.POSITIVE_INFINITY)) {
      next = { match, type };
    }
  }
  return next;
}
function appendInlineMarkdown(parent, source, allowEmphasis) {
  let remaining = source;
  while (remaining) {
    const next = nextInlinePattern(remaining);
    if (!next || next.match.index === void 0) {
      parent.append(
        document.createTextNode(
          remaining.replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, "$1")
        )
      );
      return;
    }
    if (next.match.index > 0) {
      parent.append(
        document.createTextNode(
          remaining.slice(0, next.match.index).replace(/\\([\\`*_[\]{}()#+\-.!|>])/g, "$1")
        )
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
        next.type === "strong" ? "bb-thread-hover-card__inline-strong" : "bb-thread-hover-card__inline-emphasis"
      );
      appendInlineMarkdown(emphasis, value, allowEmphasis);
      parent.append(emphasis);
    } else {
      appendInlineMarkdown(parent, value, allowEmphasis);
    }
    remaining = remaining.slice(next.match.index + next.match[0].length);
  }
}
function messagePreview(source, allowEmphasis) {
  const message = element("p", "bb-thread-hover-card__message");
  const preview = markdownPreview(source);
  if (preview) {
    message.dataset.markdownBlock = preview.kind;
    appendInlineMarkdown(message, preview.inline, allowEmphasis);
  }
  return message;
}
function providerIcon(provider) {
  if (provider.logoUrl) {
    const image = element(
      "img",
      "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon"
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
            "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon"
          )
        );
      },
      { once: true }
    );
    return image;
  }
  const providerDefinition = provider.id === "codex" ? { definition: OpenAiIcon, name: "OpenAiIcon", viewBox: "0 0 24 24" } : provider.id === "claude-code" ? { definition: ClaudeIcon, name: "ClaudeIcon", viewBox: "0 0 149 149" } : provider.id === "pi" ? { definition: PiIcon, name: "PiIcon", viewBox: "100 100 600 600" } : provider.id === "acp-cursor" ? {
    definition: CursorIcon,
    name: "CursorIcon",
    viewBox: "0 0 24 24"
  } : {
    definition: SourceCodeIcon,
    name: "SourceCodeIcon",
    viewBox: "0 0 24 24"
  };
  const providerMark = icon(
    providerDefinition.definition,
    providerDefinition.name,
    "bb-thread-hover-card__icon bb-thread-hover-card__provider-icon"
  );
  providerMark.setAttribute("viewBox", providerDefinition.viewBox);
  return providerMark;
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
  const provider = element("div", "bb-thread-hover-card__provider");
  const modelLabel = formatModelLabel(
    summary.provider.model,
    summary.provider.id
  );
  const reasoningLabel = summary.provider.reasoningLevel ? REASONING_LABELS[summary.provider.reasoningLevel] : null;
  provider.title = reasoningLabel ? `${summary.provider.displayName} \xB7 ${modelLabel} \xB7 ${reasoningLabel} reasoning` : `${summary.provider.displayName} \xB7 ${modelLabel}`;
  const providerIdentity = element(
    "div",
    "bb-thread-hover-card__provider-identity"
  );
  providerIdentity.append(
    element(
      "span",
      "bb-thread-hover-card__provider-model bb-thread-hover-card__truncate",
      modelLabel
    )
  );
  if (reasoningLabel) {
    const reasoning = element(
      "span",
      "bb-thread-hover-card__reasoning",
      reasoningLabel
    );
    reasoning.title = `${reasoningLabel} reasoning`;
    providerIdentity.append(reasoning);
  }
  const access = permissionMetadata(summary);
  if (access) {
    access.dataset.location = "header";
    providerIdentity.append(access);
  }
  provider.append(
    providerIcon(summary.provider),
    element(
      "span",
      "bb-thread-hover-card__sr-only",
      `${summary.provider.displayName}, `
    ),
    providerIdentity
  );
  header.append(provider);
  const runtimeStatus = statusPresentation(summary.status);
  const times = element("div", "bb-thread-hover-card__times");
  if (summary.currentTurnStartedAt !== null) {
    const runtime2 = element("span", "bb-thread-hover-card__runtime");
    runtime2.dataset.turnStartedAt = String(summary.currentTurnStartedAt);
    const isDone = summary.status === "idle";
    if (isDone) runtime2.dataset.turnEndedAt = String(summary.updatedAt);
    const runtimeValue = element("span", "bb-thread-hover-card__time-value");
    runtimeValue.dataset.timeValue = "";
    const usesThreadStatusIcon = (runtimeStatus.animated || isDone) && runtimeStatus.icon !== null && runtimeStatus.iconName !== null;
    const runtimeIcon = icon(
      usesThreadStatusIcon ? runtimeStatus.icon : AlarmClockIcon,
      usesThreadStatusIcon ? runtimeStatus.iconName : "AlarmClockIcon",
      "bb-thread-hover-card__icon bb-thread-hover-card__time-icon"
    );
    if (usesThreadStatusIcon) {
      runtimeIcon.dataset.tone = runtimeStatus.tone;
      if (runtimeStatus.animated) runtimeIcon.dataset.animated = "true";
      runtimeIcon.removeAttribute("aria-hidden");
      runtimeIcon.setAttribute("aria-label", runtimeStatus.label);
      runtimeIcon.setAttribute("role", "img");
    }
    runtime2.append(
      runtimeIcon,
      element("span", "bb-thread-hover-card__sr-only", "Run time "),
      runtimeValue
    );
    times.append(runtime2);
  } else if (runtimeStatus.icon && runtimeStatus.iconName) {
    const statusIcon = icon(
      runtimeStatus.icon,
      runtimeStatus.iconName,
      "bb-thread-hover-card__icon bb-thread-hover-card__time-icon bb-thread-hover-card__header-status"
    );
    statusIcon.dataset.tone = runtimeStatus.tone;
    if (runtimeStatus.animated) statusIcon.dataset.animated = "true";
    statusIcon.removeAttribute("aria-hidden");
    statusIcon.setAttribute("aria-label", runtimeStatus.label);
    statusIcon.setAttribute("role", "img");
    times.append(statusIcon);
  }
  if (times.childElementCount > 0) header.append(times);
  const content = [header];
  const summaryMessage = summary.latestAssistantMessage;
  if (summaryMessage) {
    const request = element("section", "bb-thread-hover-card__summary");
    request.append(messagePreview(summaryMessage, true));
    content.push(request);
  }
  const hasMeaningfulProject = summary.repository.name !== "Repository unavailable";
  if (summary.repository.isGitRepository || hasMeaningfulProject) {
    const context = element("section", "bb-thread-hover-card__context");
    context.dataset.hasBranch = String(
      summary.repository.isGitRepository && Boolean(summary.repository.branch)
    );
    const project = element("span", "bb-thread-hover-card__project");
    const projectName = element(
      "span",
      "bb-thread-hover-card__project-name",
      summary.repository.name
    );
    projectName.title = summary.repository.name;
    project.append(
      icon(
        Folder01Icon,
        "Folder01Icon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon"
      ),
      projectName
    );
    context.append(project);
    if (summary.repository.isGitRepository && summary.repository.branch) {
      const branch = element("span", "bb-thread-hover-card__branch");
      const branchName = element(
        "span",
        "bb-thread-hover-card__branch-name",
        summary.repository.branch
      );
      branchName.title = summary.repository.branch;
      branch.append(
        icon(
          GitBranchIcon,
          "GitBranchIcon",
          "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon"
        ),
        branchName
      );
      context.append(branch);
    }
    if (summary.repository.isGitRepository && summary.pullRequest.kind === "available") {
      const pullRequest = element("span", "bb-thread-hover-card__pr");
      pullRequest.dataset.kind = summary.pullRequest.kind;
      const pullRequestLink = element("a", "bb-thread-hover-card__pr-link");
      pullRequestLink.href = summary.pullRequest.url;
      pullRequestLink.target = "_blank";
      pullRequestLink.rel = "noopener noreferrer";
      pullRequestLink.setAttribute(
        "aria-label",
        `Pull request #${summary.pullRequest.number}: ${summary.pullRequest.title}. ${summary.pullRequest.signal}. Opens in a new tab.`
      );
      pullRequestLink.title = summary.pullRequest.title;
      pullRequestLink.append(
        icon(
          LinkSquare01Icon,
          "LinkSquare01Icon",
          "bb-thread-hover-card__icon bb-thread-hover-card__link-icon"
        ),
        element(
          "span",
          "bb-thread-hover-card__pr-number",
          `#${summary.pullRequest.number}`
        )
      );
      const pullRequestStatus = element(
        "span",
        "bb-thread-hover-card__pr-status",
        summary.pullRequest.signal
      );
      pullRequestStatus.dataset.tone = pullRequestTone(summary.pullRequest);
      pullRequestStatus.dataset.state = summary.pullRequest.state;
      pullRequestLink.append(pullRequestStatus);
      pullRequest.append(pullRequestLink);
      context.append(pullRequest);
    }
    content.push(context);
  }
  if (!summary.repository.isGitRepository) {
    const localContext = summary.repository.path?.trim() || (summary.repository.name === "Repository unavailable" ? "Local" : summary.repository.name);
    const local = element(
      "section",
      "bb-thread-hover-card__local"
    );
    const localPath = element(
      "span",
      "bb-thread-hover-card__local-path",
      compactLocalPath(localContext)
    );
    localPath.title = localContext;
    local.setAttribute("aria-label", `Local workspace: ${localContext}`);
    local.append(
      icon(
        LaptopIcon,
        "LaptopIcon",
        "bb-thread-hover-card__icon bb-thread-hover-card__meta-icon"
      ),
      localPath
    );
    content.push(local);
  }
  card.replaceChildren(...content);
  refreshRunTime(card);
}
function installHoverCards() {
  let card = null;
  let activeTrigger = null;
  let openTimer = null;
  let closeTimer = null;
  let timeTimer = null;
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
    if (timeTimer) clearInterval(timeTimer);
    timeTimer = setInterval(() => {
      if (card && !card.hidden) refreshRunTime(card);
    }, 1e3);
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
      const focusWasInsideCard = document.activeElement instanceof Node && hoverCard.contains(document.activeElement);
      renderSummary(hoverCard, summary);
      if (focusWasInsideCard) {
        const replacementPullRequestLink = hoverCard.querySelector(
          ".bb-thread-hover-card__pr-link"
        );
        (replacementPullRequestLink ?? activeTrigger)?.focus();
      }
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
    if (timeTimer) {
      clearInterval(timeTimer);
      timeTimer = null;
    }
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
