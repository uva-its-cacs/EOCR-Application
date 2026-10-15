import type { ReviewRequestDetail } from '../types';
import type { ReviewMoveAction } from '../review-workflow';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { ErrorState } from 'src/components/feedback';
import { focusPageHeading } from 'src/components/page-header';

import { useCurrentUser } from 'src/sections/auth/use-current-user';
import { RequestDetailsHistory } from 'src/sections/requests/request-details-history';
import { RequestDetailsToolbar } from 'src/sections/requests/request-details-toolbar';
import {
  NOT_SET,
  RequestDetailsSummary,
  requestDetailSections,
} from 'src/sections/requests/request-details-summary';

import { ReviewForm } from '../review-form';
import { useReviewOptions } from '../use-review';
import { REVIEW_ACTIONS } from '../review-workflow';
import { moveRequest, assignRequest } from '../api';
import { useReviewWrite } from '../use-review-actions';
import { ReviewPeopleCard } from '../review-people-card';
import { ReviewActionDialog } from '../review-action-dialog';
import { ReviewDecideDialog } from '../review-decide-dialog';
import { ReviewCatalogVersions } from '../review-catalog-versions';

// ----------------------------------------------------------------------

// The admin review page, on the request status page's layout (the template's order details): the toolbar
// with the workflow steps the server allows from the current status, then the business need, the review
// form and the history on the left, and the request details, people and catalog versions on the right.
// When a step removes the button that was used, focus moves to the page heading.

type CommentStep = {
  action: ReviewMoveAction;
  title: string;
  description: string;
  commentLabel: string;
  commentHelp?: string;
  commentRequired: boolean;
  confirmLabel: string;
  success: string;
};

const REQUEST_INFO: CommentStep = {
  action: REVIEW_ACTIONS.requestInfo,
  title: 'Request more information',
  description:
    'The request goes back to the requester, who sees your message and can update and resubmit it.',
  commentLabel: 'Message to the requester',
  commentRequired: true,
  confirmLabel: 'Send to the requester',
  success: 'Sent back to the requester.',
};

const SEND_FOR_EEAAP: CommentStep = {
  action: REVIEW_ACTIONS.sendForEeaap,
  title: 'Send for an EEAAP exception',
  description:
    'The request waits for an Equally Effective Alternate Access Plan. Return it to review or decide when the plan is ready.',
  commentLabel: 'Comments',
  commentHelp: 'Optional. Shown in the request history.',
  commentRequired: false,
  confirmLabel: 'Send for EEAAP',
  success: 'Sent for an EEAAP exception.',
};

type Props = {
  detail: ReviewRequestDetail;
};

export function ReviewRequestView({ detail }: Props) {
  const { request } = detail;
  const requestId = request.requestId;
  const allowed = (action: string) => detail.allowedActions.includes(action);
  const options = useReviewOptions();
  const me = useCurrentUser();
  const currentUserId = me.status === 'authenticated' ? me.user.userId : undefined;

  const [commentStep, setCommentStep] = useState<CommentStep | null>(null);
  const [deciding, setDeciding] = useState(false);

  const assign = useReviewWrite(
    requestId,
    () => assignRequest(requestId, null, request.updatedAt),
    'Assigned to you.'
  );
  const move = useReviewWrite(
    requestId,
    (input: { action: ReviewMoveAction; comments: string | null }) =>
      moveRequest(requestId, input.action, input.comments, request.updatedAt),
    commentStep?.success ?? 'Review started.'
  );

  const busy = assign.pending || move.pending;

  const runMove = async (action: ReviewMoveAction) => {
    if (busy) return;
    if (await move.run({ action, comments: null })) focusPageHeading();
  };

  const startReviewLabel =
    request.statusCode === 'AwaitingEeaap' ? 'Return to review' : 'Start human review';

  const actions = (
    <>
      {allowed(REVIEW_ACTIONS.assign) &&
        currentUserId !== undefined &&
        detail.assignedReviewerId !== currentUserId && (
          <Button
            variant="outlined"
            color="inherit"
            aria-disabled={busy}
            startIcon={<Iconify icon="solar:user-rounded-bold" />}
            onClick={() => {
              if (busy) return;
              void assign.run(undefined).then((ok) => ok && focusPageHeading());
            }}
          >
            Assign to me
          </Button>
        )}
      {allowed(REVIEW_ACTIONS.startAiReview) && (
        <Button
          variant="outlined"
          color="inherit"
          aria-disabled={busy}
          onClick={() => {
            void runMove(REVIEW_ACTIONS.startAiReview);
          }}
        >
          Start AI review
        </Button>
      )}
      {allowed(REVIEW_ACTIONS.startReview) && (
        <Button
          variant="outlined"
          color="inherit"
          aria-disabled={busy}
          onClick={() => {
            void runMove(REVIEW_ACTIONS.startReview);
          }}
        >
          {startReviewLabel}
        </Button>
      )}
      {allowed(REVIEW_ACTIONS.requestInfo) && (
        <Button
          variant="outlined"
          color="inherit"
          aria-haspopup="dialog"
          onClick={() => setCommentStep(REQUEST_INFO)}
        >
          Request more info
        </Button>
      )}
      {allowed(REVIEW_ACTIONS.sendForEeaap) && (
        <Button
          variant="outlined"
          color="inherit"
          aria-haspopup="dialog"
          onClick={() => setCommentStep(SEND_FOR_EEAAP)}
        >
          Send for EEAAP
        </Button>
      )}
      {allowed(REVIEW_ACTIONS.decide) && (
        <Button
          variant="contained"
          aria-haspopup="dialog"
          onClick={() => setDeciding(true)}
        >
          Decide
        </Button>
      )}
    </>
  );

  return (
    <DashboardContent>
      <RequestDetailsToolbar
        request={request}
        backHref={paths.admin.requests}
        backLabel="Back to the review queue"
        actions={actions}
      />

      {options.isError && (
        <ErrorState
          onRetry={() => {
            void options.refetch();
          }}
          sx={{ mb: 3 }}
        >
          The review options (risk ratings, recommendations, decisions and reviewers) could not be
          loaded, so those fields are unavailable. Please try again.
        </ErrorState>
      )}

      <Grid
        container
        spacing={3}
      >
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <Card>
              <CardHeader
                title="Business need"
                slotProps={{ title: { component: 'h2' } }}
              />
              <Typography
                variant="body2"
                sx={{ p: 3, whiteSpace: 'pre-wrap' }}
              >
                {request.businessNeed || NOT_SET}
              </Typography>
            </Card>

            <ReviewForm
              detail={detail}
              options={options.data}
            />

            <RequestDetailsHistory request={request} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
            <ReviewPeopleCard
              detail={detail}
              options={options.data}
              currentUserId={currentUserId}
            />

            <RequestDetailsSummary sections={requestDetailSections(request)} />

            <ReviewCatalogVersions
              versions={detail.catalogVersions}
              requestedVersion={request.version}
            />
          </Box>
        </Grid>
      </Grid>

      <ReviewActionDialog
        open={commentStep !== null}
        title={commentStep?.title ?? ''}
        description={commentStep?.description ?? ''}
        commentLabel={commentStep?.commentLabel ?? 'Comments'}
        commentHelp={commentStep?.commentHelp}
        commentRequired={commentStep?.commentRequired ?? false}
        confirmLabel={commentStep?.confirmLabel ?? 'Save'}
        busy={move.pending}
        onClose={() => setCommentStep(null)}
        onConfirm={async (comments, form) => {
          if (!commentStep) return false;
          const ok = await move.run(
            { action: commentStep.action, comments: comments || null },
            form
          );
          if (ok) requestAnimationFrame(focusPageHeading);
          return ok;
        }}
      />

      <ReviewDecideDialog
        open={deciding}
        detail={detail}
        options={options.data}
        onClose={() => setDeciding(false)}
        onDecided={() => requestAnimationFrame(focusPageHeading)}
      />
    </DashboardContent>
  );
}
