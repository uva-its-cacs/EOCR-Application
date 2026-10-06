import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../../lib/api'
import type { MeDto } from './types'

export function useCurrentUser() {
  const { data, isLoading, isError } = useQuery<MeDto>({
    queryKey: ['me'],
    queryFn: () => apiFetch<MeDto>('/api/me'),
    retry: 1,
  })

  return { user: data, isLoading, isError }
}
