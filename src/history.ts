const STORAGE_KEY = "fnoneshot_history";
const MAX_ITEMS = 20;

export interface HistoryEntry {
  method: string;
  url: string;
  headers: Array<{ key: string; value: string }>;
  body: string;
  status: number;
  timestamp: number;
}

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry): void {
  const history = loadHistory();
  history.unshift(entry);
  if (history.length > MAX_ITEMS) {
    history.length = MAX_ITEMS;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
