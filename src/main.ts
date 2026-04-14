import { sendRequest, isCorsError, corsErrorMessage } from "./request";
import { renderResponse, renderError } from "./response";
import { loadHistory, saveToHistory, clearHistory, type HistoryEntry } from "./history";

// --- DOM refs ---
const methodEl = document.getElementById("method") as HTMLSelectElement;
const urlEl = document.getElementById("url") as HTMLInputElement;
const sendBtn = document.getElementById("send") as HTMLButtonElement;
const addHeaderBtn = document.getElementById("add-header") as HTMLButtonElement;
const headersEl = document.getElementById("headers") as HTMLDivElement;
const bodySection = document.getElementById("body-section") as HTMLDivElement;
const bodyEl = document.getElementById("body") as HTMLTextAreaElement;
const corsProxyEl = document.getElementById("cors-proxy") as HTMLInputElement;
const historyEl = document.getElementById("history") as HTMLDivElement;
const clearHistoryBtn = document.getElementById("clear-history") as HTMLButtonElement;

// --- Headers ---
function createHeaderRow(key = "", value = ""): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "header-row";

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = "Header name";
  keyInput.value = key;

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = "Value";
  valueInput.value = value;

  const removeBtn = document.createElement("button");
  removeBtn.className = "btn-remove";
  removeBtn.textContent = "x";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  return row;
}

function getHeaders(): Array<{ key: string; value: string }> {
  const rows = headersEl.querySelectorAll(".header-row");
  return Array.from(rows).map((row) => {
    const inputs = row.querySelectorAll("input");
    return { key: inputs[0].value, value: inputs[1].value };
  });
}

function setHeaders(headers: Array<{ key: string; value: string }>): void {
  headersEl.innerHTML = "";
  headers.forEach((h) => headersEl.appendChild(createHeaderRow(h.key, h.value)));
}

// Init with default Content-Type header
headersEl.appendChild(createHeaderRow("Content-Type", "application/json"));

addHeaderBtn.addEventListener("click", () => {
  const row = createHeaderRow();
  headersEl.appendChild(row);
  row.querySelector("input")?.focus();
});

// --- Body visibility ---
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH"]);

function updateBodyVisibility(): void {
  bodySection.classList.toggle("visible", METHODS_WITH_BODY.has(methodEl.value));
}

methodEl.addEventListener("change", updateBodyVisibility);
updateBodyVisibility();

// --- Send ---
async function send(): Promise<void> {
  const url = urlEl.value.trim();
  if (!url) {
    urlEl.focus();
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "...";

  try {
    const result = await sendRequest({
      method: methodEl.value,
      url,
      headers: getHeaders(),
      body: bodyEl.value,
      useCorsProxy: corsProxyEl.checked,
    });

    renderResponse(result);

    saveToHistory({
      method: methodEl.value,
      url,
      headers: getHeaders(),
      body: bodyEl.value,
      status: result.status,
      timestamp: Date.now(),
    });
    renderHistory();
  } catch (err: unknown) {
    if (isCorsError(err)) {
      renderError(corsErrorMessage(url, corsProxyEl.checked));
    } else {
      renderError(err instanceof Error ? err.message : String(err));
    }
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = "Send";
  }
}

sendBtn.addEventListener("click", send);

// --- Keyboard shortcuts ---
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    e.preventDefault();
    send();
  }
});

// --- History ---
function renderHistory(): void {
  const items = loadHistory();
  historyEl.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "placeholder";
    empty.style.height = "auto";
    empty.style.padding = "8px 0";
    empty.style.fontSize = "12px";
    empty.textContent = "No history yet";
    historyEl.appendChild(empty);
    return;
  }

  items.forEach((entry: HistoryEntry) => {
    const item = document.createElement("div");
    item.className = "history-item";

    const method = document.createElement("span");
    method.className = "history-method";
    method.textContent = entry.method;

    const url = document.createElement("span");
    url.className = "history-url";
    url.textContent = entry.url;

    const status = document.createElement("span");
    status.className = "history-status";
    status.textContent = String(entry.status);
    if (entry.status >= 200 && entry.status < 300) status.style.color = "var(--green)";
    else if (entry.status >= 300 && entry.status < 400) status.style.color = "var(--blue)";
    else if (entry.status >= 400 && entry.status < 500) status.style.color = "var(--yellow)";
    else status.style.color = "var(--red)";

    item.appendChild(method);
    item.appendChild(url);
    item.appendChild(status);

    item.addEventListener("click", () => {
      methodEl.value = entry.method;
      urlEl.value = entry.url;
      setHeaders(entry.headers);
      bodyEl.value = entry.body;
      updateBodyVisibility();
      urlEl.focus();
    });

    historyEl.appendChild(item);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  clearHistory();
  renderHistory();
});

// Initial render
renderHistory();
urlEl.focus();
