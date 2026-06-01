const UMAMI_SCRIPT_SRC = "https://umami.dakheera47.com/script.js";
const UMAMI_WEBSITE_ID = "0dc42ed1-87c3-4ac0-9409-5a9b9588fe66";
const OPENPANEL_SCRIPT_SRC = "https://openpanel.dev/op1.js";
const OPENPANEL_API_URL = "https://openpanel.dakheera47.com/api";
const OPENPANEL_CLIENT_ID = "6a953241-309b-4e5a-be1b-412c5d7b6544";

function isLocalhostHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.endsWith(".localhost")
  );
}

function createOpenPanelProxy(): ((command: string, ...args: unknown[]) => void) & {
  q?: unknown[][];
} {
  const queue: unknown[][] = [];
  const track = (...args: unknown[]) => {
    if (args.length > 0) queue.push(args);
  };

  const proxy = new Proxy(track, {
    get: (_target, property) => {
      if (property === "q") {
        return queue;
      }

      return (...args: unknown[]) => {
        queue.push([property, ...args]);
      };
    },
    has: (_target, property) => property === "q",
  }) as ((command: string, ...args: unknown[]) => void) & {
    q?: unknown[][];
  };

  return proxy;
}

function appendScript(src: string, options?: { defer?: boolean; async?: boolean; dataset?: Record<string, string> }) {
  if (typeof document === "undefined") return;

  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) return;

  const script = document.createElement("script");
  script.src = src;
  if (options?.defer) script.defer = true;
  if (options?.async) script.async = true;
  for (const [key, value] of Object.entries(options?.dataset ?? {})) {
    script.dataset[key] = value;
  }
  document.head.appendChild(script);
}

export function initializeAnalyticsRuntime(hostname = window.location.hostname): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (isLocalhostHostname(hostname)) {
    if (typeof window.op !== "function") {
      window.op = createOpenPanelProxy();
    }
    return;
  }

  if (typeof window.op !== "function") {
    window.op = createOpenPanelProxy();
  }

  window.op("init", {
    apiUrl: OPENPANEL_API_URL,
    clientId: OPENPANEL_CLIENT_ID,
    trackScreenViews: true,
    trackOutgoingLinks: true,
    trackAttributes: true,
  });

  appendScript(UMAMI_SCRIPT_SRC, {
    defer: true,
    dataset: {
      websiteId: UMAMI_WEBSITE_ID,
    },
  });

  appendScript(OPENPANEL_SCRIPT_SRC, {
    defer: true,
    async: true,
  });
}
