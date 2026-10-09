import { useQuery } from '@tanstack/react-query';

import { fetchMyRequests } from './api';

// ----------------------------------------------------------------------

export const MY_REQUESTS_QUERY_KEY = ['requests', 'mine'] as const;

// The current user's requests (the server filters by the signed-in user).
export function useMyRequests() {
  return useQuery({
    queryKey: MY_REQUESTS_QUERY_KEY,
    queryFn: fetchMyRequests,
  });
}
