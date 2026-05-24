import { formatCompact } from './format.js';

export function formatProfileValue(value) {
  if (value === null || value === undefined || value === '') return '';
  return typeof value === 'number' ? formatCompact(value) : value;
}

export function formatServer(value) {
  if (value === null || value === undefined || value === '') return '';
  return `#${value}`;
}

function isPresent(value) {
  return value !== null && value !== undefined && value !== '';
}

export function hasProfileDetails(profile) {
  if (!profile) return false;
  return (
    isPresent(profile.ign) ||
    isPresent(profile.server) ||
    isPresent(profile.guild) ||
    isPresent(profile.level) ||
    isPresent(profile.power)
  );
}

export function profileLabel(profile) {
  if (!profile) return '';
  const ign = (profile.ign || '').trim();
  const name = (profile.name || '').trim();
  if (ign && name) return `${ign} (${name})`;
  return ign || name || 'Untitled';
}
