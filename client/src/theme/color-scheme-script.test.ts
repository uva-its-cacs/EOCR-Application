import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { it, expect, describe } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

import { themeConfig } from './theme-config';

// ----------------------------------------------------------------------

/**
 * index.html carries an inline copy of MUI's InitColorSchemeScript so a reload in dark mode does not paint
 * light first (the app is client-rendered, so MUI's component would run too late). This test renders MUI's
 * component with our theme config and requires the inline copy to match it exactly, so an MUI upgrade or a
 * config change cannot drift silently. If it fails, paste the new rendered script into index.html.
 */
const SCRIPT = /<script>([\s\S]*?)<\/script>/;

function scriptBody(html: string): string {
  const match = html.match(SCRIPT);
  if (!match) throw new Error('No inline <script> found');
  return match[1].replace(/\r\n/g, '\n').trim();
}

describe('no-flash color scheme script in index.html', () => {
  const expected = renderToStaticMarkup(
    createElement(InitColorSchemeScript, {
      attribute: themeConfig.cssVariables.colorSchemeSelector,
      modeStorageKey: themeConfig.modeStorageKey,
      defaultMode: themeConfig.defaultMode,
    })
  );
  const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

  it('matches what MUI InitColorSchemeScript renders for our config', () => {
    expect(scriptBody(indexHtml)).toBe(scriptBody(expected));
  });

  it('uses our attribute, storage key and default mode', () => {
    const body = scriptBody(indexHtml);
    expect(body).toContain("setAttribute('data-color-scheme'");
    expect(body).toContain("localStorage.getItem('theme-mode') || 'light'");
  });
});
