// @vitest-environment jsdom
import type { RequestDetail } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { jsonResponse } from 'src/test/render-view';
import { renderRoutes } from 'src/test/render-with-theme';

import { RequestDetailsPageView } from './request-details-page-view';

// ----------------------------------------------------------------------

const REQUEST: RequestDetail = {
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
  url: 'https://buildout.example.com',
  vpatSubmitted: true,
  softwareId: null,
  statusCode: 'HumanReview',
  statusLabel: 'Human Review',
  submittedAt: '2026-09-25T13:00:00Z',
  createdAt: '2026-09-25T12:00:00Z',
  updatedAt: '2026-10-13T12:00:00Z',
  history: [
    {
      workflowHistoryId: 1,
      previousStatusCode: null,
      previousStatusLabel: null,
      newStatusCode: 'Draft',
      newStatusLabel: 'Draft',
      changedByName: 'Dana Example',
      changedAt: '2026-09-25T12:00:00Z',
      comments: 'Request started.',
    },
    {
      workflowHistoryId: 2,
      previousStatusCode: 'Draft',
      previousStatusLabel: 'Draft',
      newStatusCode: 'Submitted',
      newStatusLabel: 'Submitted',
      changedByName: 'Dana Example',
      changedAt: '2026-09-25T13:00:00Z',
      comments: 'Request submitted for review.',
    },
    {
      workflowHistoryId: 3,
      previousStatusCode: 'Submitted',
      previousStatusLabel: 'Submitted',
      newStatusCode: 'HumanReview',
      newStatusLabel: 'Human Review',
      changedByName: 'Admin Example',
      changedAt: '2026-10-13T12:00:00Z',
      comments: null,
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderDetails(response: () => Response, path = '/requests/2') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response())
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderRoutes(
    [
      {
        path: '/requests/:requestId',
        element: (
          <QueryClientProvider client={client}>
            <RequestDetailsPageView />
          </QueryClientProvider>
        ),
      },
    ],
    path
  );
}

describe('RequestDetailsPageView', () => {
  it('shows the request with one h1, its status as text and the document title', async () => {
    renderDetails(() => jsonResponse(REQUEST));

    // The loading state has its own h1 ("Request"); wait for the loaded one.
    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'Request: Buildout Pro 3.1 (Buildout Inc)',
    });
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getAllByText('Human Review').length).toBeGreaterThan(0);
    expect(document.title).toBe('Request: Buildout Pro 3.1 (Buildout Inc) - EOCR');
    expect(screen.getByRole('link', { name: 'Back to My requests' }).getAttribute('href')).toBe(
      '/requests'
    );
    expect(screen.getByText('Department budget')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Continue draft' })).toBeNull();
  });

  it('lists the history newest first, in words', async () => {
    renderDetails(() => jsonResponse(REQUEST));

    const history = await screen.findByRole('list', { name: 'Status history, newest first' });
    const items = within(history).getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain('Status: Human Review');
    expect(items[0].textContent).toContain('Changed from Submitted by Admin Example');
    expect(items[2].textContent).toContain('Started by Dana Example');
    expect(items[2].textContent).toContain('Request started.');
  });

  it('offers Continue draft for a draft', async () => {
    renderDetails(() =>
      jsonResponse({ ...REQUEST, statusCode: 'Draft', statusLabel: 'Draft', submittedAt: null })
    );

    const link = await screen.findByRole('link', { name: 'Continue draft' });
    expect(link.getAttribute('href')).toBe('/requests/2/edit');
  });

  it("shows the reviewer's message and Update request when more information is needed", async () => {
    renderDetails(() =>
      jsonResponse({
        ...REQUEST,
        statusCode: 'MoreInfoNeeded',
        statusLabel: 'More Info Needed',
        history: [
          ...REQUEST.history,
          {
            workflowHistoryId: 4,
            previousStatusCode: 'HumanReview',
            previousStatusLabel: 'Human Review',
            newStatusCode: 'MoreInfoNeeded',
            newStatusLabel: 'More Info Needed',
            changedByName: 'Admin Example',
            changedAt: '2026-10-14T12:00:00Z',
            comments: 'Please attach the current VPAT.',
          },
        ],
      })
    );

    const note = await screen.findByRole('note');
    expect(
      within(note).getByRole('heading', { level: 2, name: 'The reviewer needs more information' })
    ).toBeTruthy();
    expect(note.textContent).toContain('Please attach the current VPAT.');
    expect(screen.getByRole('link', { name: 'Update request' }).getAttribute('href')).toBe(
      '/requests/2/edit'
    );
  });

  it('shows "Request not found" for a 404 (another user’s request)', async () => {
    renderDetails(() => jsonResponse({}, 404));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Request not found' })
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to My requests' }).getAttribute('href')).toBe(
      '/requests'
    );
  });
});
