// @vitest-environment jsdom
import type { SoftwareCatalogItem } from '../types';
import type { MeDto } from 'src/sections/auth/types';

import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { renderView, jsonResponse } from 'src/test/render-view';

import { SoftwareListView } from './software-list-view';
import { SoftwareCatalogPageView } from './software-catalog-page-view';

const SOFTWARE: SoftwareCatalogItem[] = [
  {
    softwareId: 1,
    softwareName: 'Acme Reader',
    vendorName: 'Acme Tools',
    version: '1.0',
    softwareCategoryLabel: 'Documents',
    currentApprovalStatusCode: 'Approved',
    currentApprovalStatusLabel: 'Approved',
    accessibilityRiskLabel: 'Low',
    approvalExpirationDate: '2027-09-30',
    conditions: null,
    exceptionExpirationDate: null,
    exceptionExpired: false,
    createdAt: '2026-09-30T12:00:00Z',
  },
  {
    softwareId: 2,
    softwareName: 'Beacon Planner',
    vendorName: 'Beacon Systems',
    version: '1.0',
    softwareCategoryLabel: 'Planning',
    currentApprovalStatusCode: 'Denied',
    currentApprovalStatusLabel: 'Denied',
    accessibilityRiskLabel: null,
    approvalExpirationDate: null,
    conditions: null,
    exceptionExpirationDate: null,
    exceptionExpired: false,
    createdAt: '2026-10-01T12:00:00Z',
  },
];

// jsdom has no ResizeObserver (CustomPopover measures its anchor with one).
beforeEach(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const table = () => screen.getByRole('table', { name: 'Software catalog' });
// Data rows only: the header row and the template's empty filler rows have fewer cells.
const bodyRows = () =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .filter((row) => within(row).queryAllByRole('cell').length > 1);
const firstCellText = () =>
  bodyRows().map((row) => within(row).getAllByRole('cell')[0].textContent);

describe('SoftwareListView', () => {
  it('shows the catalog under its heading (no catalog-wide summary), rows with status text, and "Not set" for empty values', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    expect(screen.queryByRole('region', { name: 'Approval summary' })).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Find your software' })).toBeTruthy();

    expect(within(table()).getByText('Acme Reader')).toBeTruthy();
    expect(within(table()).getByText('Acme Tools')).toBeTruthy();
    expect(within(table()).getByText('Sep 30, 2027')).toBeTruthy();
    expect(within(table()).getAllByText('Not set')).toHaveLength(2);
    expect(within(table()).getAllByText('Denied').length).toBeGreaterThan(0);
  });

  it('sorts newest first, and toggles a column sort from its header button', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    expect(firstCellText()[0]).toContain('Beacon Planner');

    fireEvent.click(within(table()).getByRole('button', { name: 'Software' }));
    expect(firstCellText()[0]).toContain('Acme Reader');
    expect(
      within(table())
        .getByRole('columnheader', { name: /Software/ })
        .getAttribute('aria-sort')
    ).toBe('ascending');

    fireEvent.click(within(table()).getByRole('button', { name: /Software/ }));
    expect(firstCellText()[0]).toContain('Beacon Planner');
  });

  it('searches vendor and product, shows the result, and clears the filters', async () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Search software' }), {
      target: { value: 'beacon systems' },
    });

    expect(firstCellText()).toHaveLength(1);
    expect(firstCellText()[0]).toContain('Beacon Planner');
    expect(
      screen.getByRole('button', { name: 'Remove keyword filter: beacon systems' })
    ).toBeTruthy();
    expect(screen.getByRole('status', { name: '' }).textContent).toBe('1 results found');

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(firstCellText()).toHaveLength(2);
    expect(screen.queryByRole('button', { name: /Remove keyword filter/ })).toBeNull();
  });

  it('filters by approval status tab and removes the status chip with Enter', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Denied (1)' }));
    expect(firstCellText()).toHaveLength(1);
    expect(firstCellText()[0]).toContain('Beacon Planner');

    const chip = screen.getByRole('button', { name: 'Remove status filter: Denied' });
    fireEvent.click(chip);
    expect(firstCellText()).toHaveLength(2);
    expect(
      screen.getByRole('tab', { name: 'All software (2)' }).getAttribute('aria-selected')
    ).toBe('true');
  });

  it('filters by category from the multi-select', async () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Category' }));
    fireEvent.click(await screen.findByRole('option', { name: 'Planning' }));
    // The open menu hides the page from assistive technology; close it first.
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    await vi.waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());

    expect(firstCellText()).toHaveLength(1);
    expect(firstCellText()[0]).toContain('Beacon Planner');
    expect(screen.getByRole('button', { name: 'Remove category filter: Planning' })).toBeTruthy();
  });

  it('shows the empty state when nothing matches', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    fireEvent.change(screen.getByRole('textbox', { name: 'Search software' }), {
      target: { value: 'nothing like this' },
    });
    expect(within(table()).getByText('No software matches your search or filters.')).toBeTruthy();
  });

  it('has no actions column or menu without editHref', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    expect(within(table()).queryByRole('columnheader', { name: 'Actions' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull();
  });

  it('opens a per-row actions menu with an Edit link when editHref is given', async () => {
    renderView(
      <SoftwareListView
        rows={SOFTWARE}
        editHref={(id) => `/admin/software/${id}/edit`}
      />
    );

    expect(within(table()).getByRole('columnheader', { name: 'Actions' })).toBeTruthy();
    const trigger = screen.getByRole('button', { name: 'Actions for Acme Reader' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);

    const menu = await screen.findByRole('menu', { name: 'Actions for Acme Reader' });
    const edit = within(menu).getByRole('menuitem', { name: 'Edit' });
    expect(edit.getAttribute('href')).toBe('/admin/software/1/edit');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});

// ----------------------------------------------------------------------

const USER: MeDto = {
  userId: 1,
  name: 'Dana Example',
  email: 'dana@example.com',
  roleCode: 'User',
  roleLabel: 'User',
};
const ADMIN: MeDto = { ...USER, roleCode: 'Admin', roleLabel: 'Admin' };

// The viewer's requests and the review queue (both empty unless a test sets them).
let myRequests: () => Promise<Response> = () => Promise.resolve(jsonResponse([]));
let reviewQueue: () => Promise<Response> = () => Promise.resolve(jsonResponse([]));

/** Answers /api/me; each catalog call gets the next handler (the last repeats). */
function mockCatalogApi(me: MeDto | null, ...catalog: (() => Promise<Response>)[]) {
  let catalogCall = 0;
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/me') return Promise.resolve(me ? jsonResponse(me) : jsonResponse({}, 401));
    if (url === '/api/requests/mine') return myRequests();
    if (url === '/api/admin/requests') return reviewQueue();
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
    .find((s) => s.textContent === '' || /Refreshing|updated/.test(s.textContent ?? ''));

const request = (id: number, statusCode: string, updatedAt: string) => ({
  requestId: id,
  softwareName: `Tool ${id}`,
  vendor: 'Vendor',
  version: '1.0',
  statusCode,
  statusLabel: statusCode,
  updatedAt,
});

describe('SoftwareCatalogPageView', () => {
  afterEach(() => {
    myRequests = () => Promise.resolve(jsonResponse([]));
    reviewQueue = () => Promise.resolve(jsonResponse([]));
  });

  it('shows the viewer’s request counts and their five most recent requests, with View all', async () => {
    myRequests = ok([
      request(1, 'Draft', '2026-10-01T00:00:00Z'),
      request(2, 'HumanReview', '2026-10-06T00:00:00Z'),
      request(3, 'MoreInfoNeeded', '2026-10-05T00:00:00Z'),
      request(4, 'Approved', '2026-10-04T00:00:00Z'),
      request(5, 'Submitted', '2026-10-03T00:00:00Z'),
      request(6, 'Denied', '2026-10-02T00:00:00Z'),
    ]);
    mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    const strip = await screen.findByRole('region', { name: 'Your requests' });
    // In review (Submitted, Human review) and Decided (Approved, Denied) have two each.
    expect(await within(strip).findAllByText('2 items')).toHaveLength(2);
    expect(within(strip).getByRole('heading', { name: 'Decided' })).toBeTruthy();
    expect(within(strip).getAllByText('1 item')).toHaveLength(2);

    const recent = screen.getByRole('table', { name: 'Your recent requests' });
    const links = within(recent)
      .getAllByRole('link')
      .map((link) => link.textContent);
    expect(links).toEqual(['Tool 2', 'Tool 3', 'Tool 4', 'Tool 5', 'Tool 6']);
    expect(screen.getByRole('link', { name: 'View all requests' }).getAttribute('href')).toBe(
      '/requests'
    );
    expect(screen.queryByRole('heading', { name: 'Review queue' })).toBeNull();
  });

  it('hides the counts for a viewer with no requests and offers a request instead', async () => {
    mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByText('You have no requests yet')).toBeTruthy();
    expect(screen.queryByRole('region', { name: 'Your requests' })).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Request software' })).toHaveLength(2);
  });

  it('never shows 0 while the viewer’s requests load', async () => {
    myRequests = pending;
    mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    const strip = await screen.findByRole('region', { name: 'Your requests' });
    expect(within(strip).queryByText(/^0/)).toBeNull();
    expect(within(strip).getAllByText('Loading').length).toBeGreaterThan(0);
  });

  it('shows admins the review queue counts with a link to the queue', async () => {
    reviewQueue = ok([
      { requestId: 1, statusCode: 'Submitted' },
      { requestId: 2, statusCode: 'HumanReview' },
      { requestId: 3, statusCode: 'AwaitingEeaap' },
      { requestId: 4, statusCode: 'Approved' },
    ]);
    mockCatalogApi(ADMIN, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByRole('heading', { level: 2, name: 'Review queue' })).toBeTruthy();
    await screen.findByText('Waiting to start');
    expect(screen.getByRole('link', { name: 'Open the review queue' }).getAttribute('href')).toBe(
      '/admin/requests'
    );
  });

  it('loads the shared catalog and offers Request software without row actions for a User', async () => {
    const fetchMock = mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByText('Acme Reader')).toBeTruthy();
    expect(catalogCalls(fetchMock)).toHaveLength(1);
    // The header action (and the empty recent requests card's, for a viewer with no requests).
    expect(screen.getAllByRole('link', { name: 'Request software' }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull();
  });

  it('shows row actions for an Admin', async () => {
    mockCatalogApi(ADMIN, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByRole('button', { name: 'Actions for Acme Reader' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Actions for Beacon Planner' })).toBeTruthy();
  });

  it('hides row actions when the user is not signed in', async () => {
    mockCatalogApi(null, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByText('Acme Reader')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Actions for/ })).toBeNull();
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

    expect(await screen.findByText('Acme Reader')).toBeTruthy();
    expect(catalogCalls(fetchMock)).toHaveLength(2);
    await vi.waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
    );
  });

  it('shows loading in the table, keeps Refresh enabled but busy, and ignores clicks then', async () => {
    const fetchMock = mockCatalogApi(USER, pending);
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByText('Loading software...')).toBeTruthy();
    expect(refreshButton().getAttribute('aria-busy')).toBe('true');
    expect(refreshButton().getAttribute('aria-disabled')).toBe('true');
    expect((refreshButton() as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(refreshButton());
    expect(catalogCalls(fetchMock)).toHaveLength(1);
    // The initial load is not announced.
    expect(screen.queryByText('Refreshing software...')).toBeNull();
  });

  it('announces a refresh the user asked for, then its completion', async () => {
    let release: (r: Response) => void = () => {};
    mockCatalogApi(USER, ok(SOFTWARE), () => new Promise<Response>((r) => (release = r)));
    renderView(<SoftwareCatalogPageView />);
    await screen.findByText('Acme Reader');
    await vi.waitFor(() => expect(refreshButton().getAttribute('aria-busy')).toBe('false'));

    fireEvent.click(refreshButton());
    expect(await screen.findByText('Refreshing software...')).toBeTruthy();

    release(jsonResponse(SOFTWARE));
    expect(await screen.findByText('Software list updated')).toBeTruthy();
    expect(refreshButton().getAttribute('aria-busy')).toBe('false');
    expect(refreshStatus()).toBeTruthy();
  });
});
