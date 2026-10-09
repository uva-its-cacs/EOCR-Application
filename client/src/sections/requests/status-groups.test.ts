import { it, expect, describe } from 'vitest';

import { countByGroup, STATUS_GROUPS, getStatusGroup, UNKNOWN_STATUS_GROUP } from './status-groups';

// ----------------------------------------------------------------------

// Every RequestStatus code on the server (see AGENTS.md, "Request status codes") and its group.
const EXPECTED: Record<string, string> = {
  Draft: 'Drafts',
  Submitted: 'In review',
  AiReview: 'In review',
  HumanReview: 'In review',
  MoreInfoNeeded: 'Needs your action',
  AwaitingEeaap: 'Needs your action',
  Approved: 'Decided',
  ApprovedWithConditions: 'Decided',
  Denied: 'Decided',
};

describe('getStatusGroup', () => {
  it.each(Object.entries(EXPECTED))('%s is in "%s"', (code, group) => {
    expect(getStatusGroup(code)).toBe(group);
  });

  it('covers all nine request statuses', () => {
    expect(Object.keys(EXPECTED)).toHaveLength(9);
  });

  it('lists every status in exactly one group, and only known statuses', () => {
    const listed = Object.values(STATUS_GROUPS).flat();

    expect([...listed].sort()).toEqual(Object.keys(EXPECTED).sort());
    expect(new Set(listed).size).toBe(listed.length);
  });

  it.each(['Archived', 'draft', '', ' Draft'])(
    'falls back to "Other" for the unknown code %j',
    (code) => {
      expect(getStatusGroup(code)).toBe(UNKNOWN_STATUS_GROUP);
      expect(UNKNOWN_STATUS_GROUP).toBe('Other');
    }
  );
});

describe('countByGroup', () => {
  it('counts requests per group in STATUS_GROUPS order, ignoring unknown codes', () => {
    const counts = countByGroup([
      { statusCode: 'Draft' },
      { statusCode: 'AiReview' },
      { statusCode: 'HumanReview' },
      { statusCode: 'Denied' },
      { statusCode: 'Archived' },
    ]);

    expect(counts).toEqual({ Drafts: 1, 'In review': 2, 'Needs your action': 0, Decided: 1 });
    expect(Object.keys(counts)).toEqual(Object.keys(STATUS_GROUPS));
  });

  it('gives zeros for no requests', () => {
    expect(Object.values(countByGroup([]))).toEqual([0, 0, 0, 0]);
  });
});
