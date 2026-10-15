import type { ReviewOptions, ReviewRequestDetail } from './types';

import { useId, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { focusPageHeading } from 'src/components/page-header';

import { assignRequest } from './api';
import { REVIEW_ACTIONS } from './review-workflow';
import { useReviewWrite } from './use-review-actions';

// ----------------------------------------------------------------------

// The requester and the assigned reviewer (the template's order details customer card), with reassignment
// to another administrator while the request is open.
type Props = {
  detail: ReviewRequestDetail;
  options: ReviewOptions | undefined;
  currentUserId: number | undefined;
};

export function ReviewPeopleCard({ detail, options, currentUserId }: Props) {
  const requestId = detail.request.requestId;
  const canAssign = detail.allowedActions.includes(REVIEW_ACTIONS.assign);
  const [reviewerId, setReviewerId] = useState('');
  const helpId = useId();

  const write = useReviewWrite(
    requestId,
    (id: number) => assignRequest(requestId, id, detail.request.updatedAt),
    'Reviewer assigned.'
  );

  const others = (options?.reviewers ?? []).filter(
    (reviewer) => reviewer.userId !== detail.assignedReviewerId
  );

  const reassign = async () => {
    if (write.pending || !reviewerId) return;
    if (await write.run(Number(reviewerId))) {
      setReviewerId('');
      focusPageHeading();
    }
  };

  const assignee =
    detail.assignedReviewerId === null
      ? 'Unassigned'
      : detail.assignedReviewerId === currentUserId
        ? `${detail.assignedReviewerName} (you)`
        : detail.assignedReviewerName;

  return (
    <Card>
      <CardHeader
        title="Requester"
        slotProps={{ title: { component: 'h2' } }}
      />
      <Box sx={{ p: 3, typography: 'body2' }}>
        <Typography variant="subtitle2">{detail.requestorName}</Typography>
        <Link href={`mailto:${detail.requestorEmail}`}>{detail.requestorEmail}</Link>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <CardHeader
        title="Reviewer"
        slotProps={{ title: { component: 'h2' } }}
      />
      <Box sx={{ p: 3, gap: 2, display: 'flex', flexDirection: 'column', typography: 'body2' }}>
        <Box>{assignee}</Box>

        {canAssign && others.length > 0 && (
          <Box sx={{ gap: 1.5, display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <TextField
              select
              size="small"
              label="Reassign to"
              value={reviewerId}
              onChange={(event) => setReviewerId(event.target.value)}
              helperText="Choose an administrator, then select Reassign."
              slotProps={{
                select: { 'aria-describedby': helpId },
                formHelperText: { id: helpId },
              }}
              sx={{ flexGrow: 1, minWidth: 180 }}
            >
              {others.map((reviewer) => (
                <MenuItem
                  key={reviewer.userId}
                  value={reviewer.userId.toString()}
                >
                  {reviewer.userId === currentUserId ? `${reviewer.name} (you)` : reviewer.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              color="inherit"
              aria-disabled={write.pending || !reviewerId}
              onClick={() => {
                void reassign();
              }}
            >
              Reassign
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
}
