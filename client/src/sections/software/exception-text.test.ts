import { it, expect, describe } from 'vitest';

import { exceptionText } from './exception-text';

// ----------------------------------------------------------------------

describe('exceptionText', () => {
  it('says until when current and expired when past, with the date', () => {
    expect(exceptionText({ exceptionExpirationDate: '2027-04-08', exceptionExpired: false })).toBe(
      'Exception (EEAAP) until Apr 8, 2027'
    );
    expect(exceptionText({ exceptionExpirationDate: '2026-09-10', exceptionExpired: true })).toBe(
      'Exception (EEAAP) expired Sep 10, 2026'
    );
  });
});
