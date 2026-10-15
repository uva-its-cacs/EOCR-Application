// @vitest-environment jsdom
import type { ReviewQueueItem, ReviewRequestDetail } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { renderRoutes } from 'src/test/render-with-theme';
import { renderView, jsonResponse } from 'src/test/render-view';

import { ReviewQueueView } from './review-queue-view';
import { ReviewRequestPageView } from './review-request-page-view';

// ----------------------------------------------------------------------

const ME = {
  userId: 3,
  name: 'Admin Example',
  email: 'admin@example.com',
  roleCode: 'Admin',
  roleLabel: 'Admin',
};

const QUEUE: ReviewQueueItem[] = [
  {
    requestId: 1,
    softwareName: 'Clover Analytics',
    vendor: 'Clover Tech',
    version: '2.1',
    requestorName: 'Dana Example',
    statusCode: 'Submitted',
    statusLabel: 'Submitted',
    assignedReviewerId: null,
    assignedReviewerName: null,
    submittedAt: '2026-10-01T12:00:00Z',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    requestId: 2,
    softwareName: 'Buildout Pro',
    vendor: 'Buildout Inc',
    version: '3.1',
    requestorName: 'Dana Example',
    statusCode: 'HumanReview',
    statusLabel: 'Human Review',
    assignedReviewerId: 3,
    assignedReviewerName: 'Admin Example',
    submittedAt: '2026-09-25T13:00:00Z',
    updatedAt: '2026-10-13T12:00:00Z',
  },
];

const DETAIL: ReviewRequestDetail = {
  request: {
    requestId: 2,
    title: 'Buildout Pro 3.1 (Buildout Inc)',
    softwareName: 'Buildout Pro',
    vendor: 'Buildout Inc',
    version: '3.1',
    department: 'Library',
    businessNeed: 'Floor plans for building projects.',
    fundingSourceId: 1201,
    fundingSourceCode: 'DepartmentBudget',
    fundingSourceLabel: 'Department budget',
    url: null,
    vpatSubmitted: true,
    softwareId: null,
    statusCode: 'HumanReview',
    statusLabel: 'Human Review',
    submittedAt: '2026-09-25T13:00:00Z',
    createdAt: '2026-09-25T12:00:00Z',
    updatedAt: '2026-10-13T12:00:00Z',
    history: [],
  },
  requestorName: 'Dana Example',
  requestorEmail: 'dana@example.com',
  assignedReviewerId: 3,
  assignedReviewerName: 'Admin Example',
  review: null,
  catalogVersions: [
    {
      softwareId: 9,
      softwareName: 'Buildout Pro',
      vendorName: 'Buildout Inc',
      version: '2.0',
      softwareCategoryLabel: null,
      currentApprovalStatusCode: 'Approved',
      currentApprovalStatusLabel: 'Approved',
      accessibilityRiskLabel: 'Low',
      approvalExpirationDate: '2027-01-31',
      conditions: null,
      createdAt: '2025-01-01T00:00:00Z',
    },
  ],
  allowedActions: ['assign', 'save-review', 'request-info', 'send-for-eeaap', 'decide'],
};

const CODES: Record<string, unknown> = {
  '/api/codes/AccessibilityRisk': [
    { codeId: 301, value: 'Low', label: 'Low' },
    { codeId: 302, value: 'Medium', label: 'Medium' },
  ],
  '/api/codes/Recommendation': [{ codeId: 501, value: 'Approve', label: 'Approve' }],
  '/api/codes/RequestStatus': [
    { codeId: 1, value: 'Submitted', label: 'Submitted' },
    { codeId: 7, value: 'Approved', label: 'Approved' },
    { codeId: 8, value: 'ApprovedWithConditions', label: 'Approved with Conditions' },
    { codeId: 9, value: 'Denied', label: 'Denied' },
  ],
  '/api/admin/reviewers': [
    { userId: 3, name: 'Admin Example' },
    { userId: 4, name: 'Riley Example' },
  ],
};

type Call = { url: string; method: string; body: unknown };

// Answers by URL; `writes` handles POST and PUT calls.
function mockApi(
  get: Record<string, unknown>,
  writes: (call: Call) => Response = () => jsonResponse(DETAIL),
  fail: string[] = []
) {
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const call = { url, method, body: init?.body ? JSON.parse(init.body as string) : null };
      calls.push(call);
      if (method !== 'GET') return writes(call);
      if (url === '/api/me') return jsonResponse(ME);
      if (fail.includes(url)) return jsonResponse({}, 404);
      if (url in get) return jsonResponse(get[url]);
      if (url in CODES) return jsonResponse(CODES[url]);
      return jsonResponse({}, 404);
    })
  );
  return calls;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// The review page reads its id from the route.
function renderReviewPage(path = '/admin/requests/2') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderRoutes(
    [
      {
        path: '/admin/requests/:requestId',
        element: (
          <QueryClientProvider client={client}>
            <ReviewRequestPageView />
          </QueryClientProvider>
        ),
      },
    ],
    path
  );
}

describe('ReviewQueueView', () => {
  it('lists submitted requests with text status, assignee and named row actions', async () => {
    mockApi({ '/api/admin/requests': QUEUE });
    renderView(<ReviewQueueView />);

    const table = await screen.findByRole('table', { name: 'Requests to review' });
    await within(table).findByRole('link', { name: 'Clover Analytics' });
    expect(within(table).getByRole('link', { name: 'Buildout Pro' }).getAttribute('href')).toBe(
      '/admin/requests/2'
    );
    expect(within(table).getByText('Unassigned')).toBeTruthy();
    // The viewer's own request shows "You" and no "Assign to me".
    await within(table).findByText('You');
    expect(within(table).getAllByRole('button', { name: /^Assign to me/ })).toHaveLength(1);
    expect(
      within(table).getByRole('button', { name: 'Assign to me: Clover Analytics 2.1' })
    ).toBeTruthy();
  });

  it('filters to unassigned requests', async () => {
    mockApi({ '/api/admin/requests': QUEUE });
    renderView(<ReviewQueueView />);

    await screen.findByRole('link', { name: 'Buildout Pro' });
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Assigned' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Unassigned' }));

    await waitFor(() => expect(screen.queryByRole('link', { name: 'Buildout Pro' })).toBeNull());
    expect(screen.getByRole('link', { name: 'Clover Analytics' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove assigned filter: Unassigned' })).toBeTruthy();
  });

  it('assigns a request to the viewer', async () => {
    const calls = mockApi({ '/api/admin/requests': QUEUE }, () =>
      jsonResponse({ ...DETAIL, request: { ...DETAIL.request, requestId: 1 } })
    );
    renderView(<ReviewQueueView />);

    fireEvent.click(
      await screen.findByRole('button', { name: 'Assign to me: Clover Analytics 2.1' })
    );

    await waitFor(() => expect(calls.some((call) => call.method === 'POST')).toBe(true));
    const post = calls.find((call) => call.method === 'POST');
    expect(post?.url).toBe('/api/admin/requests/1/assign');
    expect(post?.body).toEqual({ reviewerId: null, updatedAt: '2026-10-01T12:00:00Z' });
  });
});

describe('ReviewRequestPageView', () => {
  const renderPage = (detail = DETAIL, writes?: (call: Call) => Response) => {
    const calls = mockApi({ [`/api/admin/requests/${detail.request.requestId}`]: detail }, writes);
    renderReviewPage();
    return calls;
  };

  it('shows the steps the server allows, the review form and the catalog versions', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Request: Buildout Pro 3.1 (Buildout Inc)',
      })
    ).toBeTruthy();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    // The viewer is known once /api/me answers.
    await screen.findByText('Admin Example (you)');
    expect(screen.getByRole('link', { name: 'Back to the review queue' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Request more info' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Send for EEAAP' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Decide' })).toBeTruthy();
    // Already assigned to the viewer, and not startable from human review.
    expect(screen.queryByRole('button', { name: 'Assign to me' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Start human review' })).toBeNull();

    expect(screen.getByRole('form', { name: 'Review' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save review' })).toBeTruthy();
    expect(screen.getByText('Version 2.0')).toBeTruthy();
    expect(screen.getByText('Admin Example (you)')).toBeTruthy();
  });

  it('shows the review read-only and no steps once decided', async () => {
    renderPage({
      ...DETAIL,
      request: { ...DETAIL.request, statusCode: 'Approved', statusLabel: 'Approved' },
      allowedActions: [],
    });

    await screen.findByText('The review can be edited while the request is in review.');
    expect(screen.queryByRole('button', { name: 'Save review' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Decide' })).toBeNull();
    expect(
      (screen.getByRole('textbox', { name: 'Findings' }) as HTMLTextAreaElement).disabled
    ).toBe(true);
  });

  it('requires a message to request more information, then posts it', async () => {
    const calls = renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Request more info' }));
    const dialog = await screen.findByRole('dialog', { name: 'Request more information' });
    expect(dialog.getAttribute('aria-describedby')).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Send to the requester' }));
    const field = await within(dialog).findByRole('textbox', { name: /Message to the requester/ });
    await waitFor(() => expect(field.getAttribute('aria-invalid')).toBe('true'));
    expect(within(dialog).getByText('Enter the message to the requester.')).toBeTruthy();
    expect(calls.some((call) => call.method === 'POST')).toBe(false);

    fireEvent.change(field, { target: { value: 'Please attach the VPAT.' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Send to the requester' }));

    await waitFor(() => expect(calls.some((call) => call.method === 'POST')).toBe(true));
    const post = calls.find((call) => call.method === 'POST');
    expect(post?.url).toBe('/api/admin/requests/2/request-info');
    expect(post?.body).toEqual({
      comments: 'Please attach the VPAT.',
      updatedAt: '2026-10-13T12:00:00Z',
    });
  });

  it('previews the catalog change and records the decision', async () => {
    const calls = renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Decide' }));
    const dialog = await screen.findByRole('dialog', { name: 'Record the decision' });
    expect(within(dialog).getByRole('status').textContent).toContain('Select a decision');

    fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: /Decision/ }));
    fireEvent.click(await screen.findByRole('option', { name: 'Approved with Conditions' }));

    const preview = within(dialog).getByRole('status');
    await waitFor(() =>
      expect(preview.textContent).toContain(
        'A new catalog entry will be added for Buildout Pro 3.1 (Buildout Inc): status Approved with Conditions'
      )
    );

    // Conditions are required for this outcome.
    fireEvent.click(within(dialog).getByRole('button', { name: 'Record decision' }));
    await within(dialog).findByText('Enter the conditions of this approval.');
    expect(calls.some((call) => call.method === 'POST')).toBe(false);

    fireEvent.change(within(dialog).getByRole('textbox', { name: /^Conditions/ }), {
      target: { value: 'Use with captions on.' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Record decision' }));

    await waitFor(() => expect(calls.some((call) => call.method === 'POST')).toBe(true));
    const post = calls.find((call) => call.method === 'POST');
    expect(post?.url).toBe('/api/admin/requests/2/decide');
    expect(post?.body).toMatchObject({
      outcome: 'ApprovedWithConditions',
      conditions: 'Use with captions on.',
      updatedAt: '2026-10-13T12:00:00Z',
    });
    expect((post?.body as { approvalExpirationDate: string }).approvalExpirationDate).toMatch(
      /^\d{4}-\d{2}-\d{2}$/
    );
  });

  it('says when the review options cannot be loaded, with Retry', async () => {
    mockApi({ '/api/admin/requests/2': DETAIL }, undefined, ['/api/codes/Recommendation']);
    renderReviewPage();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('The review options');
    expect(within(alert).getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('shows "Request not found" for a draft or missing request', async () => {
    mockApi({});
    renderReviewPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Request not found' })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to the review queue' }).getAttribute('href')).toBe(
      '/admin/requests'
    );
  });
});
