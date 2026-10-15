import { screen, cleanup } from '@testing-library/react';
// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach } from 'vitest';

import { ok, mockFetch, renderView } from 'src/test/render-view';

import { RequireAdmin } from './require-admin';

// ----------------------------------------------------------------------

const ME = { userId: 1, name: 'Dana Example', email: 'dana@example.com', roleLabel: 'User' };

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('RequireAdmin', () => {
  it('shows the template 403 view to a User: one h1, a title, and a link home', async () => {
    mockFetch(ok({ ...ME, roleCode: 'User' }));
    renderView(<RequireAdmin />);

    const heading = await screen.findByRole('heading', {
      level: 1,
      name: 'You do not have access to this page',
    });
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(document.title).toBe('No access - EOCR');
    expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
  });
});
