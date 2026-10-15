import type { RequestDetail } from '../types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { VisuallyHidden } from 'src/components/visually-hidden';

import { RequestDetailsHistory } from '../request-details-history';
import { RequestDetailsToolbar } from '../request-details-toolbar';

// ----------------------------------------------------------------------

// Adapted from the template's sections/order/view/order-details-view.tsx: the toolbar, then an 8/4 grid
// with the request (business need) and its history on the left and the details sections (software,
// funding, VPAT) on the right, separated by dashed dividers as in the template's order sidebar.

const NOT_SET = 'Not set';

type Props = {
  request: RequestDetail;
};

export function RequestDetailsView({ request }: Props) {
  const sections: { title: string; rows: [string, React.ReactNode][] }[] = [
    {
      title: 'Software',
      rows: [
        ['Name', request.softwareName || NOT_SET],
        ['Vendor', request.vendor || NOT_SET],
        ['Version', request.version || NOT_SET],
        [
          'Website',
          request.url ? (
            <Link
              href={request.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {request.url}
              <VisuallyHidden> (opens in a new tab)</VisuallyHidden>
            </Link>
          ) : (
            NOT_SET
          ),
        ],
        ['In the catalog', request.softwareId ? 'Yes' : 'No'],
      ],
    },
    {
      title: 'Funding',
      rows: [
        ['Department', request.department || NOT_SET],
        ['Funding source', request.fundingSourceLabel ?? NOT_SET],
      ],
    },
    {
      title: 'VPAT',
      rows: [['VPAT provided', request.vpatSubmitted ? 'Yes' : 'No']],
    },
  ];

  return (
    <DashboardContent>
      <RequestDetailsToolbar
        request={request}
        backHref={paths.requests.root}
      />

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

            <RequestDetailsHistory request={request} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            {sections.map((section, index) => (
              <Box key={section.title}>
                {index > 0 && <Divider sx={{ borderStyle: 'dashed' }} />}
                <CardHeader
                  title={section.title}
                  slotProps={{ title: { component: 'h2' } }}
                />
                <Box
                  component="dl"
                  sx={{
                    m: 0,
                    p: 3,
                    gap: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    typography: 'body2',
                  }}
                >
                  {section.rows.map(([term, value]) => (
                    <Box
                      key={term}
                      sx={{ gap: 2, display: 'flex' }}
                    >
                      <Box
                        component="dt"
                        sx={{ width: 120, flexShrink: 0, color: 'text.secondary' }}
                      >
                        {term}
                      </Box>
                      <Box
                        component="dd"
                        sx={{ m: 0, minWidth: 0, wordBreak: 'break-word' }}
                      >
                        {value}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
