import type { StepperProps } from '@mui/material/Stepper';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Stepper from '@mui/material/Stepper';
import { styled } from '@mui/material/styles';
import StepLabel, { stepLabelClasses } from '@mui/material/StepLabel';
import MuiStepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';

import { Iconify } from 'src/components/iconify';
import { VisuallyHidden } from 'src/components/visually-hidden';

// ----------------------------------------------------------------------

// Adapted from the template's sections/checkout/checkout-steps.tsx. EOCR changes: the stepper is an
// ordered list named "Request steps" with the current step marked aria-current="step"; completed and
// upcoming steps say so in visually hidden text; the icons are decorative; upcoming dots use
// text.secondary (the template's text.disabled is below 3:1). Steps are not clickable (Back and Next
// buttons move between them).
type Props = StepperProps & {
  steps: string[];
  activeStep: number;
};

export function RequestIntakeSteps({ steps, activeStep, sx, ...other }: Props) {
  return (
    <Stepper
      component="ol"
      aria-label="Request steps"
      alternativeLabel
      activeStep={activeStep}
      connector={<StepConnector aria-hidden />}
      sx={[{ mb: { xs: 3, md: 5 }, p: 0, listStyle: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}
    >
      {steps.map((label, index) => (
        <Step
          key={label}
          component="li"
          aria-current={index === activeStep ? 'step' : undefined}
        >
          <StepLabel
            slots={{ stepIcon: StepIcon }}
            sx={{ [`& .${stepLabelClasses.label}`]: { fontWeight: 'fontWeightSemiBold' } }}
          >
            {label}
            {index < activeStep && <VisuallyHidden> (completed)</VisuallyHidden>}
            {index === activeStep && <VisuallyHidden> (current step)</VisuallyHidden>}
          </StepLabel>
        </Step>
      ))}
    </Stepper>
  );
}

// ----------------------------------------------------------------------

const StepConnector = styled(MuiStepConnector)(({ theme }) => ({
  top: 10,
  left: 'calc(-50% + 20px)',
  right: 'calc(50% + 20px)',
  [`& .${stepConnectorClasses.line}`]: {
    borderTopWidth: 2,
    borderColor: theme.vars.palette.divider,
  },
  [`&.${stepConnectorClasses.active}, &.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: { borderColor: theme.vars.palette.primary.main },
  },
}));

type StepIconProps = {
  active?: boolean;
  completed?: boolean;
};

function StepIcon({ active, completed }: StepIconProps) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        color: 'text.secondary',
        justifyContent: 'center',
        ...(active && { color: 'primary.main' }),
      }}
    >
      {completed ? (
        <Iconify
          icon="eva:checkmark-fill"
          sx={{ color: 'primary.main' }}
        />
      ) : (
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      )}
    </Box>
  );
}
