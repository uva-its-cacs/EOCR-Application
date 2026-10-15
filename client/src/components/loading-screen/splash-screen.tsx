import type { Theme, SxProps } from '@mui/material/styles';
import type { AnimateLogoProps } from '../animate';

import Portal from '@mui/material/Portal';
import { styled } from '@mui/material/styles';

import { AnimateLogoZoom } from '../animate';
import { VisuallyHidden } from '../visually-hidden';

// ----------------------------------------------------------------------

export type SplashScreenProps = React.ComponentProps<'div'> & {
  portal?: boolean;
  sx?: SxProps<Theme>;
  slots?: {
    logo?: React.ReactNode;
  };
  slotProps?: {
    wrapper?: React.ComponentProps<typeof LoadingWrapper>;
    logo?: AnimateLogoProps;
  };
};

// EOCR: the splash is a polite status announced as "Loading", and its logo (a link in the template) is
// hidden from assistive technology and out of the tab order. The logo pulses only while loading, with
// nothing else on screen (WCAG 2.2.2 covers moving content beside other content); under reduced
// motion it does not scale or rotate (MotionLazy's MotionConfig).
export function SplashScreen({ portal = true, slots, slotProps, sx, ...other }: SplashScreenProps) {
  const renderContent = (
    <LoadingWrapper {...slotProps?.wrapper}>
      <LoadingContent role="status" sx={sx} {...other}>
        <VisuallyHidden>Loading</VisuallyHidden>
        <span aria-hidden>
          {slots?.logo ?? (
            <AnimateLogoZoom
              {...slotProps?.logo}
              slotProps={{
                ...slotProps?.logo?.slotProps,
                logo: { tabIndex: -1, ...slotProps?.logo?.slotProps?.logo },
              }}
            />
          )}
        </span>
      </LoadingContent>
    </LoadingWrapper>
  );

  if (portal) {
    return <Portal>{renderContent}</Portal>;
  }

  return renderContent;
}

// ----------------------------------------------------------------------

const LoadingWrapper = styled('div')({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
});

const LoadingContent = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 9998,
  flexGrow: 1,
  width: '100%',
  height: '100%',
  display: 'flex',
  position: 'fixed',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.vars.palette.background.default,
}));
