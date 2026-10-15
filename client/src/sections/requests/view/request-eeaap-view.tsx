import type { RequestDetail } from '../types';

import { FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { latestReviewerMessage } from '../request-messages';
import { useRequestException } from '../use-request-exception';

// ----------------------------------------------------------------------

/**
 * The requester's EEAAP (Equally Effective Alternate Access Plan), in the intake's card layout: the
 * reviewer's message, then three required questions. "Save" keeps the answers; "Submit EEAAP" sends the
 * plan to the reviewer, who decides it with the request.
 */
type Props = {
  request: RequestDetail;
};

export function RequestEeaapView({ request }: Props) {
  const { methods, saveAnswers, submitPlan, formError, busy } = useRequestException(request);
  const message = latestReviewerMessage(request, 'AwaitingEeaap');

  return (
    <DashboardContent>
      <PageHeader
        title="Exception plan (EEAAP)"
        documentTitle={`EEAAP: ${request.title}`}
        description={`For ${request.title}. Describe how people with disabilities will get equally effective access while the software is not fully accessible.`}
      />

      <Alert
        severity="warning"
        role="note"
        sx={{ mb: 3 }}
      >
        <AlertTitle component="h2">The reviewer’s request</AlertTitle>
        {message ?? 'Explain how people will get equally effective access, then submit the plan.'}
      </Alert>

      {formError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {formError}
        </Alert>
      )}

      <FormProvider {...methods}>
        <Box
          component="form"
          noValidate
          aria-busy={busy}
          aria-label="Exception plan"
          onSubmit={(event) => {
            event.preventDefault();
            void submitPlan();
          }}
        >
          <Card>
            <Box
              component="fieldset"
              disabled={busy}
              sx={{ border: 0, m: 0, minWidth: 0, p: 3, gap: 3, display: 'grid' }}
            >
              <RHFTextField
                name="businessJustification"
                label="Business justification"
                helperText="Why your team needs this software, and why an accessible alternative will not do."
                required
                multiline
                minRows={3}
              />
              <RHFTextField
                name="accessibilityImpact"
                label="Accessibility impact"
                helperText="Who is affected by the accessibility issues, and how."
                required
                multiline
                minRows={3}
              />
              <RHFTextField
                name="mitigationPlan"
                label="Mitigation plan"
                helperText="How people will get equally effective access: who to contact, what they get, and how fast."
                required
                multiline
                minRows={4}
              />
            </Box>
          </Card>

          <Typography
            role="status"
            variant="body2"
            sx={{ mt: busy ? 2 : 0, color: 'text.secondary' }}
          >
            {busy ? 'Saving your EEAAP...' : ''}
          </Typography>

          <Box
            sx={{
              mt: 3,
              gap: 2,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            <Link
              component={RouterLink}
              href={paths.requests.details(request.requestId)}
              sx={{ mr: 'auto' }}
            >
              Back to the request
            </Link>
            <Button
              color="inherit"
              size="large"
              variant="outlined"
              aria-disabled={busy}
              onClick={() => {
                void saveAnswers();
              }}
            >
              Save
            </Button>
            <Button
              type="submit"
              size="large"
              variant="contained"
              aria-disabled={busy}
            >
              Submit EEAAP
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </DashboardContent>
  );
}
