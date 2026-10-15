import type { ReviewFormValues } from './review-schema';
import type { ReviewOptions, ReviewRequestDetail } from './types';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { formatTime, formatDateTime } from 'src/utils/format';

import { RHFSelect } from 'src/components/hook-form/rhf-select';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

import { saveReview } from './api';
import { REVIEW_ACTIONS } from './review-workflow';
import { useReviewWrite } from './use-review-actions';
import { saveReviewInput, reviewFormSchema, reviewFormDefaults } from './review-schema';

// ----------------------------------------------------------------------

// The reviewer's summary review (the Airtable Reviews fields). It is saved as the reviewer works and can
// be edited only while the request is in review; otherwise it is shown read-only.
type Props = {
  detail: ReviewRequestDetail;
  options: ReviewOptions | undefined;
};

export function ReviewForm({ detail, options }: Props) {
  const requestId = detail.request.requestId;
  const editable = detail.allowedActions.includes(REVIEW_ACTIONS.saveReview);
  const [formError, setFormError] = useState('');

  const methods = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: reviewFormDefaults(detail.review),
  });

  const write = useReviewWrite(
    requestId,
    (values: ReviewFormValues) =>
      saveReview(requestId, saveReviewInput(values, detail.review?.updatedAt ?? null)),
    'Review saved.'
  );

  const onSubmit = methods.handleSubmit(
    async (values) => {
      if (write.pending || !editable) return;
      setFormError('');
      const saved = await write.run(values, methods);
      if (saved) methods.reset(values);
      else setFormError('The review was not saved. Check the highlighted fields or try again.');
    },
    () => setFormError('Check the highlighted fields before saving.')
  );

  const disabled = !editable || write.pending;
  const review = detail.review;

  return (
    <Card>
      <CardHeader
        title="Review"
        subheader={
          review ? (
            <>
              {review.reviewTypeLabel} by {review.reviewerName}, last saved{' '}
              <time dateTime={review.updatedAt}>
                {formatDateTime(review.updatedAt)} at {formatTime(review.updatedAt)}
              </time>
            </>
          ) : (
            'Not started'
          )
        }
        slotProps={{
          title: { component: 'h2' },
          subheader: { sx: { color: 'text.secondary' } },
        }}
      />

      <FormProvider {...methods}>
        <Box
          component="form"
          noValidate
          aria-busy={write.pending}
          aria-label="Review"
          onSubmit={(event) => {
            event.preventDefault();
            void onSubmit();
          }}
          sx={{ p: 3, gap: 3, display: 'flex', flexDirection: 'column' }}
        >
          {!editable && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
            >
              The review can be edited while the request is in review.
            </Typography>
          )}

          {formError && <Alert severity="error">{formError}</Alert>}

          <RHFTextField
            name="findings"
            label="Findings"
            multiline
            minRows={3}
            disabled={disabled}
          />

          <RHFTextField
            name="vendorQuestions"
            label="Questions for the vendor"
            multiline
            minRows={2}
            disabled={disabled}
          />

          <RHFTextField
            name="overallAssessment"
            label="Overall assessment"
            multiline
            minRows={2}
            disabled={disabled}
          />

          <Box
            sx={{
              gap: 3,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            <RHFSelect
              name="riskRatingId"
              label="Accessibility risk"
              disabled={disabled || !options}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            >
              <MenuItem value="">Not rated</MenuItem>
              {options?.risks.map((option) => (
                <MenuItem
                  key={option.codeId}
                  value={option.codeId.toString()}
                >
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="recommendationId"
              label="Recommendation"
              disabled={disabled || !options}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
            >
              <MenuItem value="">No recommendation yet</MenuItem>
              {options?.recommendations.map((option) => (
                <MenuItem
                  key={option.codeId}
                  value={option.codeId.toString()}
                >
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>

          <RHFTextField
            name="conditions"
            label="Recommended conditions"
            helperText="Conditions of use, if you recommend approval with conditions."
            multiline
            minRows={2}
            disabled={disabled}
          />

          <Typography
            role="status"
            variant="body2"
            sx={{ color: 'text.secondary', '&:empty': { display: 'none' } }}
          >
            {write.pending ? 'Saving the review...' : ''}
          </Typography>

          {editable && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                aria-disabled={write.pending}
              >
                Save review
              </Button>
            </Box>
          )}
        </Box>
      </FormProvider>
    </Card>
  );
}
