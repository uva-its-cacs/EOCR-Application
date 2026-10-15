// @vitest-environment jsdom
import type { RequestDetail } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { jsonResponse } from 'src/test/render-view';
import { renderRoutes } from 'src/test/render-with-theme';

import { RequestEeaapPageView } from './request-eeaap-page-view';

// ----------------------------------------------------------------------

const REQUEST: RequestDetail = {
  requestId: 7,
  title: 'Kestrel Chat 2.0 (Kestrel Labs)',
  softwareName: 'Kestrel Chat',
  vendor: 'Kestrel Labs',
  version: '2.0',
  department: 'Library',
  businessNeed: 'Chat with patrons.',
  fundingSourceId: 1201,
  fundingSourceCode: 'DepartmentBudget',
  fundingSourceLabel: 'Department budget',
  url: null,
  vpatSubmitted: true,
  softwareId: null,
  statusCode: 'AwaitingEeaap',
  statusLabel: 'Awaiting EEAAP',
  submittedAt: '2026-10-09T12:00:00Z',
  createdAt: '2026-10-08T12:00:00Z',
  updatedAt: '2026-10-13T12:00:00Z',
  history: [
    {
      workflowHistoryId: 4,
      previousStatusCode: 'HumanReview',
      previousStatusLabel: 'Human Review',
      newStatusCode: 'AwaitingEeaap',
      newStatusLabel: 'Awaiting EEAAP',
      changedByName: 'Admin Example',
      changedAt: '2026-10-13T12:00:00Z',
      comments: 'The chat window does not announce new messages.',
    },
  ],
  exception: {
    exceptionId: 3,
    statusCode: 'Requested',
    statusLabel: 'Requested',
    businessJustification: null,
    accessibilityImpact: null,
    mitigationPlan: null,
    submittedAt: null,
    approvalDate: null,
    expirationDate: null,
    updatedAt: '2026-10-13T12:00:00Z',
    isExpired: false,
  },
};

type Call = { url: string; method: string; body: Record<string, unknown> | null };

function renderEeaap(request: RequestDetail = REQUEST) {
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ url, method, body });
      if (url === '/api/requests/7' && method === 'GET') return jsonResponse(request);
      if (url === '/api/requests/7/exception') {
        return jsonResponse({
          ...request,
          exception: { ...request.exception, ...body, updatedAt: '2026-10-14T12:00:00Z' },
        });
      }
      if (url === '/api/requests/7/exception/submit') {
        return jsonResponse({ ...request, statusCode: 'HumanReview' });
      }
      return jsonResponse({}, 404);
    })
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  renderRoutes(
    [
      {
        path: '/requests/:requestId/eeaap',
        element: (
          <QueryClientProvider client={client}>
            <RequestEeaapPageView />
          </QueryClientProvider>
        ),
      },
      { path: '/requests/:requestId', element: <p>Status page</p> },
    ],
    '/requests/7/eeaap'
  );
  return calls;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('RequestEeaapPageView', () => {
  it('shows the reviewer’s request and three labelled, required questions', async () => {
    renderEeaap();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Exception plan (EEAAP)' })
    ).toBeTruthy();
    await waitFor(() =>
      expect(document.title).toBe('EEAAP: Kestrel Chat 2.0 (Kestrel Labs) - EOCR')
    );
    expect(screen.getByRole('note').textContent).toContain(
      'The chat window does not announce new messages.'
    );
    for (const name of [/Business justification/, /Accessibility impact/, /Mitigation plan/]) {
      expect(screen.getByRole('textbox', { name }).hasAttribute('required')).toBe(true);
    }
  });

  it('on submit with answers missing, shows the errors and focuses the first missing field', async () => {
    const calls = renderEeaap();

    fireEvent.click(await screen.findByRole('button', { name: 'Submit EEAAP' }));

    const first = screen.getByRole('textbox', { name: /Business justification/ });
    await waitFor(() => expect(document.activeElement).toBe(first));
    expect(first.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Answer the highlighted questions before submitting.')).toBeTruthy();
    expect(screen.getByText('Describe how people will get equally effective access.')).toBeTruthy();
    expect(calls.some((call) => call.method !== 'GET')).toBe(false);
  });

  it('saves, then submits the plan and opens the request', async () => {
    const calls = renderEeaap();

    fireEvent.change(await screen.findByRole('textbox', { name: /Business justification/ }), {
      target: { value: 'Patrons chat with staff.' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Accessibility impact/ }), {
      target: { value: 'Screen reader users miss new messages.' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Mitigation plan/ }), {
      target: { value: 'Phone and email support at the same hours.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Submit EEAAP' }));

    expect(await screen.findByText('Status page')).toBeTruthy();
    const save = calls.find((call) => call.method === 'PUT');
    expect(save?.body).toEqual({
      businessJustification: 'Patrons chat with staff.',
      accessibilityImpact: 'Screen reader users miss new messages.',
      mitigationPlan: 'Phone and email support at the same hours.',
      updatedAt: '2026-10-13T12:00:00Z',
    });
    const submit = calls.find((call) => call.url === '/api/requests/7/exception/submit');
    expect(submit?.body).toEqual({ updatedAt: '2026-10-14T12:00:00Z' });
  });

  it('links to the request when no plan is waiting on the requester', async () => {
    renderEeaap({
      ...REQUEST,
      statusCode: 'HumanReview',
      statusLabel: 'Human Review',
      exception: { ...REQUEST.exception!, statusCode: 'Submitted', statusLabel: 'Submitted' },
    });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'No exception plan is needed now' })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'View the request' }).getAttribute('href')).toBe(
      '/requests/7'
    );
  });
});
