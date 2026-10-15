// @vitest-environment jsdom
import { it, expect, describe, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

import { renderView } from 'src/test/render-view';

import NotFoundPage from './not-found';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('NotFound page', () => {
  it('is the template 404 view: one h1, its title, and a link home', async () => {
    renderView(<NotFoundPage />, '/no/such/page');

    const headings = await screen.findAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Sorry, page not found!');
    expect(headings[0].getAttribute('tabindex')).toBe('-1');
    expect(document.title).toBe('Page not found - EOCR');
    expect(screen.getByRole('link', { name: 'Go to home' }).getAttribute('href')).toBe('/');
  });
});
