// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router';

import { EocrErrorBoundary } from './eocr-error-boundary';

// ----------------------------------------------------------------------

function Broken(): React.ReactNode {
  throw new Error('Secret internal detail');
}

function renderBroken() {
  const router = createMemoryRouter(
    [{ path: '/', element: <Broken />, errorElement: <EocrErrorBoundary /> }],
    { initialEntries: ['/'] }
  );
  return render(<RouterProvider router={router} />);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('EocrErrorBoundary', () => {
  it('renders one focused h1 in a main landmark, Reload and a link home, and logs the error', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderBroken();

    const heading = await screen.findByRole('heading', { level: 1 });

    expect(heading.textContent).toBe('Something went wrong');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('main').id).toBe('main-content');
    expect(document.activeElement).toBe(heading);
    expect(document.title).toBe('Something went wrong - EOCR');
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Go to My requests' }).getAttribute('href')).toBe('/');
    expect(consoleError.mock.calls.some((args) => args[0] instanceof Error)).toBe(true);
  });

  it('never renders a stack trace', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderBroken();
    await screen.findByRole('heading', { level: 1 });

    expect(document.body.textContent).not.toMatch(/\bat \w+ \(|eocr-error-boundary\.test/);
    expect(document.querySelector('pre')).toBeNull();
  });
});
