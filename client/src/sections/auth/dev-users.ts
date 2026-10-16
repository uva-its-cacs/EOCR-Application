import { useQuery } from '@tanstack/react-query';

import { apiFetch } from 'src/lib/api';

// ----------------------------------------------------------------------

// The development user switcher (server: DevUsersController, Development only). The client only uses it
// in development builds (import.meta.env.DEV); the server ignores the switch outside Development.

// Matches server/DTOs/DevUserDto.cs.
export interface DevUser {
  userId: number;
  name: string;
  email: string;
  roleCode: string;
  roleLabel: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' };

export function fetchDevUsers(): Promise<DevUser[]> {
  return apiFetch<DevUser[]>('/api/dev/users');
}

export function switchDevUser(email: string): Promise<void> {
  return apiFetch<void>('/api/dev/users/switch', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });
}

// Back to the server's DevAuth:Email.
export function resetDevUser(): Promise<void> {
  return apiFetch<void>('/api/dev/users/switch', { method: 'DELETE' });
}

export function useDevUsers(enabled: boolean) {
  return useQuery({
    queryKey: ['dev', 'users'],
    queryFn: fetchDevUsers,
    enabled,
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
}
