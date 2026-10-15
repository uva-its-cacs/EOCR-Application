import type { Theme, SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

// EOCR: only the options that cannot break WCAG AA are kept (see settings-config.ts). The template's
// contrast, primaryColor, navColor, direction and fontFamily settings are removed, and navLayout has no
// 'horizontal' option. The color mode stays with MUI's color scheme (useColorScheme), not in settings.
export type SettingsState = {
  version: string;
  fontSize: number;
  compactLayout: boolean;
  navLayout: 'vertical' | 'mini';
};

export type SettingsContextValue = {
  state: SettingsState;
  canReset: boolean;
  onReset: () => void;
  setState: (updateValue: Partial<SettingsState>) => void;
  setField: (name: keyof SettingsState, updateValue: SettingsState[keyof SettingsState]) => void;
  // Drawer
  openDrawer: boolean;
  onCloseDrawer: () => void;
  onToggleDrawer: () => void;
};

export type SettingsProviderProps = {
  defaultSettings: SettingsState;
  children: React.ReactNode;
  storageKey?: string;
};

export type SettingsDrawerProps = {
  sx?: SxProps<Theme>;
  defaultSettings: SettingsState;
};
