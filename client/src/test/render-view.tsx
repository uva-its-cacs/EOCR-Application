import type { RenderResult } from '@testing-library/react';

import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { renderRoutes } from './render-with-theme';

// ----------------------------------------------------------------------

/**
 * Renders a view the way the app does (theme, data router, TanStack Query) with a fresh QueryClient
 * that does not retry, so error states show at once.
 */
export function renderView(ui: React.ReactElement, path = '/'): RenderResult {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  return renderRoutes(
    [{ path: '*', element: <QueryClientProvider client={client}>{ui}</QueryClientProvider> }],
    path
  );
}

// A JSON response as the API sends it.
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Replaces global fetch with a mock that answers each call with the next handler's result (the last
 * handler repeats). A handler that returns a never-settling promise keeps the request pending.
 */
export function mockFetch(...handlers: (() => Promise<Response>)[]) {
  let call = 0;
  const fetchMock = vi.fn(() => {
    const handler = handlers[Math.min(call, handlers.length - 1)];
    call += 1;
    return handler();
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

export const pending = () => new Promise<Response>(() => {});
export const ok = (body: unknown) => () => Promise.resolve(jsonResponse(body));
export const serverError = () =>
  Promise.resolve(new Response('', { status: 500, statusText: 'Internal Server Error' }));
