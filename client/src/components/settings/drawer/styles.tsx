import type { ButtonBaseProps } from '@mui/material/ButtonBase';

import { useId } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import { styled } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import { Iconify } from '../../iconify';

// ----------------------------------------------------------------------

// EOCR: the reset icon is a named button ("Reset <title>"), and the hover-only info tooltip is removed
// (the template's only use is "Dashboard only"). The block is a group named by its title.
type LargeBlockProps = React.ComponentProps<typeof LargeBlockRoot> & {
  title: string;
  canReset?: boolean;
  onReset?: () => void;
};

const LargeBlockRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  position: 'relative',
  flexDirection: 'column',
  padding: theme.spacing(4, 2, 2, 2),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
}));

const LargeLabel = styled('span')(({ theme }) => ({
  top: -12,
  lineHeight: '22px',
  borderRadius: '22px',
  position: 'absolute',
  alignItems: 'center',
  display: 'inline-flex',
  padding: theme.spacing(0, 1.25),
  fontSize: theme.typography.pxToRem(13),
  color: theme.vars.palette.common.white,
  fontWeight: theme.typography.fontWeightSemiBold,
  backgroundColor: theme.vars.palette.text.primary,
  ...theme.applyStyles('dark', {
    color: theme.vars.palette.grey[800],
  }),
}));

export function LargeBlock({ sx, title, children, canReset, onReset, ...other }: LargeBlockProps) {
  const titleId = useId();

  return (
    <LargeBlockRoot role="group" aria-labelledby={titleId} sx={sx} {...other}>
      <LargeLabel>
        {canReset && (
          <ButtonBase
            disableRipple
            aria-label={`Reset ${title}`}
            onClick={onReset}
            sx={{ ml: -0.5, mr: 0.5 }}
          >
            <Iconify width={14} icon="solar:restart-bold" sx={{ opacity: 0.64 }} />
          </ButtonBase>
        )}
        <span id={titleId}>{title}</span>
      </LargeLabel>

      {children}
    </LargeBlockRoot>
  );
}

// ----------------------------------------------------------------------

type SmallBlockProps = React.ComponentProps<typeof SmallBlockRoot> & {
  label: string;
  canReset?: boolean;
  onReset?: () => void;
};

const SmallBlockRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
}));

const SmallLabel = styled(ButtonBase, {
  shouldForwardProp: (prop: string) => !['canReset', 'sx'].includes(prop),
})<{ canReset?: boolean }>(({ theme }) => ({
  cursor: 'default',
  lineHeight: '16px',
  pointerEvent: 'none',
  alignSelf: 'flex-start',
  gap: theme.spacing(0.25),
  fontSize: theme.typography.pxToRem(11),
  color: theme.vars.palette.text.secondary,
  fontWeight: theme.typography.fontWeightSemiBold,
  transition: theme.transitions.create(['color']),
  variants: [
    {
      props: { canReset: true },
      style: {
        cursor: 'pointer',
        pointerEvent: 'auto',
        color: theme.vars.palette.text.primary,
        fontWeight: theme.typography.fontWeightBold,
        '&:hover': {
          color: theme.vars.palette.primary.main,
        },
      },
    },
  ],
}));

// EOCR: the template's label is always a ButtonBase (a button that does nothing until resettable). Here
// it is plain text, and a button named "Reset <label>" only when there is something to reset. The block
// is a group named by its label.
export function SmallBlock({ label, canReset, onReset, sx, children, ...other }: SmallBlockProps) {
  const labelId = useId();

  return (
    <SmallBlockRoot role="group" aria-labelledby={labelId} sx={sx} {...other}>
      {canReset ? (
        <SmallLabel disableRipple canReset aria-label={`Reset ${label}`} onClick={onReset}>
          <Iconify width={14} icon="solar:restart-bold" />
          <span id={labelId}>{label}</span>
        </SmallLabel>
      ) : (
        <SmallLabel as="span" disableRipple id={labelId}>
          {label}
        </SmallLabel>
      )}
      {children}
    </SmallBlockRoot>
  );
}

// ----------------------------------------------------------------------

// EOCR: the selected state is exposed as aria-pressed (the template shows it visually only).
export type OptionButtonProps = ButtonBaseProps & {
  selected?: boolean;
};

export function OptionButton({ selected, sx, children, ...other }: OptionButtonProps) {
  return (
    <ButtonBase
      disableRipple
      aria-pressed={!!selected}
      sx={[
        (theme) => ({
          width: 1,
          borderRadius: 1.5,
          lineHeight: '18px',
          // EOCR: text.secondary (the template's text.disabled icons are below 3:1).
          color: 'text.secondary',
          border: `solid 1px transparent`,
          fontWeight: 'fontWeightSemiBold',
          fontSize: theme.typography.pxToRem(13),
          ...(selected && {
            color: 'text.primary',
            bgcolor: 'background.paper',
            borderColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            boxShadow: `-8px 8px 20px -4px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
            ...theme.applyStyles('dark', {
              boxShadow: `-8px 8px 20px -4px ${varAlpha(theme.vars.palette.common.blackChannel, 0.12)}`,
            }),
            '& svg': {
              color: 'primary.main',
            },
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </ButtonBase>
  );
}
