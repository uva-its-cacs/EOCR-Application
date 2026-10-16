// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { renderView, jsonResponse } from 'src/test/render-view';
import { AccountPopover } from 'src/layouts/components/account-popover';

// ----------------------------------------------------------------------

const DANA = {
  userId: 1,
  name: 'Dana Example',
  email: 'dana@example.com',
  roleCode: 'User',
  roleLabel: 'User',
};
const ADMIN = {
  userId: 3,
  name: 'Admin Example',
  email: 'admin@example.com',
  roleCode: 'Admin',
  roleLabel: 'Admin',
};

type Call = { url: string; method: string; body: unknown };

// The server's dev switch: /api/me answers as whoever was chosen last.
function mockDevApi() {
  let me = DANA;
  const calls: Call[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const body = init?.body ? JSON.parse(String(init.body)) : null;
      calls.push({ url, method, body });
      if (url === '/api/me') return jsonResponse(me);
      if (url === '/api/dev/users') return jsonResponse([DANA, ADMIN]);
      if (url === '/api/dev/users/switch' && method === 'POST') {
        me = body.email === ADMIN.email ? ADMIN : DANA;
        return new Response(null, { status: 204 });
      }
      if (url === '/api/dev/users/switch' && method === 'DELETE') {
        me = DANA;
        return new Response(null, { status: 204 });
      }
      return jsonResponse({}, 404);
    })
  );
  return calls;
}

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
  vi.unstubAllEnvs();
});

const openSwitcher = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Account' }));
  const dialog = await screen.findByRole('dialog', { name: 'Account' });
  return within(dialog).findByRole('region', { name: 'Development: view as' });
};

describe('DevUserSwitcher (development builds)', () => {
  it('lists the seeded users with their roles and marks the current one', async () => {
    mockDevApi();
    renderView(<AccountPopover />);

    const switcher = await openSwitcher();
    const current = await within(switcher).findByRole('button', {
      name: /Dana Example \(current\)/,
    });
    expect(current.getAttribute('aria-pressed')).toBe('true');
    const admin = within(switcher).getByRole('button', { name: /Admin Example/ });
    expect(admin.getAttribute('aria-pressed')).toBe('false');
    expect(admin.textContent).toContain('Admin, admin@example.com');
  });

  it('switches to another user, then reloads the current user', async () => {
    const calls = mockDevApi();
    renderView(<AccountPopover />);

    const switcher = await openSwitcher();
    fireEvent.click(await within(switcher).findByRole('button', { name: /Admin Example/ }));

    await waitFor(() =>
      expect(
        calls.some((call) => call.method === 'POST' && call.url === '/api/dev/users/switch')
      ).toBe(true)
    );
    expect(calls.find((call) => call.method === 'POST')?.body).toEqual({
      email: 'admin@example.com',
    });
    // /api/me is asked again after the switch.
    await waitFor(() => {
      const switchAt = calls.findIndex((call) => call.method === 'POST');
      expect(calls.slice(switchAt).some((call) => call.url === '/api/me')).toBe(true);
    });
    expect(await screen.findByText('Now viewing as Admin Example (Admin).')).toBeTruthy();
  });

  it('is not shown in production builds', async () => {
    vi.stubEnv('DEV', false);
    mockDevApi();
    renderView(<AccountPopover />);

    fireEvent.click(screen.getByRole('button', { name: 'Account' }));
    const dialog = await screen.findByRole('dialog', { name: 'Account' });
    await within(dialog).findByText('Dana Example');
    expect(within(dialog).queryByRole('region', { name: 'Development: view as' })).toBeNull();
  });
});
