export interface RequestConfig {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  useCorsProxy: boolean;
}

export interface ResponseResult {
  status: number;
  statusText: string;
  headers: string;
  body: string;
  timeMs: number;
}

const CORS_PROXY = "https://corsproxy.io/?";

function isLocalhost(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "localhost" ||
      parsed.hostname === "127.0.0.1" ||
      parsed.hostname === "::1"
    );
  } catch {
    return false;
  }
}

const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);

export async function sendRequest(config: RequestConfig): Promise<ResponseResult> {
  let { url } = config;

  if (config.useCorsProxy && !isLocalhost(url)) {
    url = CORS_PROXY + encodeURIComponent(url);
  }

  const headers: Record<string, string> = {};
  for (const h of config.headers) {
    const key = h.key.trim();
    const value = h.value.trim();
    if (key) {
      headers[key] = value;
    }
  }

  const init: RequestInit = {
    method: config.method,
    headers,
  };

  if (METHODS_WITH_BODY.has(config.method) && config.body.trim()) {
    init.body = config.body;
  }

  const start = performance.now();
  const response = await fetch(url, init);
  const timeMs = Math.round(performance.now() - start);

  const responseHeaders: string[] = [];
  response.headers.forEach((value, key) => {
    responseHeaders.push(`${key}: ${value}`);
  });

  let body: string;
  try {
    body = await response.text();
  } catch {
    body = "[Could not read response body]";
  }

  // Try to pretty-print JSON
  try {
    const parsed = JSON.parse(body);
    body = JSON.stringify(parsed, null, 2);
  } catch {
    // Not JSON, leave as-is
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders.join("\n"),
    body,
    timeMs,
  };
}

export function isCorsError(error: unknown): boolean {
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("cors");
  }
  return false;
}

export function corsErrorMessage(url: string, proxyEnabled: boolean): string {
  if (isLocalhost(url)) {
    return (
      "Request failed. The server at " + url + " may not be running, " +
      "or it rejected the request. Check that the server is up and accessible."
    );
  }

  if (proxyEnabled) {
    return (
      "Request failed even with the CORS proxy enabled. " +
      "The API may be down, or the proxy may be temporarily unavailable. " +
      "Try again in a moment, or test with a different URL."
    );
  }

  return (
    "Request blocked by CORS policy.\n\n" +
    "Browsers prevent cross-origin requests unless the server explicitly allows them.\n\n" +
    "Options:\n" +
    "  1. Enable the CORS Proxy toggle above (uses corsproxy.io, a third-party service)\n" +
    "  2. If you control the API, add appropriate Access-Control-Allow-Origin headers\n" +
    "  3. For local development, CORS is usually not an issue"
  );
}
