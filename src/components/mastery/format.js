// Display helpers shared by the Camp Mastery components.

const DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const DAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatWhen(ms) {
  return Number.isFinite(ms) ? DATE_FORMAT.format(new Date(ms)) : '—';
}

export function formatDay(ms) {
  return Number.isFinite(ms) ? DAY_FORMAT.format(new Date(ms)) : '—';
}

export function formatDays(hours) {
  if (hours === null || hours === undefined) return '—';
  if (!Number.isFinite(hours)) return 'never';
  if (hours <= 0) return 'now';
  const days = hours / 24;
  return days < 1 ? `${Math.ceil(hours)} h` : `${days.toFixed(1)} d`;
}

// Value for an <input type="datetime-local">, in the browser's timezone.
export function toLocalInputValue(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
