import type { MeDto } from './types';

import { useQuery } from '@tanstack/react-query';

import { ApiError, apiFetch } from 'src/lib/api';

// ----------------------------------------------------------------------

export const CURRENT_USER_QUERY_KEY = ['me'] as const;

// Ten minutes: the signed-in user rarely changes during a session.
const STALE_TIME = 10 * 60 * 1000;

type Refetch = { refetch: () => void };

export type CurrentUserResult = Refetch &
  (
    | { status: 'loading' }
    | { status: 'authenticated'; user: MeDto }
    // The server answered 401: nobody is signed in.
    | { status: 'unauthenticated' }
    // Network failure or a server error (anything but 401).
    | { status: 'error'; error: Error }
  );

export function useCurrentUser(): CurrentUserResult {
  const { data, error, isError, isFetching, refetch } = useQuery<MeDto>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => apiFetch<MeDto>('/api/me'),
    retry: false,
    staleTime: STALE_TIME,
  });

  const retry = () => {
    refetch();
  };

  if (data) return { status: 'authenticated', user: data, refetch: retry };

  // While a retry is running after an error, show loading again.
  if (isError && !isFetching) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: 'unauthenticated', refetch: retry };
    }
    return { status: 'error', error, refetch: retry };
  }

  return { status: 'loading', refetch: retry };
}
