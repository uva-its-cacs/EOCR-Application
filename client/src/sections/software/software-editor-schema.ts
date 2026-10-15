import type { Software, UpdateSoftwareInput } from './types';

import { z } from 'zod';

const optionalId = z
  .string()
  .refine((value) => value === '' || /^[1-9]\d*$/.test(value), 'Select an option.');
const optionalDate = z
  .string()
  .refine((value) => value === '' || z.iso.date().safeParse(value).success, 'Enter a valid date.');

export const softwareEditorSchema = z
  .object({
    softwareName: z
      .string()
      .trim()
      .min(1, 'Enter a software name.')
      .max(200, 'Use 200 characters or fewer.'),
    version: z.string().trim().min(1, 'Enter the version.').max(50, 'Use 50 characters or fewer.'),
    vendorName: z
      .string()
      .trim()
      .min(1, 'Enter a vendor name.')
      .max(200, 'Use 200 characters or fewer.'),
    publisherWebsite: z
      .string()
      .trim()
      .max(2000, 'Use 2000 characters or fewer.')
      .refine((value) => {
        if (!value) return true;
        try {
          return ['http:', 'https:'].includes(new URL(value).protocol);
        } catch {
          return false;
        }
      }, 'Enter a valid HTTP or HTTPS website.'),
    softwareCategoryId: optionalId,
    businessOwnerId: optionalId,
    technicalOwnerId: optionalId,
    currentApprovalStatusId: z.string().regex(/^[1-9]\d*$/, 'Select an approval status.'),
    accessibilityRiskId: optionalId,
    approvalDate: optionalDate,
    approvalExpirationDate: optionalDate,
    notes: z.string().trim().max(4000, 'Use 4000 characters or fewer.'),
  })
  .refine(
    (value) =>
      !value.approvalDate ||
      !value.approvalExpirationDate ||
      value.approvalExpirationDate >= value.approvalDate,
    {
      path: ['approvalExpirationDate'],
      message: 'Expiration cannot be before the approval date.',
    }
  );

export type SoftwareEditorValues = z.infer<typeof softwareEditorSchema>;

export function softwareEditorDefaults(software: Software): SoftwareEditorValues {
  return {
    softwareName: software.softwareName,
    vendorName: software.vendorName,
    version: software.version,
    publisherWebsite: software.publisherWebsite ?? '',
    softwareCategoryId: software.softwareCategoryId?.toString() ?? '',
    businessOwnerId: software.businessOwnerId?.toString() ?? '',
    technicalOwnerId: software.technicalOwnerId?.toString() ?? '',
    currentApprovalStatusId: software.currentApprovalStatusId.toString(),
    accessibilityRiskId: software.accessibilityRiskId?.toString() ?? '',
    approvalDate: software.approvalDate ?? '',
    approvalExpirationDate: software.approvalExpirationDate ?? '',
    notes: software.notes ?? '',
  };
}

export function softwareEditorInput(
  values: SoftwareEditorValues,
  updatedAt: string
): UpdateSoftwareInput {
  const id = (value: string) => (value ? Number(value) : null);
  return {
    ...values,
    publisherWebsite: values.publisherWebsite || null,
    notes: values.notes || null,
    softwareCategoryId: id(values.softwareCategoryId),
    businessOwnerId: id(values.businessOwnerId),
    technicalOwnerId: id(values.technicalOwnerId),
    currentApprovalStatusId: Number(values.currentApprovalStatusId),
    accessibilityRiskId: id(values.accessibilityRiskId),
    approvalDate: values.approvalDate || null,
    approvalExpirationDate: values.approvalExpirationDate || null,
    updatedAt,
  };
}
