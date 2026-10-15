import type { Review, DecideInput, SaveReviewInput } from './types';

import { z } from 'zod';

import { DENIED, APPROVED, DECISION_OUTCOMES, APPROVED_WITH_CONDITIONS } from './review-workflow';

// ----------------------------------------------------------------------

const optionalId = z
  .string()
  .refine((value) => value === '' || /^[1-9]\d*$/.test(value), 'Select an option.');
const longText = z.string().trim().max(4000, 'Use 4000 characters or fewer.');

const toId = (value: string) => (value ? Number(value) : null);
const toText = (value: string) => (value.trim() ? value.trim() : null);

// The summary review form (all fields optional: the reviewer saves as they go).
export const reviewFormSchema = z.object({
  findings: longText,
  vendorQuestions: longText,
  overallAssessment: longText,
  riskRatingId: optionalId,
  recommendationId: optionalId,
  conditions: longText,
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function reviewFormDefaults(review: Review | null): ReviewFormValues {
  return {
    findings: review?.findings ?? '',
    vendorQuestions: review?.vendorQuestions ?? '',
    overallAssessment: review?.overallAssessment ?? '',
    riskRatingId: review?.riskRatingId?.toString() ?? '',
    recommendationId: review?.recommendationId?.toString() ?? '',
    conditions: review?.conditions ?? '',
  };
}

export function saveReviewInput(
  values: ReviewFormValues,
  updatedAt: string | null
): SaveReviewInput {
  return {
    findings: toText(values.findings),
    vendorQuestions: toText(values.vendorQuestions),
    overallAssessment: toText(values.overallAssessment),
    riskRatingId: toId(values.riskRatingId),
    recommendationId: toId(values.recommendationId),
    conditions: toText(values.conditions),
    updatedAt,
  };
}

// ----------------------------------------------------------------------

// The decision. Approvals need an expiry after today; "approved with conditions" needs the conditions.
// With a submitted EEAAP (`hasEeaap`), a plain approval is not allowed: the plan is approved with
// conditions or denied with the request.
export function decideSchema(today: string, hasEeaap = false) {
  return z
    .object({
      outcome: z
        .string()
        .refine((value) => DECISION_OUTCOMES.includes(value), 'Select a decision.'),
      approvalExpirationDate: z.string(),
      accessibilityRiskId: optionalId,
      conditions: longText,
      comments: longText,
    })
    .superRefine((value, ctx) => {
      if (value.outcome && value.outcome !== DENIED) {
        if (!z.iso.date().safeParse(value.approvalExpirationDate).success) {
          ctx.addIssue({
            code: 'custom',
            path: ['approvalExpirationDate'],
            message: 'Enter the date this approval expires.',
          });
        } else if (value.approvalExpirationDate <= today) {
          ctx.addIssue({
            code: 'custom',
            path: ['approvalExpirationDate'],
            message: 'Enter a date after today.',
          });
        }
      }
      if (hasEeaap && value.outcome === APPROVED) {
        ctx.addIssue({
          code: 'custom',
          path: ['outcome'],
          message: 'An EEAAP was submitted: approve with conditions, or deny.',
        });
      }
      if (value.outcome === APPROVED_WITH_CONDITIONS && !value.conditions.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['conditions'],
          message: 'Enter the conditions of this approval.',
        });
      }
    });
}

export type DecideValues = z.infer<ReturnType<typeof decideSchema>>;

export function decideInput(values: DecideValues, updatedAt: string): DecideInput {
  const approved = values.outcome !== DENIED;
  return {
    outcome: values.outcome,
    approvalExpirationDate: approved ? values.approvalExpirationDate : null,
    accessibilityRiskId: toId(values.accessibilityRiskId),
    conditions: values.outcome === APPROVED_WITH_CONDITIONS ? toText(values.conditions) : null,
    comments: toText(values.comments),
    updatedAt,
  };
}

// Today as a date field value (yyyy-mm-dd), in local time.
export function todayDate(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
