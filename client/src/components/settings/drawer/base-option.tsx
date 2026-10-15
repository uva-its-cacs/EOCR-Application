import { useId } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';

import { Iconify } from '../../iconify';
import { VisuallyHidden } from '../../visually-hidden';

// ----------------------------------------------------------------------

// EOCR: the template renders the card as a ButtonBase with a Switch inside (a control nested in a
// control). Here the card is a <label> around a real Switch: the same look, a click anywhere on the card
// still toggles it, and the switch is named by the label text. `action` is shown next to the switch
// instead of replacing it. `description` keeps the template's info icon and tooltip for pointer users
// and is also the switch's accessible description (visually hidden text), so it is not hover-only.
export type BaseOptionProps = {
  label: string;
  description?: string;
  selected: boolean;
  icon: React.ReactNode;
  action?: React.ReactNode;
  onChangeOption: () => void;
};

export function BaseOption({
  icon,
  label,
  action,
  description,
  selected,
  onChangeOption,
}: BaseOptionProps) {
  const labelId = useId();
  const descriptionId = useId();

  return (
    <ItemRoot selected={selected}>
      <TopContainer>
        <span aria-hidden>{icon}</span>
        <ActionContainer>
          {action}
          <Switch
            size="small"
            color="default"
            checked={selected}
            onChange={onChangeOption}
            slotProps={{
              input: {
                // Named by the option label only (the <label> would also include the action text).
                'aria-labelledby': labelId,
                'aria-describedby': description ? descriptionId : undefined,
              },
            }}
            sx={{ mr: -0.75 }}
          />
        </ActionContainer>
      </TopContainer>

      <BottomContainer>
        <ItemLabel id={labelId}>{label}</ItemLabel>

        {description && (
          <>
            <Tooltip
              arrow
              title={description}
              slotProps={{ tooltip: { sx: { maxWidth: 240, mr: 0.5 } } }}
            >
              <Iconify
                width={16}
                icon="eva:info-outline"
                aria-hidden
                sx={{ cursor: 'pointer', color: 'text.secondary' }}
              />
            </Tooltip>
            <VisuallyHidden id={descriptionId}>{description}</VisuallyHidden>
          </>
        )}
      </BottomContainer>
    </ItemRoot>
  );
}

// ----------------------------------------------------------------------

const ItemRoot = styled('label', {
  shouldForwardProp: (prop: string) => !['selected', 'sx'].includes(prop),
})<{ selected: boolean }>(({ selected, theme }) => ({
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: theme.spacing(2, 2, 2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 2,
  border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
  '&:hover': {
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
  },
  ...(selected && {
    backgroundColor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
  }),
}));

const TopContainer = styled('div')(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  justifyContent: 'space-between',
}));

const ActionContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const BottomContainer = styled('div')(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const ItemLabel = styled('span')(({ theme }) => ({
  lineHeight: '18px',
  fontSize: theme.typography.pxToRem(13),
  fontWeight: theme.typography.fontWeightSemiBold,
}));
