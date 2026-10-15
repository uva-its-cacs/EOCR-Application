import type { RequestException } from './types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';

import { formatTime, formatDateOnly, formatDateTime } from 'src/utils/format';

import { StatusChip } from 'src/components/status-chip';

import { EXCEPTION_STATUS_COLORS } from './status-colors';

// ----------------------------------------------------------------------

// The request's EEAAP exception: its status as text, the requester's answers and its dates, as a
// description list. Shared by the request status page and the admin review page.

const NOT_YET = 'Not answered yet';

type Props = {
  exception: RequestException;
};

export function RequestDetailsException({ exception }: Props) {
  const rows: [string, React.ReactNode][] = [
    ['Business justification', exception.businessJustification ?? NOT_YET],
    ['Accessibility impact', exception.accessibilityImpact ?? NOT_YET],
    ['Mitigation plan', exception.mitigationPlan ?? NOT_YET],
  ];
  if (exception.submittedAt) {
    rows.push([
      'Submitted',
      <time
        key="submitted"
        dateTime={exception.submittedAt}
      >
        {formatDateTime(exception.submittedAt)} at {formatTime(exception.submittedAt)}
      </time>,
    ]);
  }
  if (exception.approvalDate) rows.push(['Approved', formatDateOnly(exception.approvalDate)]);
  if (exception.expirationDate) {
    rows.push([
      exception.isExpired ? 'Expired' : 'Expires',
      formatDateOnly(exception.expirationDate),
    ]);
  }

  return (
    <Card>
      <CardHeader
        title="Exception (EEAAP)"
        action={
          <StatusChip
            code={exception.isExpired ? 'Expired' : exception.statusCode}
            label={exception.isExpired ? 'Expired' : exception.statusLabel}
            colors={EXCEPTION_STATUS_COLORS}
          />
        }
        slotProps={{ title: { component: 'h2' }, action: { sx: { alignSelf: 'center', m: 0 } } }}
      />
      <Box
        component="dl"
        sx={{ m: 0, p: 3, gap: 2, display: 'flex', flexDirection: 'column', typography: 'body2' }}
      >
        {rows.map(([term, value]) => (
          <Box key={term}>
            <Box
              component="dt"
              sx={{ color: 'text.secondary', mb: 0.5 }}
            >
              {term}
            </Box>
            <Box
              component="dd"
              sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {value}
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
