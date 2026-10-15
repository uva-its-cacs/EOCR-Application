import type { Theme, SxProps } from '@mui/material/styles';
import type { Props as SimplebarProps } from 'simplebar-react';

// ----------------------------------------------------------------------

export type ScrollbarProps = SimplebarProps &
  React.ComponentProps<'div'> & {
    sx?: SxProps<Theme>;
    fillContent?: boolean;
    // EOCR: the accessible name of the scroll area. With a label the area is a focusable region (for
    // content with nothing focusable, so keyboard users can scroll it); without one it is neither a
    // region nor a tab stop (focusable content inside scrolls itself into view).
    label?: string;
    slotProps?: {
      wrapperSx?: SxProps<Theme>;
      contentSx?: SxProps<Theme>;
      contentWrapperSx?: SxProps<Theme>;
    };
  };
