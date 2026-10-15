// @vitest-environment jsdom
import type { SoftwareCatalogItem } from '../types';
import type { MeDto } from 'src/sections/auth/types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { renderView, jsonResponse } from 'src/test/render-view';

import { SoftwareCatalogView } from './software-catalog-view';
import { SoftwareCatalogPageView } from './software-catalog-page-view';

const SOFTWARE: SoftwareCatalogItem[] = [
  {
    softwareId: 1,
    softwareName: 'Acme Reader',
    vendorName: 'Acme Tools',
    softwareCategoryLabel: 'Documents',
    currentApprovalStatusCode: 'Approved',
    currentApprovalStatusLabel: 'Approved',
    accessibilityRiskLabel: 'Low',
    approvalExpirationDate: '2027-09-30',
    createdAt: '2026-09-30T12:00:00Z',
  },
  {
    softwareId: 2,
    softwareName: 'Beacon Planner',
    vendorName: 'Beacon Systems',
    softwareCategoryLabel: 'Planning',
    currentApprovalStatusCode: 'Denied',
    currentApprovalStatusLabel: 'Denied',
    accessibilityRiskLabel: 'High',
    approvalExpirationDate: null,
    createdAt: '2026-10-01T12:00:00Z',
  },
];

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows request counts, searches vendor and product, and clears active filters', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => jsonResponse([]))
  );
  renderView(<SoftwareCatalogView rows={SOFTWARE} />);

  expect(await screen.findByRole('grid', { name: 'Software catalog' })).toBeTruthy();
  expect(screen.getByRole('heading', { name: 'Software catalog' })).toBeTruthy();
  expect(screen.getByText('Your request counts')).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'All software (2)' })).toBeTruthy();

  fireEvent.change(screen.getByRole('textbox', { name: 'Search software' }), {
    target: { value: 'Beacon' },
  });

  expect(await screen.findByText('Beacon Planner')).toBeTruthy();
  expect(screen.queryByText('Acme Reader')).toBeNull();
  expect(screen.getByText('Search: Beacon')).toBeTruthy();

  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(await screen.findByText('Acme Reader')).toBeTruthy();
  expect(screen.getByText('Beacon Planner')).toBeTruthy();
});

it('filters catalog rows by approval status and exposes the active status filter', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => jsonResponse([]))
  );
  renderView(<SoftwareCatalogView rows={SOFTWARE} />);

  await screen.findByRole('grid', { name: 'Software catalog' });
  fireEvent.click(screen.getByRole('tab', { name: 'Denied (1)' }));

  expect(await screen.findByText('Beacon Planner')).toBeTruthy();
  expect(screen.queryByText('Acme Reader')).toBeNull();
  expect(screen.getByText('Approval status: Denied')).toBeTruthy();
});

const USER: MeDto = {
  userId: 1,
  name: 'Dana Example',
  email: 'dana@example.com',
  roleCode: 'User',
  roleLabel: 'User',
};
const ADMIN: MeDto = { ...USER, roleCode: 'Admin', roleLabel: 'Admin' };

/** Answers /api/me and /api/requests/mine; each catalog call gets the next handler (the last repeats). */
function mockCatalogApi(me: MeDto | null, ...catalog: (() => Promise<Response>)[]) {
  let catalogCall = 0;
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/me') return Promise.resolve(me ? jsonResponse(me) : jsonResponse({}, 401));
    if (url === '/api/requests/mine') return Promise.resolve(jsonResponse([]));
    if (url === '/api/software/catalog') {
      const handler = catalog[Math.min(catalogCall, catalog.length - 1)];
      catalogCall += 1;
      return handler();
    }
    return Promise.resolve(jsonResponse([], 404));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

const ok = (body: unknown) => () => Promise.resolve(jsonResponse(body));
const pending = () => new Promise<Response>(() => {});
const serverError = () => Promise.resolve(new Response('', { status: 500 }));
const catalogCalls = (fetchMock: ReturnType<typeof mockCatalogApi>) =>
  fetchMock.mock.calls.filter(([input]) => String(input) === '/api/software/catalog');
const refreshButton = () => screen.getByRole('button', { name: 'Refresh' });
const refreshStatus = () =>
  screen
    .getAllByRole('status')
    .find((s) => s.tagName === 'SPAN' && !s.closest('.MuiDataGrid-root'));

describe('SoftwareCatalogPageView', () => {
  it('loads the shared catalog and offers Request software without Edit links for a User', async () => {
    const fetchMock = mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    const grid = await screen.findByRole('grid', { name: 'Software catalog' });
    expect(await within(grid).findByText('Acme Reader')).toBeTruthy();
    expect(catalogCalls(fetchMock)).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Request software' })).toBeTruthy();
    expect(within(grid).queryByRole('link', { name: 'Edit Acme Reader' })).toBeNull();
    expect(within(grid).queryByText('Actions')).toBeNull();
  });

  it('shows an Edit link per row for an Admin', async () => {
    mockCatalogApi(ADMIN, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    const grid = await screen.findByRole('grid', { name: 'Software catalog' });
    const edit = await within(grid).findByRole('link', { name: 'Edit Acme Reader' });
    expect(edit.getAttribute('href')).toBe('/admin/software/1/edit');
    expect(within(grid).getByRole('link', { name: 'Edit Beacon Planner' })).toBeTruthy();
  });

  it('hides Edit links when the user is not signed in', async () => {
    mockCatalogApi(null, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    const grid = await screen.findByRole('grid', { name: 'Software catalog' });
    expect(await within(grid).findByText('Acme Reader')).toBeTruthy();
    expect(within(grid).queryByRole('link', { name: 'Edit Acme Reader' })).toBeNull();
  });

  it('shows the error with Retry, then moves focus to the h1 after a successful Retry', async () => {
    const fetchMock = mockCatalogApi(USER, serverError, ok(SOFTWARE));
    renderView(
      <main id="main-content">
        <SoftwareCatalogPageView />
      </main>
    );

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('The software catalog could not be loaded.');
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));

    await screen.findByRole('grid', { name: 'Software catalog' });
    expect(catalogCalls(fetchMock)).toHaveLength(2);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    );
  });

  it('keeps Refresh enabled but busy while loading, and ignores clicks then', async () => {
    const fetchMock = mockCatalogApi(USER, pending);
    renderView(<SoftwareCatalogPageView />);

    await screen.findByRole('grid', { name: 'Software catalog' });
    expect(refreshButton().getAttribute('aria-busy')).toBe('true');
    expect(refreshButton().getAttribute('aria-disabled')).toBe('true');
    expect((refreshButton() as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(refreshButton());
    expect(catalogCalls(fetchMock)).toHaveLength(1);
    // The initial load is not announced.
    expect(refreshStatus()?.textContent).toBe('');
  });

  it('announces a refresh the user asked for, then its completion', async () => {
    let release: (r: Response) => void = () => {};
    mockCatalogApi(USER, ok(SOFTWARE), () => new Promise<Response>((r) => (release = r)));
    renderView(<SoftwareCatalogPageView />);
    await screen.findByRole('grid', { name: 'Software catalog' });
    await vi.waitFor(() => expect(refreshButton().getAttribute('aria-busy')).toBe('false'));

    fireEvent.click(refreshButton());
    await vi.waitFor(() => expect(refreshStatus()?.textContent).toBe('Refreshing software...'));

    release(jsonResponse(SOFTWARE));
    await vi.waitFor(() => expect(refreshStatus()?.textContent).toBe('Software list updated'));
    expect(refreshButton().getAttribute('aria-busy')).toBe('false');
  });
});
