import { formatProfileValue } from '../lib/profile.js';

function DetailChip({ label, value }) {
  const display = formatProfileValue(value);
  if (display === '') return null;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-slate-700/70 px-2 py-0.5 text-xs text-slate-200 ring-1 ring-slate-600">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{display}</span>
    </span>
  );
}

export default function ProfileSummary({ profile }) {
  if (!profile) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <DetailChip label="IGN" value={profile.ign} />
      <DetailChip label="Server" value={profile.server} />
      <DetailChip label="Guild" value={profile.guild} />
      <DetailChip label="Level" value={profile.level} />
      <DetailChip label="Power" value={profile.power} />
    </div>
  );
}
