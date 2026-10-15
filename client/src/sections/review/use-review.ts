import { useQuery } from '@tanstack/react-query';

import { fetchReviewQueue, fetchReviewOptions, fetchReviewRequest } from './api';

// ----------------------------------------------------------------------

export const REVIEW_QUEUE_QUERY_KEY = ['admin', 'requests'] as const;

export const reviewRequestQueryKey = (requestId: number) =>
  ['admin', 'requests', 'detail', requestId] as const;

export function useReviewQueue() {
  return useQuery({
    queryKey: REVIEW_QUEUE_QUERY_KEY,
    queryFn: fetchReviewQueue,
    retry: false,
  });
}

export function useReviewRequest(requestId: number | null) {
  return useQuery({
    queryKey: reviewRequestQueryKey(requestId ?? 0),
    queryFn: () => fetchReviewRequest(requestId as number),
    enabled: requestId !== null,
    retry: false,
  });
}

// Code lists and reviewers for the review form and dialogs.
export function useReviewOptions() {
  return useQuery({
    queryKey: ['admin', 'review-options'],
    queryFn: fetchReviewOptions,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
