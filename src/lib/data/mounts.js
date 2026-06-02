// Mount catalog data. Pure facts about the seven mounts that live in the
// Stable building, plus the caps and thresholds the game enforces. Skill
// entries live in src/lib/data/mountSkills.js, keyed by the same `key`.

export const MAX_MOUNT_LEVEL = 100;
export const MAX_MOUNT_SKILL_LEVEL = 5;

// Mount level at which each successive skill level becomes active. Index 0
// is the threshold for skill level 1, index 4 for skill level 5.
export const MOUNT_SKILL_LEVEL_THRESHOLDS = [10, 30, 50, 70, 100];

export const MOUNTS = [
  { key: 'amourphibian', name: 'Amourphibian' },
  { key: 'bunnyRunny', name: 'Bunny Runny' },
  { key: 'narfoal', name: 'Narfoal' },
  { key: 'nightMare', name: 'Night Mare' },
  { key: 'skyboundPatrol', name: 'Skybound Patrol' },
  { key: 'slackycapy', name: 'Slackycapy' },
  { key: 'swiftger', name: 'Swiftger' },
];

export const MOUNTS_BY_KEY = Object.fromEntries(
  MOUNTS.map((m) => [m.key, m]),
);

// Skill level (1-5) active at a given mount level. Returns 0 below the L1
// threshold so callers can render "skill not yet unlocked" without a
// separate guard.
export function mountSkillLevelFor(mountLevel) {
  let level = 0;
  for (let i = 0; i < MOUNT_SKILL_LEVEL_THRESHOLDS.length; i++) {
    if (mountLevel >= MOUNT_SKILL_LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}
