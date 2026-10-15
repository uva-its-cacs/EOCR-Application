import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

/**
 * The centered column of the template's error pages (layouts/simple/content.tsx, SimpleCompactContent:
 * 448px wide, centered text, 80px vertical padding from md up), with the views' Container inside. EOCR renders these pages inside its own
 * layout, so the template's SimpleLayout (header with the settings button) is not used.
 */
export function ErrorContent({ sx, children, ...other }: BoxProps) {
  return (
    <Box
      sx={[
        (theme) => ({
          width: 1,
          mx: 'auto',
          display: 'flex',
          flex: '1 1 auto',
          textAlign: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 448,
          p: theme.spacing(3, 2, 10, 2),
          [theme.breakpoints.up('md')]: {
            justifyContent: 'center',
            p: theme.spacing(10, 0, 10, 0),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* As the template's views: a MotionContainer (staggers the bounce-in) inside the column. */}
      <Container
        component={MotionContainer}
        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        {children}
      </Container>
    </Box>
  );
}
