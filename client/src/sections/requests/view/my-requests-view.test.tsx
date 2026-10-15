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

// Count text of each analytics card in the Summary region, keyed by the card's heading.
function summaryValues() {
  const summary = screen.getByRole('region', { name: 'Summary' });
  return Object.fromEntries(
    within(summary)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => [heading.textContent, heading.nextElementSibling?.textContent])
  );
}

const table = () => screen.getByRole('table', { name: 'Your vetting requests' });
// Data rows only: the header row and the template's empty filler rows have fewer cells.
const dataRows = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .filter((row) => within(row).queryAllByRole('cell').length > 1);

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MyRequestsView', () => {
  it('shows loading in the table, and an em dash with "Loading" in each summary card', async () => {
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

    await screen.findByText('Sample Suite');
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    );
  });

  it('shows the empty state and zero counts', async () => {
    mockFetch(ok([]));
    renderView(<MyRequestsView />);

    expect(await screen.findByText('You have no requests yet.')).toBeTruthy();
    expect(summaryValues()).toEqual({
      Total: '0 items',
      Drafts: '0 items',
      'In review': '0 items',
      'Needs your action': '0 items',
      Decided: '0 items',
    });
    expect(screen.getByRole('region', { name: 'Summary' }).getAttribute('aria-busy')).toBe('false');
    expect(dataRows()).toHaveLength(0);
  });

  it('shows the counts and the rows with status text, newest first', async () => {
    mockFetch(ok(REQUESTS));
    renderView(<MyRequestsView />);

    await screen.findByText('Sample Suite');
    expect(within(table()).getByText('Human review')).toBeTruthy();
    expect(within(table()).getByText('More info needed')).toBeTruthy();
    expect(dataRows().map((row) => within(row).getAllByRole('cell')[0].textContent)).toEqual([
      'DDemo BoardsDemo Systems',
      'EExample FormsExample LLC',
      'SSample SuiteSample Vendor',
    ]);
    expect(summaryValues()).toEqual({
      Total: '3 items',
      Drafts: '0 items',
      'In review': '2 items',
      'Needs your action': '1 item',
      Decided: '0 items',
    });
  });

  it('filters by status tab and by search, and clears the filters', async () => {
    mockFetch(ok(REQUESTS));
    renderView(<MyRequestsView />);
    await screen.findByText('Sample Suite');

    fireEvent.click(screen.getByRole('tab', { name: 'More info needed (1)' }));
    expect(dataRows()).toHaveLength(1);
    expect(
      screen.getByRole('button', { name: 'Remove status filter: More info needed' })
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Search requests' }), {
      target: { value: 'demo systems' },
    });
    expect(dataRows()).toHaveLength(1);
    expect(dataRows()[0].textContent).toContain('Demo Boards');
  });

  it('links each request to its status page', async () => {
    mockFetch(ok(REQUESTS));
    renderView(<MyRequestsView />);

    const link = await screen.findByRole('link', { name: 'Sample Suite' });
    expect(link.getAttribute('href')).toBe('/requests/1');
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
