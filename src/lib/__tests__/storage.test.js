import { describe, expect, it } from 'vitest';
import { buildExport, parseImport } from '../storage.js';

const SAMPLE_STATE = {
  activeProfileId: 'p1',
  profiles: [{ id: 'p1', name: 'Main' }],
};

describe('buildExport', () => {
  it('wraps state with format, version, exportedAt, and the state itself', () => {
    const payload = buildExport(SAMPLE_STATE);
    expect(payload.format).toBe('palmon-tools-backup');
    expect(payload.version).toBe(1);
    expect(typeof payload.exportedAt).toBe('string');
    expect(payload.state).toBe(SAMPLE_STATE);
  });

  it('exportedAt is a parseable ISO string', () => {
    const payload = buildExport(SAMPLE_STATE);
    expect(Number.isFinite(Date.parse(payload.exportedAt))).toBe(true);
  });
});

describe('parseImport', () => {
  it('accepts a full backup envelope and returns the inner state', () => {
    const payload = buildExport(SAMPLE_STATE);
    const out = parseImport(JSON.stringify(payload));
    expect(out).toEqual(SAMPLE_STATE);
  });

  it('accepts a raw state object as a fallback (hand-edited file)', () => {
    const out = parseImport(JSON.stringify(SAMPLE_STATE));
    expect(out).toEqual(SAMPLE_STATE);
  });

  it('throws a clear error for invalid JSON', () => {
    expect(() => parseImport('not json')).toThrow(/valid JSON/);
  });

  it('throws when the envelope is missing required fields', () => {
    expect(() => parseImport(JSON.stringify({ format: 'palmon-tools-backup' })),
    ).toThrow(/backup file/);
  });

  it('throws for completely unrelated JSON', () => {
    expect(() => parseImport(JSON.stringify({ foo: 'bar' }))).toThrow(
      /backup file/,
    );
  });

  it('round-trips buildExport → parseImport', () => {
    const payload = buildExport(SAMPLE_STATE);
    const restored = parseImport(JSON.stringify(payload));
    expect(restored).toEqual(SAMPLE_STATE);
  });
});
