import type { RequestDetail } from './types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';

import { VisuallyHidden } from 'src/components/visually-hidden';

// ----------------------------------------------------------------------

// The request details sidebar card (from the template's order details sidebar): titled sections of
// term/value rows as description lists, separated by dashed dividers. Shared by the request status page
// and the admin review page.

export const NOT_SET = 'Not set';

export type DetailsSection = {
  title: string;
  rows: [string, React.ReactNode][];
};

// The request's software, funding and VPAT sections.
export function requestDetailSections(request: RequestDetail): DetailsSection[] {
  return [
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
}

type Props = {
  sections: DetailsSection[];
};

export function RequestDetailsSummary({ sections }: Props) {
  return (
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
  );
}
