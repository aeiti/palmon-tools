export function formatDHM(totalMinutes) {
  const m = Math.max(0, Math.floor(totalMinutes));
  const days = Math.floor(m / 1440);
  const hours = Math.floor((m % 1440) / 60);
  const minutes = m % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(' ');
}

export function formatDecimalHours(totalMinutes) {
  const hours = totalMinutes / 60;
  return `${hours.toFixed(2)} h`;
}

export function dhmToMinutes({ days = 0, hours = 0, minutes = 0 }) {
  return (
    (Number(days) || 0) * 1440 +
    (Number(hours) || 0) * 60 +
    (Number(minutes) || 0)
  );
}
