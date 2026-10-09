import { it, expect, describe, afterEach } from 'vitest';

import { formatDateOnly, formatDateTime } from './format';

// ----------------------------------------------------------------------

/**
 * The machine timezone is switched at run time through process.env.TZ, which Node honors on this platform
 * (checked on Windows). The first test is a canary: if switching ever stops working (another OS or Node
 * version) it fails loudly, instead of letting the timezone assertions below pass for the wrong reason.
 */
const originalTz = process.env.TZ;

afterEach(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

const ZONES = ['UTC', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'America/New_York'];

describe('timezone switching (canary)', () => {
  it('changes the machine timezone', () => {
    const offsets = ZONES.map((zone) => {
      process.env.TZ = zone;
      return new Date('2026-10-09T12:00:00Z').getTimezoneOffset();
    });

    expect(new Set(offsets).size).toBe(ZONES.length);
  });
});

describe('formatDateTime (local timezone)', () => {
  // 01:30 UTC on Oct 9: still Oct 8 in the Americas, already Oct 9 in Asia and the Pacific.
  const INSTANT = '2026-10-09T01:30:00Z';

  it.each([
    ['UTC', 'Oct 9, 2026'],
    ['Pacific/Kiritimati', 'Oct 9, 2026'],
    ['Pacific/Pago_Pago', 'Oct 8, 2026'],
    ['America/New_York', 'Oct 8, 2026'],
  ])('shows the local date in %s', (zone, expected) => {
    process.env.TZ = zone;

    expect(formatDateTime(INSTANT)).toBe(expected);
  });

  it('matches the same instant formatted in the machine timezone', () => {
    const expected = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(INSTANT));

    expect(formatDateTime(INSTANT)).toBe(expected);
  });
});

describe('formatDateOnly (calendar date, always UTC)', () => {
  it.each([null, ''])('shows "Not set" for %j', (value) => {
    expect(formatDateOnly(value)).toBe('Not set');
  });

  it.each(ZONES)('never shifts the calendar date in %s', (zone) => {
    process.env.TZ = zone;

    expect(formatDateOnly('2026-10-09')).toBe('Oct 9, 2026');
    expect(formatDateOnly('2026-01-01')).toBe('Jan 1, 2026');
    expect(formatDateOnly('2028-02-29')).toBe('Feb 29, 2028');
    expect(formatDateOnly('2026-12-31')).toBe('Dec 31, 2026');
  });
});
