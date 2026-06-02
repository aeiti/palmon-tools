import { describe, expect, it } from 'vitest';
import {
  customIdFromKey,
  customItemKey,
  emptyOther,
  groupTotal,
  hasAnyOther,
  isCustomItemKey,
  itemsByGroup,
  normalizeCustomOther,
  normalizeOther,
} from '../other.js';
import { OTHER_ITEMS } from '../data/other.js';

describe('customItemKey / isCustomItemKey / customIdFromKey', () => {
  it('round-trips a custom id through the key helpers', () => {
    const id = 'abc-123';
    const key = customItemKey(id);
    expect(key).toBe('custom:abc-123');
    expect(isCustomItemKey(key)).toBe(true);
    expect(customIdFromKey(key)).toBe(id);
  });

  it('rejects non-custom keys', () => {
    expect(isCustomItemKey('aurora-essence')).toBe(false);
    expect(isCustomItemKey('')).toBe(false);
    expect(isCustomItemKey(null)).toBe(false);
    expect(customIdFromKey('aurora-essence')).toBeNull();
  });
});

describe('normalizeCustomOther', () => {
  it('returns [] for non-array input', () => {
    expect(normalizeCustomOther(null)).toEqual([]);
    expect(normalizeCustomOther('garbage')).toEqual([]);
  });

  it('keeps valid entries and drops missing id / label', () => {
    const out = normalizeCustomOther([
      { id: 'a', label: 'Alpha', group: 'premium' },
      { id: 'b', label: '' },
      { label: 'no id', group: 'premium' },
      { id: 'c', label: 'Charlie' }, // missing group
    ]);
    expect(out.map((c) => c.id)).toEqual(['a', 'c']);
    // Missing group falls back to the utility catch-all rather than the
    // first user-facing group, so orphan custom items don't surprise the
    // user by appearing in "Action Points".
    expect(out[1].group).toBe('utility');
  });

  it('drops duplicates by id (keeps first)', () => {
    const out = normalizeCustomOther([
      { id: 'a', label: 'First', group: 'premium' },
      { id: 'a', label: 'Second', group: 'mount' },
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].label).toBe('First');
  });

  it('trims and caps label length', () => {
    const long = 'x'.repeat(120);
    const out = normalizeCustomOther([
      { id: 'a', label: `  spaced  `, group: 'premium' },
      { id: 'b', label: long, group: 'premium' },
    ]);
    expect(out[0].label).toBe('spaced');
    expect(out[1].label).toHaveLength(80);
  });

  it('falls back to the utility group when group is unknown', () => {
    const out = normalizeCustomOther([
      { id: 'a', label: 'X', group: 'bogus' },
    ]);
    expect(out[0].group).toBe('utility');
  });
});

describe('emptyOther', () => {
  it('includes every built-in item at 0', () => {
    const out = emptyOther();
    for (const item of OTHER_ITEMS) {
      expect(out[item.key]).toBe(0);
    }
  });

  it('includes provided custom items at 0', () => {
    const out = emptyOther([{ id: 'a', label: 'A', group: 'premium' }]);
    expect(out['custom:a']).toBe(0);
  });
});

describe('normalizeOther', () => {
  it('floors fractional counts and clamps negatives to 0', () => {
    const out = normalizeOther({
      'aurora-essence': 7.9,
      'evolution-stone': -3,
    });
    expect(out['aurora-essence']).toBe(7);
    expect(out['evolution-stone']).toBe(0);
  });

  it('drops unknown keys', () => {
    const out = normalizeOther({
      'aurora-essence': 1,
      'not-a-real-key': 5,
    });
    expect(out['aurora-essence']).toBe(1);
    expect(out['not-a-real-key']).toBeUndefined();
  });

  it('keeps known custom keys', () => {
    const customs = [{ id: 'x', label: 'X', group: 'premium' }];
    const out = normalizeOther({ 'custom:x': 5, 'custom:bogus': 9 }, customs);
    expect(out['custom:x']).toBe(5);
    expect(out['custom:bogus']).toBeUndefined();
  });
});

describe('itemsByGroup', () => {
  it('returns built-in items followed by custom items in the same group', () => {
    const customs = [
      { id: 'a', label: 'AAA', group: 'premium' },
      { id: 'b', label: 'BBB', group: 'mount' },
    ];
    const items = itemsByGroup('premium', customs);
    const customCount = items.filter((i) => i.custom).length;
    expect(customCount).toBe(1);
    expect(items[items.length - 1].label).toBe('AAA');
  });
});

describe('groupTotal', () => {
  it('sums all items (built-in + custom) for a group', () => {
    const customs = [{ id: 'a', label: 'A', group: 'premium' }];
    const other = emptyOther(customs);
    other['ur-palmon-omni-token'] = 2;
    other['ur-palmon-token'] = 3;
    other['custom:a'] = 5;
    expect(groupTotal(other, 'premium', customs)).toBe(10);
  });

  it('returns 0 for null other', () => {
    expect(groupTotal(null, 'premium')).toBe(0);
  });
});

describe('hasAnyOther', () => {
  it('returns false for null / empty', () => {
    expect(hasAnyOther(null)).toBe(false);
    expect(hasAnyOther(emptyOther())).toBe(false);
  });

  it('returns true if any built-in is nonzero', () => {
    const other = emptyOther();
    other['aurora-essence'] = 1;
    expect(hasAnyOther(other)).toBe(true);
  });

  it('returns true if any custom is nonzero', () => {
    const customs = [{ id: 'a', label: 'A', group: 'premium' }];
    const other = emptyOther(customs);
    other['custom:a'] = 1;
    expect(hasAnyOther(other, customs)).toBe(true);
  });
});
