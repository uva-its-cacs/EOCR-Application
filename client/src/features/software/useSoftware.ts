import { useQuery } from '@tanstack/react-query'
import { fetchSoftware } from './api'

export const SOFTWARE_QUERY_KEY = ['software', 'admin'] as const

export function useSoftware(enabled: boolean) {
  return useQuery({
    queryKey: SOFTWARE_QUERY_KEY,
    queryFn: fetchSoftware,
    enabled,
    retry: false,
  })
}
