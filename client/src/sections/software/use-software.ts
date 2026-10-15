import { useQuery } from '@tanstack/react-query';

import { fetchSoftware, fetchSoftwareCatalog } from './api';

export const SOFTWARE_QUERY_KEY = ['software', 'admin'] as const;
export const SOFTWARE_CATALOG_QUERY_KEY = ['software', 'catalog'] as const;

export function useSoftware(enabled: boolean) {
  return useQuery({
    queryKey: SOFTWARE_QUERY_KEY,
    queryFn: fetchSoftware,
    enabled,
    retry: false,
  });
}

export function useSoftwareCatalog(enabled: boolean) {
  return useQuery({
    queryKey: SOFTWARE_CATALOG_QUERY_KEY,
    queryFn: fetchSoftwareCatalog,
    enabled,
    retry: false,
  });
}
