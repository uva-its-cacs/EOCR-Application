import type { RequestDetail } from '../types';
import type { SoftwareCatalogItem } from 'src/sections/software/types';

import { FormProvider } from 'react-hook-form';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import AlertTitle from '@mui/material/AlertTitle';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page-header';

import { useRequestIntake } from '../use-request-intake';
import { latestReviewerMessage } from '../request-messages';
import { RequestIntakeSteps } from '../request-intake-steps';
import { requestSubmitSchema } from '../request-intake-schema';
import { RequestIntakeReviewStep } from '../request-intake-review-step';
import { RequestIntakeDetailsStep } from '../request-intake-details-step';
import { RequestIntakeCatalogStep } from '../request-intake-catalog-step';

// ----------------------------------------------------------------------

const STEPS = ['Check the catalog', 'Request details', 'Review and submit'];

type PendingAction = 'save' | 'submit' | null;

/**
 * The request intake (workflow: check the catalog, gather the request, save in progress, submit), on the
 * template's checkout stepper. A new request starts at the catalog check; a draft opens at the details.
 * A request the reviewer sent back ("More info needed") opens the same way, shows the reviewer's message,
 * and is resubmitted to the reviewer.
 */
type Props = {
  draft: RequestDetail | null;
};

export function RequestIntakeView({ draft }: Props) {
  const { methods, saveDraft, submitForReview, formError, busy, request } = useRequestIntake(draft);
  const [activeStep, setActiveStep] = useState(draft ? 1 : 0);
  const [linkedSoftware, setLinkedSoftware] = useState<string | null>(null);
  // A save or submit to run once the details step is shown (a ref: it does not affect rendering).
  const pending = useRef<PendingAction>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Focus the step heading when the step changes (not on the first render; route focus handles that).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [activeStep]);

  // A save or submit started on the review step runs once the details step (with the fields) is shown,
  // so errors can focus the first invalid field.
  useEffect(() => {
    if (activeStep !== 1 || pending.current === null) return;
    const action = pending.current === 'save' ? saveDraft : submitForReview;
    pending.current = null;
    void action();
  }, [activeStep, saveDraft, submitForReview]);

  const run = (action: 'save' | 'submit') => {
    const values = methods.getValues();
    const invalid =
      action === 'submit'
        ? !requestSubmitSchema.safeParse(values).success
        : !values.softwareName.trim();
    if (activeStep !== 1 && invalid) {
      pending.current = action;
      setActiveStep(1);
      return;
    }
    void (action === 'save' ? saveDraft() : submitForReview());
  };

  // A catalog version links the request to it; a different version prefills only the product.
  const chooseSoftware = (software: SoftwareCatalogItem | null, sameVersion: boolean) => {
    const linked = software && sameVersion ? software : null;
    methods.setValue('softwareId', linked?.softwareId ?? null, { shouldDirty: true });
    if (software) {
      methods.setValue('softwareName', software.softwareName, { shouldDirty: true });
      methods.setValue('vendor', software.vendorName, { shouldDirty: true });
      methods.setValue('version', sameVersion ? software.version : '', { shouldDirty: true });
    }
    setLinkedSoftware(
      software
        ? sameVersion
          ? `This request is for ${software.softwareName} ${software.version}, from the software catalog.`
          : `This request is for a new version of ${software.softwareName}. Enter the version you need.`
        : null
    );
    setActiveStep(1);
  };

  const isResubmit = draft?.statusCode === 'MoreInfoNeeded';
  const title = isResubmit
    ? 'Update your request'
    : draft
      ? 'Continue your request'
      : 'New request';
  const documentTitle = isResubmit
    ? `Update request: ${draft.softwareName}`
    : draft
      ? `Continue request: ${draft.softwareName}`
      : 'Request software';
  const reviewerMessage = isResubmit ? latestReviewerMessage(draft) : null;

  return (
    <DashboardContent>
      <PageHeader
        title={title}
        documentTitle={documentTitle}
      />

      {isResubmit && (
        <Alert
          severity="warning"
          role="note"
          sx={{ mb: 3 }}
        >
          <AlertTitle component="h2">The reviewer needs more information</AlertTitle>
          {reviewerMessage ?? 'Update your request and send it back for review.'}
        </Alert>
      )}

      <RequestIntakeSteps
        steps={STEPS}
        activeStep={activeStep}
      />

      <Typography
        ref={headingRef}
        tabIndex={-1}
        variant="h6"
        component="h2"
        sx={{ mb: 2, outline: 'none' }}
      >
        Step {activeStep + 1} of {STEPS.length}: {STEPS[activeStep]}
      </Typography>

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
          onSubmit={(event) => {
            event.preventDefault();
            run(activeStep === 2 ? 'submit' : 'save');
          }}
        >
          {activeStep === 0 && <RequestIntakeCatalogStep onChoose={chooseSoftware} />}
          {activeStep === 1 && (
            <RequestIntakeDetailsStep
              busy={busy}
              linkedSoftwareName={linkedSoftware}
            />
          )}
          {activeStep === 2 && <RequestIntakeReviewStep onEdit={() => setActiveStep(1)} />}

          <Typography
            role="status"
            variant="body2"
            sx={{ mt: busy ? 2 : 0, color: 'text.secondary' }}
          >
            {busy ? 'Saving your request...' : ''}
          </Typography>

          {activeStep > 0 && (
            <Box
              sx={{
                mt: 3,
                gap: 2,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'flex-end',
              }}
            >
              {(activeStep === 2 || !draft) && (
                <Button
                  color="inherit"
                  size="large"
                  onClick={() => setActiveStep(activeStep - 1)}
                  sx={{ mr: 'auto' }}
                >
                  Back
                </Button>
              )}
              <Button
                color="inherit"
                size="large"
                variant="outlined"
                aria-disabled={busy}
                onClick={() => run('save')}
              >
                {isResubmit ? 'Save changes' : 'Save as draft'}
              </Button>
              {activeStep === 1 ? (
                <Button
                  size="large"
                  variant="contained"
                  onClick={() => setActiveStep(2)}
                >
                  Next: review
                </Button>
              ) : (
                <Button
                  size="large"
                  variant="contained"
                  aria-disabled={busy}
                  onClick={() => run('submit')}
                >
                  {isResubmit ? 'Resubmit request' : 'Submit request'}
                </Button>
              )}
            </Box>
          )}

          {request && (
            <Typography
              variant="body2"
              sx={{ mt: 2, color: 'text.secondary', textAlign: 'right' }}
            >
              {isResubmit ? 'Changes saved.' : 'Draft saved.'}{' '}
              <Link
                component={RouterLink}
                href={paths.requests.details(request.requestId)}
              >
                View this request
              </Link>
            </Typography>
          )}
        </Box>
      </FormProvider>
    </DashboardContent>
  );
}
