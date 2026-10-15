import type {
  RequestDetail,
  RequestSummary,
  SaveRequestInput,
  SaveExceptionInput,
  FundingSourceOption,
} from './types';

import { apiFetch } from 'src/lib/api';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function fetchMyRequests(): Promise<RequestSummary[]> {
  return apiFetch<RequestSummary[]>('/api/requests/mine');
}

export function fetchRequest(requestId: number): Promise<RequestDetail> {
  return apiFetch<RequestDetail>(`/api/requests/${requestId}`);
}

export function fetchFundingSources(): Promise<FundingSourceOption[]> {
  return apiFetch<FundingSourceOption[]>('/api/codes/FundingSource');
}

export function createRequest(input: SaveRequestInput): Promise<RequestDetail> {
  return apiFetch<RequestDetail>('/api/requests', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function updateRequest(requestId: number, input: SaveRequestInput): Promise<RequestDetail> {
  return apiFetch<RequestDetail>(`/api/requests/${requestId}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function submitRequest(requestId: number, updatedAt: string): Promise<RequestDetail> {
  return apiFetch<RequestDetail>(`/api/requests/${requestId}/submit`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ updatedAt }),
  });
}

export function saveException(
  requestId: number,
  input: SaveExceptionInput
): Promise<RequestDetail> {
  return apiFetch<RequestDetail>(`/api/requests/${requestId}/exception`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(input),
  });
}

export function submitException(requestId: number, updatedAt: string): Promise<RequestDetail> {
  return apiFetch<RequestDetail>(`/api/requests/${requestId}/exception/submit`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ updatedAt }),
  });
}
