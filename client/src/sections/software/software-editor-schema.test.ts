import { it, expect, describe } from 'vitest';

import { softwareEditorInput, softwareEditorSchema } from './software-editor-schema';

const VALUES = {
  softwareName: 'Fable Planner',
  vendorName: 'Fable Works',
  version: '2.1',
  publisherWebsite: '',
  softwareCategoryId: '',
  businessOwnerId: '',
  technicalOwnerId: '',
  currentApprovalStatusId: '5',
  accessibilityRiskId: '',
  approvalDate: '',
  approvalExpirationDate: '',
  notes: '',
};

describe('software edit validation', () => {
  it.each(['javascript:alert(1)', 'ftp://example.invalid', 'not a website'])(
    'rejects unsupported website %s',
    (publisherWebsite) => {
      expect(softwareEditorSchema.safeParse({ ...VALUES, publisherWebsite }).success).toBe(false);
    }
  );

  it('rejects impossible dates and expiration before approval', () => {
    expect(softwareEditorSchema.safeParse({ ...VALUES, approvalDate: '2026-02-30' }).success).toBe(
      false
    );
    const result = softwareEditorSchema.safeParse({
      ...VALUES,
      approvalDate: '2026-10-01',
      approvalExpirationDate: '2026-09-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toEqual(['approvalExpirationDate']);
  });

  it('retains date-only values and nullable fields in the update payload', () => {
    const parsed = softwareEditorSchema.parse({
      ...VALUES,
      approvalDate: '2026-10-01',
      notes: '  Keep this note  ',
    });
    expect(softwareEditorInput(parsed, '2026-10-01T00:00:00Z')).toMatchObject({
      approvalDate: '2026-10-01',
      approvalExpirationDate: null,
      softwareCategoryId: null,
      currentApprovalStatusId: 5,
      notes: 'Keep this note',
      updatedAt: '2026-10-01T00:00:00Z',
    });
  });
});
