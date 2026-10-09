import type {
  Software,
  CodeOption,
  OwnerOption,
  SoftwareOptions,
  UpdateSoftwareInput,
} from './types';

import { apiFetch } from 'src/lib/api';

export function fetchSoftware(): Promise<Software[]> {
  return apiFetch<Software[]>('/api/software');
}

export async function fetchSoftwareOptions(): Promise<SoftwareOptions> {
  const [categories, approvalStatuses, risks, owners] = await Promise.all([
    apiFetch<CodeOption[]>('/api/codes/SoftwareCategory'),
    apiFetch<CodeOption[]>('/api/codes/ApprovalStatus'),
    apiFetch<CodeOption[]>('/api/codes/AccessibilityRisk'),
    apiFetch<OwnerOption[]>('/api/software/owners'),
  ]);

  return { categories, approvalStatuses, risks, owners };
}

export function updateSoftware(softwareId: number, input: UpdateSoftwareInput): Promise<Software> {
  return apiFetch<Software>(`/api/software/${softwareId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
