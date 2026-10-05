import { apiFetch } from '../../lib/api'
import type { RequestSummary } from './types'

export function fetchMyRequests(): Promise<RequestSummary[]> {
  return apiFetch<RequestSummary[]>('/api/requests/mine')
}
