import { it, expect, describe } from 'vitest';

import { defaultExpiryDate, countByReviewGroup } from './review-workflow';
import {
  todayDate,
  decideInput,
  decideSchema,
  saveReviewInput,
  reviewFormDefaults,
} from './review-schema';

// ----------------------------------------------------------------------

const TODAY = '2026-10-15';

const decision = {
  outcome: 'Approved',
  approvalExpirationDate: '2027-10-15',
  accessibilityRiskId: '',
  conditions: '',
  comments: '',
};

const fields = (values: typeof decision) => {
  const result = decideSchema(TODAY).safeParse(values);
  return result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
};

describe('decide schema', () => {
  it('requires a decision', () => {
    expect(fields({ ...decision, outcome: '' })).toEqual(['outcome']);
    expect(fields({ ...decision, outcome: 'Submitted' })).toEqual(['outcome']);
  });

  it('requires an expiry after today for approvals, but not for a denial', () => {
    expect(fields(decision)).toEqual([]);
    expect(fields({ ...decision, approvalExpirationDate: '' })).toEqual(['approvalExpirationDate']);
    expect(fields({ ...decision, approvalExpirationDate: TODAY })).toEqual([
      'approvalExpirationDate',
    ]);
    expect(fields({ ...decision, outcome: 'Denied', approvalExpirationDate: '' })).toEqual([]);
  });

  it('requires conditions for an approval with conditions', () => {
    expect(fields({ ...decision, outcome: 'ApprovedWithConditions' })).toEqual(['conditions']);
    expect(
      fields({ ...decision, outcome: 'ApprovedWithConditions', conditions: 'Use captions.' })
    ).toEqual([]);
  });

  it('sends no expiry or conditions where they do not apply', () => {
    expect(
      decideInput(
        { ...decision, outcome: 'Denied', conditions: 'ignored', accessibilityRiskId: '303' },
        'stamp'
      )
    ).toEqual({
      outcome: 'Denied',
      approvalExpirationDate: null,
      accessibilityRiskId: 303,
      conditions: null,
      comments: null,
      updatedAt: 'stamp',
    });
  });
});

describe('review form', () => {
  it('maps empty fields to null and ids to numbers', () => {
    const values = {
      ...reviewFormDefaults(null),
      findings: ' Focus is hard to see. ',
      riskRatingId: '302',
    };
    expect(saveReviewInput(values, null)).toEqual({
      findings: 'Focus is hard to see.',
      vendorQuestions: null,
      overallAssessment: null,
      riskRatingId: 302,
      recommendationId: null,
      conditions: null,
      updatedAt: null,
    });
  });
});

describe('review workflow helpers', () => {
  it('defaults the expiry to twelve months from today', () => {
    expect(defaultExpiryDate(new Date(2026, 9, 15))).toBe('2027-10-15');
    expect(todayDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('counts requests per review stage', () => {
    expect(
      countByReviewGroup([
        { statusCode: 'Submitted' },
        { statusCode: 'HumanReview' },
        { statusCode: 'AiReview' },
        { statusCode: 'AwaitingEeaap' },
        { statusCode: 'Denied' },
        { statusCode: 'SomethingNew' },
      ])
    ).toEqual({ 'Waiting to start': 1, 'In review': 2, 'Waiting on others': 1, Decided: 1 });
  });
});
