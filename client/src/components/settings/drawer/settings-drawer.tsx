import type { SettingsDrawerProps } from '../types';

import { useId, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import SvgIcon from '@mui/material/SvgIcon';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useColorScheme } from '@mui/material/styles';

import { themeConfig } from 'src/theme/theme-config';

import { Label } from '../../label';
import { settingIcons } from './icons';
import { Iconify } from '../../iconify';
import { BaseOption } from './base-option';
import { FontSizeOptions } from './font-options';
import { SmallBlock, LargeBlock } from './styles';
import { FONT_SIZE_RANGE } from '../settings-config';
import { NavLayoutOptions } from './nav-layout-option';
import { FullScreenButton } from './fullscreen-button';
import { useSettingsContext } from '../context/use-settings-context';

// ----------------------------------------------------------------------

/**
 * Adapted from the template's settings drawer with only the options that keep the app within WCAG AA:
 * mode, compact layout, nav layout (vertical or mini) and a larger font size. Removed: contrast,
 * right-to-left, color presets, nav color, font family and the horizontal nav. EOCR changes:
 * - The color mode is MUI's color scheme (shared with the header toggle), not a separate setting.
 * - The drawer is a dialog named by its "Settings" heading; native scrolling replaces Scrollbar.
 * - Switch cards, named nav layout buttons with aria-pressed, named reset buttons (BaseOption, styles).
 */
export function SettingsDrawer({ sx, defaultSettings }: SettingsDrawerProps) {
  const settings = useSettingsContext();
  const { mode, setMode, colorScheme } = useColorScheme();
  const titleId = useId();

  const modeChanged = mode !== undefined && mode !== themeConfig.defaultMode;
  const canReset = settings.canReset || modeChanged;

  const handleReset = useCallback(() => {
    settings.onReset();
    setMode(null);
  }, [setMode, settings]);

  const renderHead = () => (
    <Box
      sx={{
        py: 2,
        pr: 1,
        pl: 2.5,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Typography id={titleId} variant="h6" component="h2" sx={{ flexGrow: 1 }}>
        Settings
      </Typography>

      <FullScreenButton />

      <Tooltip title="Reset all">
        <IconButton aria-label="Reset all" onClick={handleReset}>
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="solar:restart-bold" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Tooltip title="Close">
        <IconButton aria-label="Close settings" onClick={settings.onCloseDrawer}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const renderMode = () => (
    <BaseOption
      label="Dark mode"
      selected={colorScheme === 'dark'}
      icon={<SvgIcon>{settingIcons.moon}</SvgIcon>}
      action={
        mode === 'system' ? (
          <Label
            sx={{
              height: 20,
              cursor: 'inherit',
              borderRadius: '20px',
              fontWeight: 'fontWeightSemiBold',
            }}
          >
            System
          </Label>
        ) : null
      }
      onChangeOption={() => {
        setMode(colorScheme === 'light' ? 'dark' : 'light');
      }}
    />
  );

  const renderCompactLayout = () => (
    <BaseOption
      label="Compact"
      description="Limits the page width on large screens."
      selected={!!settings.state.compactLayout}
      icon={<SvgIcon>{settingIcons.autofitWidth}</SvgIcon>}
      onChangeOption={() => {
        settings.setState({ compactLayout: !settings.state.compactLayout });
      }}
    />
  );

  const renderNav = () => (
    <LargeBlock title="Nav" sx={{ gap: 2.5 }}>
      <SmallBlock
        label="Layout"
        canReset={settings.state.navLayout !== defaultSettings.navLayout}
        onReset={() => {
          settings.setState({ navLayout: defaultSettings.navLayout });
        }}
      >
        <NavLayoutOptions
          value={settings.state.navLayout}
          onChangeOption={(newOption) => {
            settings.setState({ navLayout: newOption });
          }}
          options={[
            {
              label: 'Vertical',
              value: 'vertical',
              icon: <SvgIcon sx={{ width: 1, height: 'auto' }}>{settingIcons.navVertical}</SvgIcon>,
            },
            {
              label: 'Mini',
              value: 'mini',
              icon: <SvgIcon sx={{ width: 1, height: 'auto' }}>{settingIcons.navMini}</SvgIcon>,
            },
          ]}
        />
      </SmallBlock>
    </LargeBlock>
  );

  const renderFont = () => (
    <LargeBlock title="Font" sx={{ gap: 2.5 }}>
      <SmallBlock
        label="Size"
        canReset={settings.state.fontSize !== defaultSettings.fontSize}
        onReset={() => {
          settings.setState({ fontSize: defaultSettings.fontSize });
        }}
        sx={{ gap: 5 }}
      >
        <FontSizeOptions
          options={FONT_SIZE_RANGE}
          value={settings.state.fontSize}
          onChangeOption={(newOption) => {
            settings.setState({ fontSize: newOption });
          }}
        />
      </SmallBlock>
    </LargeBlock>
  );

  return (
    <Drawer
      anchor="right"
      open={settings.openDrawer}
      onClose={settings.onCloseDrawer}
      slotProps={{
        backdrop: { invisible: true },
        paper: {
          role: 'dialog',
          'aria-labelledby': titleId,
          sx: [
            (theme) => ({
              ...theme.mixins.paperStyles(theme, {
                color: varAlpha(theme.vars.palette.background.defaultChannel, 0.9),
              }),
              width: 360,
            }),
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {renderHead()}

      {/* Native scrolling replaces the template's Scrollbar (simplebar-react is not approved). */}
      <Box sx={{ flex: '1 1 auto', overflowY: 'auto' }}>
        <Box
          sx={{
            pt: 1,
            pb: 5,
            gap: 6,
            px: 2.5,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ gap: 2, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {renderMode()}
            {renderCompactLayout()}
          </Box>

          {renderNav()}
          {renderFont()}
        </Box>
      </Box>
    </Drawer>
  );
}
