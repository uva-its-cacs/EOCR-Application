// @vitest-environment jsdom
import { it, expect, describe, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { renderWithTheme } from 'src/test/render-with-theme';

import { SplashScreen } from './splash-screen';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('SplashScreen (template, adapted)', () => {
  it('announces "Loading" and leaves nothing to tab to', () => {
    const router = createMemoryRouter([{ path: '*', element: <SplashScreen portal={false} /> }]);
    renderWithTheme(<RouterProvider router={router} />);

    const status = screen.getByRole('status');
    expect(status.textContent).toBe('Loading');
    expect(screen.queryByRole('link')).toBeNull();
    const logoLink = status.querySelector('a');
    expect(logoLink?.getAttribute('tabindex')).toBe('-1');
    expect(logoLink?.closest('[aria-hidden="true"]')).toBeTruthy();
  });
});
