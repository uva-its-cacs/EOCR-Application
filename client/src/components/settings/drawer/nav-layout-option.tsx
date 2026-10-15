import type { BoxProps } from '@mui/material/Box';
import type { SettingsState } from '../types';

import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';

import { OptionButton } from './styles';

// ----------------------------------------------------------------------

// EOCR: each option has a `label` (its accessible name; the template's options are icon-only), and
// NavColorOptions is removed with the nav color setting.
export type NavLayoutOptionProps = BoxProps & {
  value: SettingsState['navLayout'];
  options: {
    label: string;
    value: SettingsState['navLayout'];
    icon: React.ReactNode;
  }[];
  onChangeOption: (newOption: SettingsState['navLayout']) => void;
};

export function NavLayoutOptions({
  sx,
  value,
  options,
  onChangeOption,
  ...other
}: NavLayoutOptionProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: 'grid',
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            aria-label={option.label}
            onClick={() => onChangeOption(option.value)}
            sx={[
              (theme) => ({
                height: 64,
                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {option.icon}
          </OptionButton>
        );
      })}
    </Box>
  );
}
