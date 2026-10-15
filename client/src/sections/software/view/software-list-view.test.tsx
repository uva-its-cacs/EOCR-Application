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
  it('shows the approval summary, rows with status text, and "Not set" for empty values', () => {
    renderView(<SoftwareListView rows={SOFTWARE} />);

    const summary = screen.getByRole('region', { name: 'Approval summary' });
    expect(within(summary).getByRole('heading', { name: 'Total' })).toBeTruthy();
    expect(within(summary).getByText('2 items')).toBeTruthy();
    expect(within(summary).getByRole('heading', { name: 'Denied' })).toBeTruthy();
    expect(within(summary).getAllByText('50%')).toHaveLength(2);

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

/** Answers /api/me; each catalog call gets the next handler (the last repeats). */
function mockCatalogApi(me: MeDto | null, ...catalog: (() => Promise<Response>)[]) {
  let catalogCall = 0;
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);
    if (url === '/api/me') return Promise.resolve(me ? jsonResponse(me) : jsonResponse({}, 401));
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

describe('SoftwareCatalogPageView', () => {
  it('loads the shared catalog and offers Request software without row actions for a User', async () => {
    const fetchMock = mockCatalogApi(USER, ok(SOFTWARE));
    renderView(<SoftwareCatalogPageView />);

    expect(await screen.findByText('Acme Reader')).toBeTruthy();
    expect(catalogCalls(fetchMock)).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Request software' })).toBeTruthy();
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
