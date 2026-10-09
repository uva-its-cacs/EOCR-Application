// @vitest-environment jsdom
import { it, expect, describe, afterEach } from 'vitest';
import { screen, cleanup } from '@testing-library/react';

import { renderView } from 'src/test/render-view';

import { NewRequestView } from 'src/sections/requests/view/new-request-view';

import NotFoundPage from './not-found';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('NotFound page', () => {
  it('has one h1, its title, and a link to My requests', async () => {
    renderView(<NotFoundPage />, '/no/such/page');

    const headings = await screen.findAllByRole('heading', { level: 1 });

    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe('Page not found');
    expect(document.title).toBe('Page not found - EOCR');
    expect(screen.getByRole('link', { name: 'Go to My requests' }).getAttribute('href')).toBe('/');
  });
});

describe('NewRequestView', () => {
  it('has one h1, the placeholder text and a link back', async () => {
    renderView(<NewRequestView />, '/requests/new');

    expect(await screen.findAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('The request form is coming soon.')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to My requests' }).getAttribute('href')).toBe(
      '/'
    );
  });
});
