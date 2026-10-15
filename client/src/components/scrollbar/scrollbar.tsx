import type { ScrollbarProps } from './types';

import { useCallback } from 'react';
import SimpleBar from 'simplebar-react';
import { mergeClasses } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';

import { scrollbarClasses } from './classes';

// ----------------------------------------------------------------------

export function Scrollbar({
  sx,
  ref,
  children,
  className,
  slotProps,
  label,
  fillContent = true,
  scrollableNodeProps,
  ...other
}: ScrollbarProps) {
  // EOCR: simplebar always makes the scroll node a region named "scrollable content" in the tab order.
  // Without a label, those attributes are removed once the node mounts (React does not set them again
  // while the props are unchanged). One callback ref also forwards the node to the caller's ref.
  const scrollableRef = useCallback(
    (node: HTMLElement | null) => {
      if (node && !label) {
        node.removeAttribute('role');
        node.removeAttribute('aria-label');
        node.removeAttribute('tabindex');
      }
      if (typeof ref === 'function') ref(node as HTMLDivElement | null);
      else if (ref) ref.current = node as HTMLDivElement | null;
    },
    [label, ref]
  );

  return (
    <ScrollbarRoot
      // EOCR: the caller's scrollableNodeProps are kept (the template replaces them with the ref).
      scrollableNodeProps={{ ...scrollableNodeProps, ref: scrollableRef }}
      ariaLabel={label}
      clickOnTrack={false}
      fillContent={fillContent}
      className={mergeClasses([scrollbarClasses.root, className])}
      sx={[
        {
          '& .simplebar-wrapper': slotProps?.wrapperSx as React.CSSProperties,
          '& .simplebar-content-wrapper': slotProps?.contentWrapperSx as React.CSSProperties,
          '& .simplebar-content': slotProps?.contentSx as React.CSSProperties,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </ScrollbarRoot>
  );
}

// ----------------------------------------------------------------------

const ScrollbarRoot = styled(SimpleBar, {
  shouldForwardProp: (prop: string) => !['fillContent', 'sx'].includes(prop),
})<Pick<ScrollbarProps, 'fillContent'>>(({ fillContent }) => ({
  minWidth: 0,
  minHeight: 0,
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  ...(fillContent && {
    '& .simplebar-content': {
      display: 'flex',
      flex: '1 1 auto',
      minHeight: '100%',
      flexDirection: 'column',
    },
  }),
}));
