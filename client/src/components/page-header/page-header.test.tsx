// @vitest-environment jsdom
import { Outlet } from 'react-router';
import { it, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';

import { renderRoutes } from 'src/test/render-with-theme';

import { PageHeader } from './page-header';

// ----------------------------------------------------------------------

// The same handle shape as routes/sections/eocr.tsx.
const routes = [
  {
    element: <Outlet />,
    children: [
      {
        index: true,
        handle: { crumb: 'My requests' },
        element: <PageHeader title="My requests" description="Your software requests." />,
      },
      {
        path: 'requests/new',
        handle: { crumb: 'New request', parent: { crumb: 'My requests', path: '/' } },
        element: <PageHeader title="New request" documentTitle="Request software" />,
      },
    ],
  },
];

afterEach(cleanup);

describe('PageHeader', () => {
  it('renders the only h1, focusable by script but not in the tab order', async () => {
    renderRoutes(routes, '/');

    const heading = await screen.findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('My requests');
    expect(heading.getAttribute('tabindex')).toBe('-1');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByText('Your software requests.')).toBeTruthy();
  });

  it('sets the document title from the title', async () => {
    renderRoutes(routes, '/');
    await screen.findByRole('heading', { level: 1 });

    expect(document.title).toBe('My requests - EOCR');
  });

  it('prefers documentTitle for the document title', async () => {
    renderRoutes(routes, '/requests/new');
    await screen.findByRole('heading', { level: 1 });

    expect(document.title).toBe('Request software - EOCR');
  });

  it('renders no breadcrumbs when the trail has a single crumb', async () => {
    renderRoutes(routes, '/');
    await screen.findByRole('heading', { level: 1 });

    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).toBeNull();
  });

  it('links the parent crumb and marks the current crumb with aria-current', async () => {
    renderRoutes(routes, '/requests/new');

    const nav = await screen.findByRole('navigation', { name: 'Breadcrumb' });
    const parent = within(nav).getByRole('link', { name: 'My requests' });
    const current = within(nav).getByText('New request');

    expect(parent.getAttribute('href')).toBe('/');
    expect(current.getAttribute('aria-current')).toBe('page');
    expect(current.closest('a')).toBeNull();
    expect(within(nav).getAllByRole('link')).toHaveLength(1);
  });
});
