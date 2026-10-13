// @vitest-environment jsdom
import type { Software } from '../types';

import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { renderView, jsonResponse } from 'src/test/render-view';

import { SoftwareView } from './software-view';

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

function setup(
  saveResponse: (input: RequestInit) => Promise<Response> = async () =>
    jsonResponse({ ...SOFTWARE, softwareName: 'Updated Planner' })
) {
  let updated = false;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      const response = await saveResponse(init);
      updated = response.ok;
      return response;
    }
    if (url === '/api/software')
      return jsonResponse([
        { ...SOFTWARE, softwareName: updated ? 'Updated Planner' : SOFTWARE.softwareName },
      ]);
    if (url === '/api/codes/ApprovalStatus')
      return jsonResponse([{ codeId: 5, value: 'Approved', label: 'Approved' }]);
    if (url === '/api/codes/SoftwareCategory')
      return jsonResponse([{ codeId: 4, value: 'Planning', label: 'Planning' }]);
    if (url === '/api/software/owners')
      return jsonResponse([{ userId: 7, name: 'Fictional Owner' }]);
    return jsonResponse([]);
  });
  vi.stubGlobal('fetch', fetchMock);
  renderView(<SoftwareView />);
  return fetchMock;
}

async function openEditor() {
  const trigger = await screen.findByRole('button', { name: 'Edit Fable Planner' });
  trigger.focus();
  fireEvent.click(trigger);
  const drawer = await screen.findByRole('dialog', { name: 'Edit software' });
  await within(drawer).findByRole('textbox', { name: /Software name/ });
  return { trigger, drawer };
}

const nameInput = () => screen.getByRole('textbox', { name: /Software name/ });
const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('software drawer editing', () => {
  it('blocks saving until editing options load and supports retry', async () => {
    const fetchMock = setup();
    await screen.findByRole('button', { name: 'Edit Fable Planner' });
    fetchMock.mockImplementationOnce(async () => jsonResponse({}, 500));
    fireEvent.click(screen.getByRole('button', { name: 'Edit Fable Planner' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Editing options could not be loaded.');
    expect(
      (screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).disabled
    ).toBe(true);
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    await screen.findByRole('textbox', { name: /Software name/ });
    expect(
      (screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement).disabled
    ).toBe(false);
  });

  it('retains the form when administrator access is denied during saving', async () => {
    setup(async () => jsonResponse({}, 403));
    await openEditor();
    fireEvent.change(nameInput(), { target: { value: 'Keep my edit' } });
    save();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'no longer have administrator access'
    );
    expect((nameInput() as HTMLInputElement).value).toBe('Keep my edit');
  });

  it('prefills the form and preserves a current inactive category', async () => {
    setup();
    await openEditor();
    expect((nameInput() as HTMLInputElement).value).toBe('Fable Planner');
    expect(screen.getByRole('combobox', { name: /Category/ }).textContent).toContain(
      'Archived category (current)'
    );
    expect(screen.getByRole('combobox', { name: /Business owner/ })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /Vendor name/ }).getAttribute('autocomplete')).toBe(
      'organization'
    );
  });

  it('saves through the API with the original concurrency token, refreshes rows, and restores focus', async () => {
    const fetchMock = setup();
    await openEditor();
    fireEvent.change(nameInput(), { target: { value: ' Updated Planner ' } });
    save();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    const request = fetchMock.mock.calls.find(([, init]) => init?.method === 'PUT');
    expect(request?.[0]).toBe('/api/software/12');
    expect(JSON.parse(String(request?.[1]?.body))).toMatchObject({
      softwareName: 'Updated Planner',
      updatedAt: SOFTWARE.updatedAt,
      softwareCategoryId: 90,
      publisherWebsite: null,
    });
    await screen.findByRole('button', { name: 'Edit Updated Planner' });
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Edit Updated Planner' })
      )
    );
    expect(screen.getByText('Software changes saved.')).toBeTruthy();
  });

  it('announces validation, describes the invalid input, and focuses it without submitting', async () => {
    const fetchMock = setup();
    await openEditor();
    fireEvent.change(nameInput(), { target: { value: '' } });
    save();
    await screen.findByText('Enter a software name.');
    expect(nameInput().getAttribute('aria-invalid')).toBe('true');
    expect(
      document.getElementById(nameInput().getAttribute('aria-describedby') ?? '')?.textContent
    ).toContain('Enter a software name.');
    await waitFor(() => expect(document.activeElement).toBe(nameInput()));
    expect(screen.getByRole('alert').textContent).toContain('Check the highlighted fields');
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('retains edits and explains a concurrency conflict', async () => {
    setup(async () => jsonResponse({ title: 'Changed by another administrator.' }, 409));
    await openEditor();
    fireEvent.change(nameInput(), { target: { value: 'My unsaved change' } });
    save();
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Another administrator changed this software'
    );
    expect((nameInput() as HTMLInputElement).value).toBe('My unsaved change');
    expect(screen.getByRole('dialog', { name: 'Edit software' })).toBeTruthy();
  });

  it('ties server select errors to the combobox and focuses it', async () => {
    setup(async () =>
      jsonResponse({ errors: { CurrentApprovalStatusId: ['Select an active status.'] } }, 400)
    );
    await openEditor();
    save();
    await screen.findByText('Select an active status.');
    const select = screen.getByRole('combobox', { name: /Approval status/ });
    expect(select.getAttribute('aria-invalid')).toBe('true');
    expect(
      document.getElementById(select.getAttribute('aria-describedby') ?? '')?.textContent
    ).toContain('Select an active status.');
    await waitFor(() => expect(document.activeElement).toBe(select));
  });

  it('protects unsaved changes and lets the administrator keep or discard them', async () => {
    const fetchMock = setup();
    const { trigger } = await openEditor();
    fireEvent.change(nameInput(), { target: { value: 'Unsaved' } });
    fireEvent.click(screen.getByRole('button', { name: 'Close software editor' }));
    let confirm = await screen.findByRole('dialog', { name: 'Discard unsaved changes?' });
    expect(document.activeElement).toBe(within(confirm).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(within(confirm).getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Discard unsaved changes?' })).toBeNull()
    );
    expect((nameInput() as HTMLInputElement).value).toBe('Unsaved');
    fireEvent.click(screen.getByRole('button', { name: 'Close software editor' }));
    confirm = await screen.findByRole('dialog', { name: 'Discard unsaved changes?' });
    fireEvent.click(within(confirm).getByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false);
  });

  it('prevents duplicate submissions and closing while a save is pending', async () => {
    let release: (response: Response) => void = () => {};
    const fetchMock = setup(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        })
    );
    await openEditor();
    save();
    const saving = await screen.findByRole('button', { name: 'Saving...' });
    fireEvent.click(saving);
    fireEvent.click(screen.getByRole('button', { name: 'Close software editor' }));
    expect(screen.getByRole('dialog', { name: 'Edit software' })).toBeTruthy();
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')).toHaveLength(1);
    release(jsonResponse(SOFTWARE));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});
