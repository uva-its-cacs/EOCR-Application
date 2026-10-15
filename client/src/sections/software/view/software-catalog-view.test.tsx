// @vitest-environment jsdom
import type { SoftwareCatalogItem } from '../types';

import { it, vi, expect, afterEach } from 'vitest';
import { screen, cleanup, fireEvent } from '@testing-library/react';

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

it('loads the shared catalog endpoint and offers a request action without admin editing', async () => {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/software/catalog') return jsonResponse(SOFTWARE);
    if (url === '/api/requests/mine') return jsonResponse([]);
    return jsonResponse([], 404);
  });
  vi.stubGlobal('fetch', fetchMock);
  renderView(<SoftwareCatalogPageView />);

  const grid = await screen.findByRole('grid', { name: 'Software catalog' });
  expect(await screen.findByText('Acme Reader')).toBeTruthy();
  expect(fetchMock.mock.calls.some(([input]) => String(input) === '/api/software/catalog')).toBe(
    true
  );
  expect(screen.getByRole('link', { name: 'Request software' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Edit Acme Reader' })).toBeNull();
  expect(grid).toBeTruthy();
});
