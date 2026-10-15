import type { ReviewMoveAction } from './review-workflow';
import type {
  DecideInput,
  ReviewOptions,
  ReviewerOption,
  ReviewQueueItem,
  SaveReviewInput,
  ReviewCodeOption,
  ReviewRequestDetail,
} from './types';

import { apiFetch } from 'src/lib/api';

import { DECISION_OUTCOMES } from './review-workflow';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const post = <T>(path: string, body: unknown, method = 'POST') =>
  apiFetch<T>(path, { method, headers: JSON_HEADERS, body: JSON.stringify(body) });

export function fetchReviewQueue(): Promise<ReviewQueueItem[]> {
  return apiFetch<ReviewQueueItem[]>('/api/admin/requests');
}

export function fetchReviewRequest(requestId: number): Promise<ReviewRequestDetail> {
  return apiFetch<ReviewRequestDetail>(`/api/admin/requests/${requestId}`);
}

export async function fetchReviewOptions(): Promise<ReviewOptions> {
  const [risks, recommendations, statuses, reviewers] = await Promise.all([
    apiFetch<ReviewCodeOption[]>('/api/codes/AccessibilityRisk'),
    apiFetch<ReviewCodeOption[]>('/api/codes/Recommendation'),
    apiFetch<ReviewCodeOption[]>('/api/codes/RequestStatus'),
    apiFetch<ReviewerOption[]>('/api/admin/reviewers'),
  ]);
  const outcomes = statuses.filter((status) => DECISION_OUTCOMES.includes(status.value));
  return { risks, recommendations, outcomes, reviewers };
}

// `reviewerId` null assigns the request to the caller.
export function assignRequest(
  requestId: number,
  reviewerId: number | null,
  updatedAt: string
): Promise<ReviewRequestDetail> {
  return post(`/api/admin/requests/${requestId}/assign`, { reviewerId, updatedAt });
}

export function saveReview(
  requestId: number,
  input: SaveReviewInput
): Promise<ReviewRequestDetail> {
  return post(`/api/admin/requests/${requestId}/review`, input, 'PUT');
}

export function moveRequest(
  requestId: number,
  action: ReviewMoveAction,
  comments: string | null,
  updatedAt: string
): Promise<ReviewRequestDetail> {
  return post(`/api/admin/requests/${requestId}/${action}`, { comments, updatedAt });
}

export function decideRequest(requestId: number, input: DecideInput): Promise<ReviewRequestDetail> {
  return post(`/api/admin/requests/${requestId}/decide`, input);
}
