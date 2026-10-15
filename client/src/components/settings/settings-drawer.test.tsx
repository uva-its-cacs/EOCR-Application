// @vitest-environment jsdom
import { it, expect, describe, afterEach, beforeEach } from 'vitest';
import { screen, within, cleanup, fireEvent } from '@testing-library/react';

import { renderWithTheme } from 'src/test/render-with-theme';
import { applySettingsToComponents } from 'src/theme/with-settings';
import { SettingsButton } from 'src/layouts/components/settings-button';

import { SettingsDrawer, defaultSettings, SettingsProvider } from '.';

// ----------------------------------------------------------------------

function renderDrawer() {
  return renderWithTheme(
    <SettingsProvider defaultSettings={defaultSettings}>
      <SettingsButton />
      <SettingsDrawer defaultSettings={defaultSettings} />
    </SettingsProvider>
  );
}

async function openDrawer() {
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  return screen.findByRole('dialog', { name: 'Settings' });
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('SettingsDrawer (safe options only)', () => {
  it('opens from the Settings button as a dialog named by its heading', async () => {
    renderDrawer();
    const button = screen.getByRole('button', { name: 'Settings' });
    expect(button.getAttribute('aria-haspopup')).toBe('dialog');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    const dialog = await openDrawer();
    expect(within(dialog).getByRole('heading', { name: 'Settings' })).toBeTruthy();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('offers only mode, compact, nav layout and font size', async () => {
    renderDrawer();
    const dialog = await openDrawer();

    expect(within(dialog).getByRole('switch', { name: 'Dark mode' })).toBeTruthy();
    const compact = within(dialog).getByRole('switch', { name: 'Compact' });
    expect(compact.getAttribute('aria-describedby')).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Vertical' })).toBeTruthy();
    expect(within(dialog).getByRole('button', { name: 'Mini' })).toBeTruthy();
    expect(within(dialog).getByRole('slider', { name: 'Font size' })).toBeTruthy();

    for (const removed of ['Contrast', 'Right to left', 'Presets', 'Family', 'Horizontal']) {
      expect(within(dialog).queryByText(removed)).toBeNull();
    }
  });

  it('toggles compact and the nav layout, exposing their state, and resets them', async () => {
    renderDrawer();
    const dialog = await openDrawer();

    const compact = within(dialog).getByRole('switch', { name: 'Compact' }) as HTMLInputElement;
    expect(compact.checked).toBe(true);
    fireEvent.click(compact);
    expect(compact.checked).toBe(false);

    const mini = within(dialog).getByRole('button', { name: 'Mini' });
    expect(mini.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(mini);
    expect(mini.getAttribute('aria-pressed')).toBe('true');
    expect(within(dialog).getByRole('button', { name: 'Reset Layout' })).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Reset all' }));
    expect(compact.checked).toBe(true);
    expect(mini.getAttribute('aria-pressed')).toBe('false');
  });

  it('only lets the font size grow, and speaks it in px', async () => {
    renderDrawer();
    const dialog = await openDrawer();

    const slider = within(dialog).getByRole('slider', { name: 'Font size' });
    expect(slider.getAttribute('aria-valuemin')).toBe('16');
    expect(slider.getAttribute('aria-valuemax')).toBe('20');
    expect(slider.getAttribute('aria-valuetext')).toBe('16px');
  });
});

describe('applySettingsToComponents', () => {
  it('sets nothing at the default size and scales the browser size otherwise', () => {
    expect(applySettingsToComponents({ ...defaultSettings, fontSize: 16 })).toBeNull();
    expect(applySettingsToComponents({ ...defaultSettings, fontSize: 20 })).toEqual({
      html: { fontSize: '125%' },
    });
  });
});
