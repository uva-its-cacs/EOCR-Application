// @vitest-environment jsdom
import type { RequestDetail } from '../types';

import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { jsonResponse } from 'src/test/render-view';
import { renderRoutes } from 'src/test/render-with-theme';

import { RequestIntakeView } from './request-intake-view';

// ----------------------------------------------------------------------

const CATALOG = [
  {
    softwareId: 7,
    softwareName: 'Northstar Collaborate',
    vendorName: 'Northstar Technologies',
    softwareCategoryLabel: null,
    currentApprovalStatusCode: 'Approved',
    currentApprovalStatusLabel: 'Approved',
    accessibilityRiskLabel: null,
    approvalExpirationDate: '2099-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    softwareId: 8,
    softwareName: 'Ember Workflow',
    vendorName: 'Ember Systems LLC',
    softwareCategoryLabel: null,
    currentApprovalStatusCode: 'Expired',
    currentApprovalStatusLabel: 'Expired',
    accessibilityRiskLabel: null,
    approvalExpirationDate: '2026-01-01',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

const FUNDING = [
  { codeId: 1201, value: 'DepartmentBudget', label: 'Department budget' },
  { codeId: 1202, value: 'Grant', label: 'Grant' },
];

type Call = { method: string; url: string; body: Record<string, unknown> | null };

const saved = (body: Record<string, unknown> | null, statusCode = 'Draft'): RequestDetail => ({
  requestId: 42,
  title: String(body?.softwareName ?? ''),
  softwareName: String(body?.softwareName ?? ''),
  vendor: String(body?.vendor ?? ''),
  department: String(body?.department ?? ''),
  businessNeed: String(body?.businessNeed ?? ''),
  fundingSourceId: (body?.fundingSourceId as number | null) ?? null,
  fundingSourceCode: null,
  fundingSourceLabel: null,
  url: (body?.url as string | null) ?? null,
  vpatSubmitted: !!body?.vpatSubmitted,
  softwareId: (body?.softwareId as number | null) ?? null,
  statusCode,
  statusLabel: statusCode,
  submittedAt: null,
  createdAt: '2026-10-15T12:00:00Z',
  updatedAt: '2026-10-15T12:00:00Z',
  history: [],
});

let calls: Call[] = [];
const created = () => calls.find((c) => c.method === 'POST' && c.url === '/api/requests');

// jsdom has no ResizeObserver (the template's Scrollbar and popovers measure with one).
beforeEach(() => {
  calls = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  );
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ method, url, body });
      if (url === '/api/software/catalog') return jsonResponse(CATALOG);
      if (url === '/api/codes/FundingSource') return jsonResponse(FUNDING);
      if (url === '/api/requests' && method === 'POST') return jsonResponse(saved(body), 201);
      if (url === '/api/requests/42/submit') {
        return jsonResponse(saved(created()?.body ?? null, 'Submitted'));
      }
      return jsonResponse({}, 404);
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderIntake() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderRoutes(
    [
      {
        path: '/requests/new',
        element: (
          <QueryClientProvider client={client}>
            <RequestIntakeView draft={null} />
          </QueryClientProvider>
        ),
      },
      { path: '/requests/:id', element: <p>Status page</p> },
      { path: '/requests/:id/edit', element: <p>Edit page</p> },
    ],
    '/requests/new'
  );
}

const startNew = async () => {
  fireEvent.click(screen.getByRole('button', { name: /not listed/ }));
  return screen.findByRole('textbox', { name: /Software name/ });
};

describe('RequestIntakeView', () => {
  it('starts with the catalog check, marking the current step', () => {
    renderIntake();

    const steps = screen.getByRole('list', { name: 'Request steps' });
    const current = within(steps)
      .getAllByRole('listitem')
      .find((li) => li.getAttribute('aria-current') === 'step');
    expect(current?.textContent).toContain('Check the catalog');
    expect(screen.getByRole('heading', { level: 2, name: /Step 1 of 3/ })).toBeTruthy();
  });

  it('shows catalog matches with status text and guidance; a match prefills the request', async () => {
    renderIntake();

    fireEvent.change(screen.getByRole('textbox', { name: 'Software or vendor name' }), {
      target: { value: 'ember' },
    });
    const list = await screen.findByRole('list', { name: 'Matching software' });
    expect(within(list).getByText('Expired')).toBeTruthy();
    expect(
      within(list).getByText('The approval has expired. A new review is needed.')
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Request a review of Ember Workflow' }));

    expect(await screen.findByRole('heading', { level: 2, name: /Step 2 of 3/ })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: /Software name/ }) as HTMLInputElement).value).toBe(
      'Ember Workflow'
    );
    expect((screen.getByRole('textbox', { name: /Vendor/ }) as HTMLInputElement).value).toBe(
      'Ember Systems LLC'
    );
    expect(
      screen.getByText('This request is for Ember Workflow, from the software catalog.')
    ).toBeTruthy();
  });

  it('on submit with fields missing, shows the errors and focuses the first missing field', async () => {
    renderIntake();
    fireEvent.change(await startNew(), { target: { value: 'Quill Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next: review' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Submit request' }));

    const vendor = await screen.findByRole('textbox', { name: /Vendor/ });
    await waitFor(() => expect(document.activeElement).toBe(vendor));
    expect(vendor.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Complete the highlighted fields before submitting.')).toBeTruthy();
    expect(calls.some((c) => c.method !== 'GET')).toBe(false);
  });

  it('saves a draft with only a name', async () => {
    renderIntake();
    fireEvent.change(await startNew(), { target: { value: 'Quill Notes' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save as draft' }));

    expect(await screen.findByText('Edit page')).toBeTruthy();
    expect(created()?.body).toMatchObject({ softwareName: 'Quill Notes', fundingSourceId: null });
  });

  it('submits a complete request and opens its status page', async () => {
    renderIntake();
    fireEvent.change(await startNew(), { target: { value: 'Quill Notes' } });
    fireEvent.change(screen.getByRole('textbox', { name: /Vendor/ }), {
      target: { value: 'Quill Labs' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Your department/ }), {
      target: { value: 'Library' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Business need/ }), {
      target: { value: 'Note taking.' },
    });
    // The select is disabled until the funding sources load.
    const funding = screen.getByRole('combobox', { name: /Funding source/ });
    await waitFor(() => expect(funding.getAttribute('aria-disabled')).not.toBe('true'));
    fireEvent.mouseDown(funding);
    fireEvent.click(await screen.findByRole('option', { name: 'Grant' }));
    // A single select closes its menu on choice.
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    fireEvent.click(screen.getByRole('checkbox', { name: /VPAT/ }));

    fireEvent.click(screen.getByRole('button', { name: 'Next: review' }));
    expect(await screen.findByText('Grant')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Submit request' }));

    expect(await screen.findByText('Status page')).toBeTruthy();
    expect(created()?.body).toMatchObject({
      fundingSourceId: 1202,
      vpatSubmitted: true,
      department: 'Library',
    });
    expect(calls.some((c) => c.url === '/api/requests/42/submit')).toBe(true);
  });
});
