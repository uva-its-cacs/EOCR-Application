import type { RequestException, SaveExceptionInput } from './types';

import { z } from 'zod';

// ----------------------------------------------------------------------

const answer = z.string().trim().max(4000, 'Use 4000 characters or fewer.');

// Saving keeps partial answers; submitting needs all three (the server agrees: ExceptionRepo.SubmitAsync).
export const eeaapSaveSchema = z.object({
  businessJustification: answer,
  accessibilityImpact: answer,
  mitigationPlan: answer,
});

export const eeaapSubmitSchema = z.object({
  businessJustification: answer.min(1, 'Explain why your team needs this software.'),
  accessibilityImpact: answer.min(1, 'Describe who is affected and how.'),
  mitigationPlan: answer.min(1, 'Describe how people will get equally effective access.'),
});

export type EeaapValues = z.infer<typeof eeaapSaveSchema>;

export function eeaapValuesFrom(exception: RequestException | null): EeaapValues {
  return {
    businessJustification: exception?.businessJustification ?? '',
    accessibilityImpact: exception?.accessibilityImpact ?? '',
    mitigationPlan: exception?.mitigationPlan ?? '',
  };
}

const toText = (value: string) => (value.trim() ? value.trim() : null);

export function eeaapInputFrom(values: EeaapValues, updatedAt: string): SaveExceptionInput {
  return {
    businessJustification: toText(values.businessJustification),
    accessibilityImpact: toText(values.accessibilityImpact),
    mitigationPlan: toText(values.mitigationPlan),
    updatedAt,
  };
}
