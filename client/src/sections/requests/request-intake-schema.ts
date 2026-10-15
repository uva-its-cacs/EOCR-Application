import type { RequestDetail, SaveRequestInput } from './types';

import { z } from 'zod';

// ----------------------------------------------------------------------

const isHttpUrl = (value: string) => {
  if (!value) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

const fields = {
  softwareName: z
    .string()
    .trim()
    .min(1, 'Enter the software name.')
    .max(200, 'Use 200 characters or fewer.'),
  vendor: z.string().trim().max(200, 'Use 200 characters or fewer.'),
  department: z.string().trim().max(200, 'Use 200 characters or fewer.'),
  businessNeed: z.string().trim().max(4000, 'Use 4000 characters or fewer.'),
  fundingSourceId: z.string(),
  url: z
    .string()
    .trim()
    .max(2000, 'Use 2000 characters or fewer.')
    .refine(isHttpUrl, 'Enter a valid HTTP or HTTPS address.'),
  vpatSubmitted: z.boolean(),
  softwareId: z.number().nullable(),
};

// Saving a draft needs only the software name (the server agrees: SaveRequestDto).
export const requestDraftSchema = z.object(fields);

// Submitting also needs the fields the server checks in RequestRepo.SubmitAsync.
export const requestSubmitSchema = z.object({
  ...fields,
  vendor: fields.vendor.min(1, 'Enter the vendor.'),
  department: fields.department.min(1, 'Enter your department.'),
  businessNeed: fields.businessNeed.min(1, 'Describe the business need.'),
  fundingSourceId: z.string().min(1, 'Select a funding source.'),
});

export type RequestIntakeValues = z.infer<typeof requestDraftSchema>;

export const emptyIntakeValues: RequestIntakeValues = {
  softwareName: '',
  vendor: '',
  department: '',
  businessNeed: '',
  fundingSourceId: '',
  url: '',
  vpatSubmitted: false,
  softwareId: null,
};

export function intakeValuesFrom(request: RequestDetail): RequestIntakeValues {
  return {
    softwareName: request.softwareName,
    vendor: request.vendor,
    department: request.department,
    businessNeed: request.businessNeed,
    fundingSourceId: request.fundingSourceId?.toString() ?? '',
    url: request.url ?? '',
    vpatSubmitted: request.vpatSubmitted,
    softwareId: request.softwareId,
  };
}

export function saveInputFrom(values: RequestIntakeValues, updatedAt?: string): SaveRequestInput {
  return {
    softwareName: values.softwareName.trim(),
    vendor: values.vendor.trim(),
    department: values.department.trim(),
    businessNeed: values.businessNeed.trim(),
    fundingSourceId: values.fundingSourceId ? Number(values.fundingSourceId) : null,
    url: values.url.trim() || null,
    vpatSubmitted: values.vpatSubmitted,
    softwareId: values.softwareId,
    updatedAt,
  };
}
