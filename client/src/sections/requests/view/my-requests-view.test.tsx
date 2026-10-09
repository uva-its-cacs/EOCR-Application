// @vitest-environment jsdom
import type { RequestSummary } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { ok, pending, mockFetch, renderView, serverError } from 'src/test/render-view';

import { MyRequestsView } from './my-requests-view';

// ----------------------------------------------------------------------

const REQUESTS: RequestSummary[] = [
  {
    requestId: 1,
    softwareName: 'Sample Suite',
    vendor: 'Sample Vendor',
    statusCode: 'HumanReview',
    statusLabel: 'Human review',
    updatedAt: '2026-10-01T12:00:00Z',
  },
  {
    requestId: 2,
    softwareName: 'Example Forms',
    vendor: 'Example LLC',
    statusCode: 'MoreInfoNeeded',
    statusLabel: 'More info needed',
    updatedAt: '2026-10-02T12:00:00Z',
  },
  {
    requestId: 3,
    softwareName: 'Demo Boards',
    vendor: 'Demo Systems',
    statusCode: 'Submitted',
    statusLabel: 'Submitted',
    updatedAt: '2026-10-03T12:00:00Z',
  },
];

function summaryValues() {
  const summary = screen.getByRole('region', { name: 'Summary' });
  const terms = within(summary).getAllByRole('term');
  const definitions = within(summary).getAllByRole('definition');
  return Object.fromEntries(terms.map((t, i) => [t.textContent, definitions[i].textContent]));
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MyRequestsView', () => {
  it('shows the loading status, and an em dash with "Loading" in each card', async () => {
    mockFetch(pending);
    renderView(<MyRequestsView />);

    expect(
      (await screen.findByText('Loading requests...')).closest('[role="status"]')
    ).toBeTruthy();

    const summary = screen.getByRole('region', { name: 'Summary' });
    expect(summary.getAttribute('aria-busy')).toBe('true');
    expect(Object.values(summaryValues())).toEqual([
      '—Loading',
      '—Loading',
      '—Loading',
      '—Loading',
    ]);
    expect(within(summary).getAllByText('—')[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('shows the error with Retry, which fetches again', async () => {
    const fetchMock = mockFetch(serverError);
    renderView(<MyRequestsView />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Failed to load requests. Please try again.');
    expect(screen.queryByRole('region', { name: 'Summary' })).toBeNull();

    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });

  it('moves focus to the h1 after a successful Retry (the Retry button disappears)', async () => {
    mockFetch(serverError, ok(REQUESTS));
    renderView(
      <main id="main-content">
        <MyRequestsView />
      </main>
    );

    const alert = await screen.findByRole('alert');
    within(alert).getByRole('button', { name: 'Retry' }).focus();
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));

    await screen.findByRole('grid', { name: 'Your vetting requests' });
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    );
  });

  it('shows the empty state with zero counts', async () => {
    mockFetch(ok([]));
    renderView(<MyRequestsView />);

    expect(await screen.findByText('You have no requests yet.')).toBeTruthy();
    expect(summaryValues()).toEqual({
      Drafts: '0',
      'In review': '0',
      'Needs your action': '0',
      Decided: '0',
    });
    expect(screen.getByRole('region', { name: 'Summary' }).getAttribute('aria-busy')).toBe('false');
    expect(screen.queryByRole('grid')).toBeNull();
  });

  it('shows the counts and the named grid with status chips', async () => {
    mockFetch(ok(REQUESTS));
    renderView(<MyRequestsView />);

    const grid = await screen.findByRole('grid', { name: 'Your vetting requests' });

    expect(within(grid).getByText('Human review')).toBeTruthy();
    expect(within(grid).getByText('More info needed')).toBeTruthy();
    expect(within(grid).getByText('Sample Suite')).toBeTruthy();
    expect(summaryValues()).toEqual({
      Drafts: '0',
      'In review': '2',
      'Needs your action': '1',
      Decided: '0',
    });
  });

  it('has one h1 and a New request link', async () => {
    mockFetch(ok([]));
    renderView(<MyRequestsView />);

    expect(await screen.findAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'New request' }).getAttribute('href')).toBe(
      '/requests/new'
    );
  });
});
