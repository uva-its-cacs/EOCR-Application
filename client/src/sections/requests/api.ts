import type { RequestSummary } from './types';

import { apiFetch } from 'src/lib/api';

export function fetchMyRequests(): Promise<RequestSummary[]> {
  return apiFetch<RequestSummary[]>('/api/requests/mine');
}
