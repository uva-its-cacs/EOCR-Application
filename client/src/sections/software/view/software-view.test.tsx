// @vitest-environment jsdom
import type { Software } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { ok, pending, renderView, serverError, jsonResponse } from 'src/test/render-view';

import { SoftwareView } from './software-view';

// ----------------------------------------------------------------------

const SOFTWARE: Software = {
  softwareId: 1,
  softwareName: 'Sample Tracker',
  vendorName: 'Sample Corp',
  publisherWebsite: null,
  softwareCategoryId: null,
  softwareCategoryCode: null,
  softwareCategoryLabel: null,
  businessOwnerId: null,
  businessOwnerName: null,
  technicalOwnerId: null,
  technicalOwnerName: null,
  currentApprovalStatusId: 1,
  currentApprovalStatusCode: 'ApprovedWithConditions',
  currentApprovalStatusLabel: 'Approved with conditions',
  accessibilityRiskId: null,
  accessibilityRiskCode: null,
  accessibilityRiskLabel: null,
  approvalDate: null,
  approvalExpirationDate: '2027-03-31',
  notes: null,
  createdAt: '2026-09-01T12:00:00Z',
  updatedAt: '2026-09-01T12:00:00Z',
};

const refreshButton = () => screen.getByRole('button', { name: 'Refresh' });
const refreshStatus = () =>
  screen
    .getAllByRole('status')
    .find((s) => s.tagName === 'SPAN' && !s.closest('.MuiDataGrid-root'));

function mockSoftwareApi(...handlers: (() => Promise<Response>)[]) {
  let softwareCall = 0;
  const fetchMock = vi.fn((url: string) => {
    if (url === '/api/requests/mine') return Promise.resolve(jsonResponse([]));
    const handler = handlers[Math.min(softwareCall, handlers.length - 1)];
    softwareCall += 1;
    return handler();
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('SoftwareView', () => {
  it('shows the loading status, and Refresh is busy but stays enabled', async () => {
    mockSoftwareApi(pending);
    renderView(<SoftwareView />);

    expect(await screen.findByRole('grid', { name: 'Software catalog' })).toBeTruthy();
    expect(refreshButton().getAttribute('aria-busy')).toBe('true');
    expect(refreshButton().getAttribute('aria-disabled')).toBe('true');
    expect((refreshButton() as HTMLButtonElement).disabled).toBe(false);
    // The initial load is not announced.
    expect(refreshStatus()?.textContent).toBe('');
  });

  it('shows the error with Retry, which fetches again', async () => {
    const fetchMock = mockSoftwareApi(serverError);
    renderView(<SoftwareView />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Software could not be loaded.');

    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    await vi.waitFor(() =>
      expect(fetchMock.mock.calls.filter(([url]) => url === '/api/software')).toHaveLength(2)
    );
  });

  it('moves focus to the h1 after a successful Retry (the Retry button disappears)', async () => {
    mockSoftwareApi(serverError, ok([SOFTWARE]));
    renderView(
      <main id="main-content">
        <SoftwareView />
      </main>
    );

    const alert = await screen.findByRole('alert');
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));

    await screen.findByRole('grid', { name: 'Software catalog' });
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    );
  });

  it('shows the empty state inside the named grid', async () => {
    mockSoftwareApi(ok([]));
    renderView(<SoftwareView />);

    const grid = await screen.findByRole('grid', { name: 'Software catalog' });
    expect(await within(grid).findByText('No software is currently in the catalog.')).toBeTruthy();
  });

  it('shows rows with chip text, dates, "Not set", and the labelled search field', async () => {
    mockSoftwareApi(ok([SOFTWARE]));
    renderView(<SoftwareView />);

    const grid = await screen.findByRole('grid', { name: 'Software catalog' });

    expect(within(grid).getByText('Approved with conditions')).toBeTruthy();
    expect(within(grid).getByText('Mar 31, 2027')).toBeTruthy();
    expect(within(grid).getAllByText('Not set')).toHaveLength(2);
    expect(within(grid).getByRole('link', { name: 'Edit Sample Tracker' })).toBeTruthy();
    expect(screen.getByLabelText('Search software')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Columns' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Filters' })).toBeTruthy();
  });

  it('announces a refresh the user asked for, then its completion', async () => {
    let release: (r: Response) => void = () => {};
    mockSoftwareApi(ok([SOFTWARE]), () => new Promise<Response>((r) => (release = r)));
    renderView(<SoftwareView />);
    await screen.findByRole('grid', { name: 'Software catalog' });
    await vi.waitFor(() => expect(refreshButton().getAttribute('aria-busy')).toBe('false'));
    expect(refreshButton().getAttribute('aria-busy')).toBe('false');

    fireEvent.click(refreshButton());

    await vi.waitFor(() => expect(refreshStatus()?.textContent).toBe('Refreshing software...'));
    expect(refreshButton().getAttribute('aria-busy')).toBe('true');

    release(
      new Response(JSON.stringify([SOFTWARE]), { headers: { 'Content-Type': 'application/json' } })
    );

    await vi.waitFor(() => expect(refreshStatus()?.textContent).toBe('Software list updated'));
    expect(refreshButton().getAttribute('aria-busy')).toBe('false');
  });

  it('ignores Refresh clicks while fetching', async () => {
    const fetchMock = mockSoftwareApi(pending);
    renderView(<SoftwareView />);
    await screen.findByRole('grid', { name: 'Software catalog' });

    fireEvent.click(refreshButton());

    expect(fetchMock.mock.calls.filter(([url]) => url === '/api/software')).toHaveLength(1);
    expect(refreshStatus()?.textContent).toBe('');
  });
});
