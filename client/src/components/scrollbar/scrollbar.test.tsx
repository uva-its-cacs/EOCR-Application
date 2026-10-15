import { screen, within, cleanup } from '@testing-library/react';
// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { renderWithTheme } from 'src/test/render-with-theme';

import { Scrollbar } from './scrollbar';

// ----------------------------------------------------------------------

// jsdom has no ResizeObserver (simplebar measures its content with one).
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

describe('Scrollbar (template simplebar wrapper)', () => {
  it('is a named, focusable region when it has a label', () => {
    renderWithTheme(
      <Scrollbar label="Summary">
        <p>Content</p>
      </Scrollbar>
    );

    const region = screen.getByRole('region', { name: 'Summary' });
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.textContent).toContain('Content');
  });

  it('adds no region and no tab stop without a label', () => {
    const { container } = renderWithTheme(
      <Scrollbar>
        <a href="/x">A link</a>
      </Scrollbar>
    );

    // (The toaster's own "Notifications" region is outside the component.)
    expect(within(container).queryByRole('region')).toBeNull();
    expect(container.querySelector('[aria-label="scrollable content"]')).toBeNull();
    expect(container.querySelector('.simplebar-content-wrapper')?.hasAttribute('tabindex')).toBe(
      false
    );
  });

  it('forwards the scroll node to a ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    renderWithTheme(
      <Scrollbar ref={ref}>
        <p>Content</p>
      </Scrollbar>
    );

    expect(ref.current?.classList.contains('simplebar-content-wrapper')).toBe(true);
  });
});
