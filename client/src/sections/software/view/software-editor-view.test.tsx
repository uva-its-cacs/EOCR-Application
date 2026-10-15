// @vitest-environment jsdom
import type { Software } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { paths } from 'src/routes/paths';

import { jsonResponse } from 'src/test/render-view';
import { renderRoutes } from 'src/test/render-with-theme';

import { SoftwareEditPageView } from './software-edit-page-view';

const SOFTWARE: Software = {
  softwareId: 12,
  softwareName: 'Fable Planner',
  vendorName: 'Fable Works',
  publisherWebsite: null,
  softwareCategoryId: 90,
  softwareCategoryCode: 'Archived',
  softwareCategoryLabel: 'Archived category',
  businessOwnerId: null,
  businessOwnerName: null,
  technicalOwnerId: null,
  technicalOwnerName: null,
  currentApprovalStatusId: 5,
  currentApprovalStatusCode: 'Approved',
  currentApprovalStatusLabel: 'Approved',
  accessibilityRiskId: null,
  accessibilityRiskCode: null,
  accessibilityRiskLabel: null,
  approvalDate: null,
  approvalExpirationDate: null,
  notes: null,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-02T00:00:00Z',
};

function setup(saveStatus = 200) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url === '/api/software') return jsonResponse([SOFTWARE]);
    if (url === '/api/codes/ApprovalStatus')
      return jsonResponse([{ codeId: 5, value: 'Approved', label: 'Approved' }]);
    if (url === '/api/codes/SoftwareCategory')
      return jsonResponse([{ codeId: 4, value: 'Planning', label: 'Planning' }]);
    if (url === '/api/codes/AccessibilityRisk') return jsonResponse([]);
    if (url === '/api/software/owners')
      return jsonResponse([{ userId: 7, name: 'Fictional Owner' }]);
    if (url === '/api/software/12' && init?.method === 'PUT') {
      return jsonResponse(
        saveStatus === 200 ? { ...SOFTWARE, softwareName: 'Updated Planner' } : {},
        saveStatus
      );
    }
    return jsonResponse([], 404);
  });
  vi.stubGlobal('fetch', fetchMock);

  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  renderRoutes(
    [
      { path: paths.admin.software, element: <div>Software catalog list</div> },
      {
        path: '/admin/software/:softwareId/edit',
        element: (
          <QueryClientProvider client={queryClient}>
            <SoftwareEditPageView />
          </QueryClientProvider>
        ),
        handle: {
          crumb: 'Edit software',
          parent: { crumb: 'Software catalog', path: paths.admin.software },
        },
      },
    ],
    '/admin/software/12/edit'
  );

  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('software editor page', () => {
  it('loads the selected software and shows a catalog breadcrumb', async () => {
    setup();

    expect(await screen.findByRole('textbox', { name: /Software name/ })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Edit software', level: 1 })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' }).textContent).toContain(
      'Software catalog'
    );
    expect((screen.getByRole('textbox', { name: /Software name/ }) as HTMLInputElement).value).toBe(
      'Fable Planner'
    );
  });

  it('saves and returns to the catalog', async () => {
    const fetchMock = setup();
    const nameInput = await screen.findByRole('textbox', { name: /Software name/ });
    fireEvent.change(nameInput, { target: { value: 'Updated Planner' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Software catalog list')).toBeTruthy();
    const request = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(request?.[0]).toBe('/api/software/12');
    expect(JSON.parse(String(request?.[1]?.body))).toMatchObject({
      softwareName: 'Updated Planner',
      updatedAt: SOFTWARE.updatedAt,
    });
  });

  it('keeps edits on a save error and asks before discarding from the page', async () => {
    setup(403);
    const nameInput = await screen.findByRole('textbox', { name: /Software name/ });
    fireEvent.change(nameInput, { target: { value: 'Keep my edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect((await screen.findByRole('alert')).textContent).toContain(
      'no longer have administrator access'
    );
    expect((nameInput as HTMLInputElement).value).toBe('Keep my edit');

    fireEvent.click(screen.getByRole('button', { name: 'Back to software catalog' }));
    await screen.findByRole('dialog', { name: 'Discard unsaved changes?' });
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })).toBeNull()
    );
    expect(await screen.findByText('Software catalog list')).toBeTruthy();
  });
});
