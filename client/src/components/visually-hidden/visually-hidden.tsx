import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
  // The element to render (default span), for example 'h2' for a hidden heading.
  component?: React.ElementType;
  id?: string;
};

// Visually hidden but announced by screen readers
export function VisuallyHidden({ children, component = 'span', id }: Props) {
  return (
    <Box
      component={component}
      id={id}
      sx={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        margin: '-1px',
        padding: 0,
        border: 0,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </Box>
  );
}
