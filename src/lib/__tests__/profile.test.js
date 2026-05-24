import { describe, expect, it } from 'vitest';
import {
  formatProfileValue,
  formatServer,
  hasProfileDetails,
  profileLabel,
} from '../profile.js';

describe('formatProfileValue', () => {
  it('returns empty string for nullish / empty', () => {
    expect(formatProfileValue(null)).toBe('');
    expect(formatProfileValue(undefined)).toBe('');
    expect(formatProfileValue('')).toBe('');
  });

  it('formats numbers compactly (K/M/B)', () => {
    expect(formatProfileValue(1_234_567)).toBe('1.2M');
    expect(formatProfileValue(500)).toBe('500');
    expect(formatProfileValue(1_500)).toBe('1.5K');
  });

  it('passes strings through unchanged', () => {
    expect(formatProfileValue('hello')).toBe('hello');
  });
});

describe('formatServer', () => {
  it('returns empty string for nullish / empty', () => {
    expect(formatServer(null)).toBe('');
    expect(formatServer(undefined)).toBe('');
    expect(formatServer('')).toBe('');
  });

  it('prefixes with #', () => {
    expect(formatServer(42)).toBe('#42');
    expect(formatServer('123')).toBe('#123');
  });
});

describe('hasProfileDetails', () => {
  it('returns false for null / undefined profile', () => {
    expect(hasProfileDetails(null)).toBe(false);
    expect(hasProfileDetails(undefined)).toBe(false);
  });

  it('returns false when every field is empty', () => {
    expect(
      hasProfileDetails({
        ign: '',
        server: null,
        guild: '',
        level: null,
        power: null,
      }),
    ).toBe(false);
  });

  it('returns true if any single field is present', () => {
    expect(hasProfileDetails({ ign: 'me' })).toBe(true);
    expect(hasProfileDetails({ server: 1 })).toBe(true);
    expect(hasProfileDetails({ guild: 'g' })).toBe(true);
    expect(hasProfileDetails({ level: 30 })).toBe(true);
    expect(hasProfileDetails({ power: 100 })).toBe(true);
  });

  it('ignores fields not in the recognized set', () => {
    expect(hasProfileDetails({ nickname: 'foo' })).toBe(false);
  });
});

describe('profileLabel', () => {
  it('returns empty string for null profile', () => {
    expect(profileLabel(null)).toBe('');
  });

  it('falls back to "Untitled" when nothing is set', () => {
    expect(profileLabel({})).toBe('Untitled');
    expect(profileLabel({ ign: '', name: '' })).toBe('Untitled');
  });

  it('returns just the name when no ign', () => {
    expect(profileLabel({ name: 'Main' })).toBe('Main');
  });

  it('returns just the ign when no name', () => {
    expect(profileLabel({ ign: 'Adam' })).toBe('Adam');
  });

  it('combines "ign (name)" when both are set', () => {
    expect(profileLabel({ ign: 'Adam', name: 'Main' })).toBe('Adam (Main)');
  });

  it('trims whitespace before deciding', () => {
    expect(profileLabel({ ign: '  ', name: 'Main' })).toBe('Main');
  });
});
