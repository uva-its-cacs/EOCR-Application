import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = {
  targetId: string;
};

/**
 * "Skip to main content": the first focusable element on every page. Hidden off screen until it has focus.
 * It moves focus to <main> itself (not through the URL hash, which the router would see as a navigation).
 */
export function SkipLink({ targetId }: Props) {
  return (
    <Box
      component="a"
      href={`#${targetId}`}
      onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        document.getElementById(targetId)?.focus();
      }}
      sx={(theme) => ({
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: theme.zIndex.tooltip + 1,
        px: 2,
        py: 1,
        borderRadius: 1,
        typography: 'subtitle2',
        textDecoration: 'none',
        color: theme.vars.palette.primary.contrastText,
        backgroundColor: theme.vars.palette.primary.main,
        transform: 'translateY(-200%)',
        '&:focus': { transform: 'none' },
      })}
    >
      Skip to main content
    </Box>
  );
}
