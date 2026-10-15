import type { RequestIntakeValues } from './request-intake-schema';

import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useFundingSources } from './use-request';

// ----------------------------------------------------------------------

const NOT_SET = 'Not set';

/**
 * Intake step 3: the answers as a description list, with an Edit button back to the details step.
 * Submitting checks the required fields; missing ones send the user back to the details step with focus
 * on the first.
 */
type Props = {
  onEdit: () => void;
};

export function RequestIntakeReviewStep({ onEdit }: Props) {
  const { watch } = useFormContext<RequestIntakeValues>();
  const values = watch();
  const fundingSources = useFundingSources();
  const funding = fundingSources.data?.find(
    (option) => option.codeId.toString() === values.fundingSourceId
  );

  const rows: [string, string][] = [
    ['Software name', values.softwareName || NOT_SET],
    ['Vendor', values.vendor || NOT_SET],
    ['Website', values.url || NOT_SET],
    ['Department', values.department || NOT_SET],
    ['Funding source', funding?.label ?? NOT_SET],
    ['Business need', values.businessNeed || NOT_SET],
    ['VPAT provided', values.vpatSubmitted ? 'Yes' : 'No'],
  ];

  return (
    <Card sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary' }}
        >
          Check your answers before you submit. You can still save this as a draft.
        </Typography>
        <Button
          color="inherit"
          variant="outlined"
          onClick={onEdit}
        >
          Edit details
        </Button>
      </Box>

      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          columnGap: 3,
          rowGap: 2,
          gridTemplateColumns: { xs: '1fr', sm: '200px 1fr' },
        }}
      >
        {rows.map(([term, value]) => (
          <Box
            key={term}
            sx={{ display: 'contents' }}
          >
            <Typography
              component="dt"
              variant="subtitle2"
              sx={{ color: 'text.secondary' }}
            >
              {term}
            </Typography>
            <Typography
              component="dd"
              variant="body2"
              sx={{ m: 0, whiteSpace: 'pre-wrap' }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
