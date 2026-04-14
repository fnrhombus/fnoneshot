import type { ResponseResult } from "./request";

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return "status-2xx";
  if (status >= 300 && status < 400) return "status-3xx";
  if (status >= 400 && status < 500) return "status-4xx";
  return "status-5xx";
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function renderResponse(result: ResponseResult): void {
  const placeholder = document.getElementById("response-placeholder")!;
  const container = document.getElementById("response")!;
  const errorEl = document.getElementById("response-error")!;

  placeholder.classList.add("hidden");
  errorEl.classList.add("hidden");
  container.classList.remove("hidden");

  const badge = document.getElementById("status-badge")!;
  badge.textContent = `${result.status} ${result.statusText}`;
  badge.className = "status-badge " + getStatusClass(result.status);

  document.getElementById("timing")!.textContent = `${result.timeMs}ms`;
  document.getElementById("response-headers")!.textContent = result.headers;

  const bodyEl = document.getElementById("response-body")!;
  bodyEl.innerHTML = highlightJson(result.body);
}

export function renderError(message: string): void {
  const placeholder = document.getElementById("response-placeholder")!;
  const container = document.getElementById("response")!;
  const errorEl = document.getElementById("response-error")!;

  placeholder.classList.add("hidden");
  container.classList.add("hidden");
  errorEl.classList.remove("hidden");
  errorEl.textContent = message;
}

function highlightJson(str: string): string {
  // Quick check: if it looks like JSON, apply lightweight syntax coloring
  const trimmed = str.trim();
  if (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  ) {
    return escapeHtml(str).replace(
      /("(?:[^"\\]|\\.)*")\s*:/g,
      '<span style="color:#4fc3f7">$1</span>:'
    ).replace(
      /:\s*("(?:[^"\\]|\\.)*")/g,
      ': <span style="color:#66bb6a">$1</span>'
    ).replace(
      /:\s*(\d+\.?\d*)/g,
      ': <span style="color:#ffa726">$1</span>'
    ).replace(
      /:\s*(true|false|null)/g,
      ': <span style="color:#ef5350">$1</span>'
    );
  }

  return escapeHtml(str);
}
