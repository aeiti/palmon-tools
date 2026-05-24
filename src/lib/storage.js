import { z } from 'zod';

const STORAGE_KEY = 'palmon-tools:v1';

const EXPORT_FORMAT = 'palmon-tools-backup';
const EXPORT_VERSION = 1;

// Validation only enforces the *minimum envelope* needed to recognize a
// Palmon Tools backup. Field-level validation (chest counts, palmon shapes,
// etc.) is the normalize functions' job — they're permissive on purpose so
// older / hand-edited backups stay loadable.
const ProfileSchema = z
  .object({
    id: z.string().min(1, 'profile id is required'),
    name: z.string().min(1, 'profile name is required'),
  })
  .loose();

const StateSchema = z
  .object({
    activeProfileId: z.string(),
    profiles: z.array(ProfileSchema).min(1, 'at least one profile required'),
  })
  .loose();

const EnvelopeSchema = z
  .object({
    format: z.literal(EXPORT_FORMAT),
    version: z.number(),
    state: StateSchema,
    exportedAt: z.string().optional(),
  })
  .loose();

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

function formatZodIssues(issues) {
  // Pick at most 2 issues to surface — full lists get noisy on big shapes.
  return issues
    .slice(0, 2)
    .map((i) => {
      const path = i.path.length ? ` at ${i.path.join('.')}` : '';
      return `${i.message}${path}`;
    })
    .join('; ');
}

export function parseImport(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }

  // Try the standard envelope first.
  const envelope = EnvelopeSchema.safeParse(data);
  if (envelope.success) return envelope.data.state;

  // Fall back to a raw state object (hand-edited file).
  const rawState = StateSchema.safeParse(data);
  if (rawState.success) return rawState.data;

  // Neither shape matched. If the data looks like it was *meant* to be an
  // envelope (has format / state / version / profiles at any level), surface
  // the envelope error; otherwise give the generic message.
  const looksLikeEnvelope =
    data &&
    typeof data === 'object' &&
    ('format' in data || 'state' in data || 'version' in data);
  if (looksLikeEnvelope) {
    throw new Error(
      `Backup file is malformed: ${formatZodIssues(envelope.error.issues)}`,
    );
  }
  const looksLikeRawState =
    data && typeof data === 'object' && 'profiles' in data;
  if (looksLikeRawState) {
    throw new Error(
      `Backup file is malformed: ${formatZodIssues(rawState.error.issues)}`,
    );
  }
  throw new Error("That doesn't look like a Palmon Tools backup file.");
}
