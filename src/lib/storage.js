const STORAGE_KEY = 'palmon-tools:v1';

const EXPORT_FORMAT = 'palmon-tools-backup';
const EXPORT_VERSION = 1;

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function buildExport(state) {
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  if (
    data &&
    data.format === EXPORT_FORMAT &&
    data.state &&
    Array.isArray(data.state.profiles)
  ) {
    return data.state;
  }
  if (data && Array.isArray(data.profiles)) {
    return data;
  }
  throw new Error("That doesn't look like a Palmon Tools backup file.");
}
