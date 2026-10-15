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
  exception: null,
};

const EXCEPTION: NonNullable<RequestDetail['exception']> = {
  exceptionId: 4,
  statusCode: 'Approved',
  statusLabel: 'Approved',
  businessJustification: null,
  accessibilityImpact: null,
  mitigationPlan: null,
  submittedAt: null,
  approvalDate: null,
  expirationDate: null,
  updatedAt: '2026-10-14T12:00:00Z',
  isExpired: false,
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

  it('asks for the EEAAP with the reviewer’s message and links to its page', async () => {
    renderDetails(() =>
      jsonResponse({
        ...REQUEST,
        statusCode: 'AwaitingEeaap',
        statusLabel: 'Awaiting EEAAP',
        history: [
          ...REQUEST.history,
          {
            workflowHistoryId: 5,
            previousStatusCode: 'HumanReview',
            previousStatusLabel: 'Human Review',
            newStatusCode: 'AwaitingEeaap',
            newStatusLabel: 'Awaiting EEAAP',
            changedByName: 'Admin Example',
            changedAt: '2026-10-14T12:00:00Z',
            comments: 'The floor plans need text descriptions.',
          },
        ],
        exception: { ...EXCEPTION, statusCode: 'Requested', statusLabel: 'Requested' },
      })
    );

    const note = await screen.findByRole('note');
    expect(note.textContent).toContain('The floor plans need text descriptions.');
    expect(screen.getByRole('link', { name: 'Complete the EEAAP' }).getAttribute('href')).toBe(
      '/requests/2/eeaap'
    );
    const card = screen.getByRole('heading', { level: 2, name: 'Exception (EEAAP)' });
    expect(card).toBeTruthy();
    expect(screen.getAllByText('Not answered yet')).toHaveLength(3);
  });

  it('shows an approved exception with its dates, and an expired one as Expired', async () => {
    renderDetails(() =>
      jsonResponse({
        ...REQUEST,
        statusCode: 'ApprovedWithConditions',
        statusLabel: 'Approved with Conditions',
        exception: {
          ...EXCEPTION,
          mitigationPlan: 'Phone support with a screen reader user on staff.',
          approvalDate: '2025-08-01',
          expirationDate: '2026-08-01',
          isExpired: true,
        },
      })
    );

    await screen.findByRole('heading', { level: 2, name: 'Exception (EEAAP)' });
    expect(screen.getByText('Phone support with a screen reader user on staff.')).toBeTruthy();
    // The chip and the date term both say Expired.
    expect(screen.getAllByText('Expired')).toHaveLength(2);
    expect(screen.getByText('Aug 1, 2026')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Complete the EEAAP' })).toBeNull();
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
