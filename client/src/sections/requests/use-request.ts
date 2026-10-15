import { useQuery } from '@tanstack/react-query';

import { fetchRequest, fetchFundingSources } from './api';

// ----------------------------------------------------------------------

export const requestQueryKey = (requestId: number) => ['requests', 'detail', requestId] as const;

// One of the current user's requests (the server answers 404 for anyone else's).
export function useRequest(requestId: number | null) {
  return useQuery({
    queryKey: requestQueryKey(requestId ?? 0),
    queryFn: () => fetchRequest(requestId as number),
    enabled: requestId !== null,
    retry: false,
  });
}

export function useFundingSources() {
  return useQuery({
    queryKey: ['codes', 'FundingSource'],
    queryFn: fetchFundingSources,
    retry: false,
  });
}
