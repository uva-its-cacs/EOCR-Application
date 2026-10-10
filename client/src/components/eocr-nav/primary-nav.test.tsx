// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach } from 'vitest';
import { RouterProvider, createMemoryRouter } from 'react-router';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { renderWithTheme } from 'src/test/render-with-theme';

import { NavSectionVertical } from 'src/components/nav-section';

import { PrimaryNav } from './primary-nav';
import { NAV_GROUPS, filterNavGroups } from './nav-data';

afterEach(cleanup);

function renderNav(roleCode: string | undefined, path = '/') {
  const onItemClick = vi.fn();
  const router = createMemoryRouter(
    [
      {
        path: '*',
        element: (
          <PrimaryNav groups={filterNavGroups(NAV_GROUPS, roleCode)} onItemClick={onItemClick} />
        ),
      },
    ],
    { initialEntries: [path] }
  );
  renderWithTheme(<RouterProvider router={router} />);
  return { router, onItemClick };
}

describe('PrimaryNav sections', () => {
  it('places request links under Overview and Software under Management', () => {
    renderNav('Admin');
    const overview = screen.getByRole('list', { name: 'Overview' });
    expect(
      within(overview)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['My requests', 'New request']);
    const management = screen.getByRole('list', { name: 'Management' });
    expect(
      within(management)
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Software']);
    expect(screen.getByRole('button', { name: 'Overview' }).getAttribute('aria-expanded')).toBe(
      'true'
    );
    expect(screen.getByRole('button', { name: 'Management' }).getAttribute('aria-expanded')).toBe(
      'true'
    );
    expect(screen.queryByText('Administration')).toBeNull();
  });

  it('collapses each section independently and retains focus on its header', async () => {
    renderNav('Admin');
    const overview = screen.getByRole('button', { name: 'Overview' });
    const management = screen.getByRole('button', { name: 'Management' });
    expect(overview.tagName).toBe('BUTTON');
    overview.focus();
    fireEvent.click(overview);
    expect(overview.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(overview);
    expect(
      document.getElementById(overview.getAttribute('aria-controls') ?? '')?.hasAttribute('inert')
    ).toBe(true);
    await waitFor(() => expect(screen.queryByRole('link', { name: 'My requests' })).toBeNull());
    expect(screen.getByRole('link', { name: 'Software' })).toBeTruthy();
    fireEvent.click(management);
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Software' })).toBeNull());
    fireEvent.click(overview);
    expect(screen.getByRole('link', { name: 'My requests' })).toBeTruthy();
    expect(management.getAttribute('aria-expanded')).toBe('false');
  });

  it.each(['User', 'unknown', undefined])('hides Management and Software for role %s', (role) => {
    renderNav(role);
    expect(screen.getByRole('list', { name: 'Overview' })).toBeTruthy();
    expect(screen.queryByText('Management')).toBeNull();
    expect(screen.queryByRole('link', { name: 'Software' })).toBeNull();
  });

  it('keeps the current route marked and reports navigation to the drawer', () => {
    const { onItemClick } = renderNav('Admin', '/admin/software');
    const software = screen.getByRole('link', { name: 'Software' });
    expect(software.getAttribute('aria-current')).toBe('page');
    expect(
      screen.getByRole('link', { name: 'My requests' }).getAttribute('aria-current')
    ).toBeNull();
    fireEvent.click(software);
    expect(onItemClick).toHaveBeenCalledWith('/admin/software');
  });
});

describe('purchased vertical navigation semantics', () => {
  it('uses a keyboard-focusable button for a parent and links for its children', () => {
    const router = createMemoryRouter([
      {
        path: '*',
        element: (
          <NavSectionVertical
            aria-label="Template navigation"
            data={[
              {
                items: [
                  {
                    title: 'Software',
                    path: '/software',
                    children: [{ title: 'List', path: '/software/list' }],
                  },
                ],
              },
            ]}
          />
        ),
      },
    ]);
    renderWithTheme(<RouterProvider router={router} />);
    const parent = screen.getByRole('button', { name: 'Software' });
    expect(parent.tagName).toBe('BUTTON');
    expect(parent.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('true');
    expect(document.getElementById(parent.getAttribute('aria-controls') ?? '')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'List' }).getAttribute('href')).toBe('/software/list');
  });

  it('passes disabled state to the underlying native control', () => {
    const router = createMemoryRouter([
      {
        path: '*',
        element: (
          <NavSectionVertical
            data={[
              {
                items: [
                  {
                    title: 'Unavailable',
                    path: '/software',
                    disabled: true,
                    children: [{ title: 'List', path: '/software/list' }],
                  },
                ],
              },
            ]}
          />
        ),
      },
    ]);
    renderWithTheme(<RouterProvider router={router} />);
    const parent = screen.getByRole('button', { name: 'Unavailable' }) as HTMLButtonElement;
    expect(parent.disabled).toBe(true);
    fireEvent.click(parent);
    expect(parent.getAttribute('aria-expanded')).toBe('false');
  });
});
