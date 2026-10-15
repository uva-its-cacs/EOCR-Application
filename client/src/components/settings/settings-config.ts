import type { SettingsState } from './types';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY: string = 'app-settings';

// EOCR: font size can only grow from the default (16px is the theme's base); smaller text would be a
// readability regression, and larger text is scaled relative to the browser's own setting.
export const FONT_SIZE_RANGE: [number, number] = [16, 20];

export const defaultSettings: SettingsState = {
  navLayout: 'vertical',
  compactLayout: true,
  fontSize: 16,
  version: CONFIG.appVersion,
};
