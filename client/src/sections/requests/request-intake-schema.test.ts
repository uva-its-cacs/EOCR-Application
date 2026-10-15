import { it, expect, describe } from 'vitest';

import {
  saveInputFrom,
  emptyIntakeValues,
  requestDraftSchema,
  requestSubmitSchema,
} from './request-intake-schema';

// ----------------------------------------------------------------------

const complete = {
  ...emptyIntakeValues,
  softwareName: 'Quill Notes',
  vendor: 'Quill Labs',
  version: '2.0',
  department: 'Library',
  businessNeed: 'Note taking for staff.',
  fundingSourceId: '1201',
};

describe('request intake schema', () => {
  it('saves a draft with only a software name', () => {
    expect(
      requestDraftSchema.safeParse({ ...emptyIntakeValues, softwareName: 'Quill' }).success
    ).toBe(true);
    expect(requestDraftSchema.safeParse(emptyIntakeValues).success).toBe(false);
  });

  it('requires vendor, version, department, business need and funding source to submit', () => {
    const result = requestSubmitSchema.safeParse({ ...emptyIntakeValues, softwareName: 'Quill' });
    expect(result.success).toBe(false);
    const fields = result.success ? [] : result.error.issues.map((issue) => issue.path[0]);
    expect(fields).toEqual(['vendor', 'version', 'department', 'businessNeed', 'fundingSourceId']);
    expect(requestSubmitSchema.safeParse(complete).success).toBe(true);
  });

  it('accepts only HTTP or HTTPS websites', () => {
    expect(requestDraftSchema.safeParse({ ...complete, url: 'ftp://x.example.com' }).success).toBe(
      false
    );
    expect(
      requestDraftSchema.safeParse({ ...complete, url: 'https://x.example.com' }).success
    ).toBe(true);
  });

  it('maps form values to the server input', () => {
    expect(saveInputFrom({ ...complete, url: '  ' }, '2026-10-15T00:00:00Z')).toEqual({
      softwareName: 'Quill Notes',
      vendor: 'Quill Labs',
      version: '2.0',
      department: 'Library',
      businessNeed: 'Note taking for staff.',
      fundingSourceId: 1201,
      url: null,
      vpatSubmitted: false,
      softwareId: null,
      updatedAt: '2026-10-15T00:00:00Z',
    });
  });
});
