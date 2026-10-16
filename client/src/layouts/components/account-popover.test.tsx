// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { renderView, jsonResponse } from 'src/test/render-view';

import { AccountPopover } from './account-popover';

// ----------------------------------------------------------------------

const ME = {
  userId: 1,
  name: 'Dana Example',
  email: 'dana.example.long.address@example.com',
  roleCode: 'User',
  roleLabel: 'User',
};

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

describe('AccountPopover (template popover fed by /api/me)', () => {
  it('opens a dialog named Account with the full name, email, role and links', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) =>
        url === '/api/me' ? jsonResponse(ME) : jsonResponse(url === '/api/dev/users' ? [] : {}, 404)
      )
    );
    renderView(<AccountPopover data={[{ label: 'My requests', href: '/requests' }]} />);

    const button = screen.getByRole('button', { name: 'Account' });
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(await screen.findByText('D')).toBeTruthy();

    fireEvent.click(button);

    const dialog = await screen.findByRole('dialog', { name: 'Account' });
    expect(within(dialog).getByText('Dana Example')).toBeTruthy();
    expect(within(dialog).getByText('dana.example.long.address@example.com')).toBeTruthy();
    expect(within(dialog).getByText('User')).toBeTruthy();
    expect(within(dialog).getByRole('menuitem', { name: 'My requests' }).getAttribute('href')).toBe(
      '/requests'
    );
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
