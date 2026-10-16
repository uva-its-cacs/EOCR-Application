import type { RequestSummary } from './types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

import { Scrollbar } from 'src/components/scrollbar';
import { VisuallyHidden } from 'src/components/visually-hidden';
import { AnalyticSummary } from 'src/components/analytic-summary';

import { GROUP_STYLE, countByGroup, STATUS_GROUPS } from './status-groups';

// ----------------------------------------------------------------------

// The catalog page's "Your requests" strip: the viewer's own requests by status group, on the same
// analytic cards as My requests. `requests` is undefined while loading (em dashes, never 0). The caller
// hides it when the viewer has no requests.
type Props = {
  requests: RequestSummary[] | undefined;
};

export function MyRequestsSummary({ requests }: Props) {
  const theme = useTheme();
  const counts = requests ? countByGroup(requests) : null;
  const total = requests?.length ?? 0;

  return (
    <Card sx={{ mb: { xs: 3, md: 5 } }}>
      <Scrollbar
        label="Your requests"
        scrollableNodeProps={{ 'aria-busy': !requests }}
        sx={{ minHeight: 108 }}
      >
        <VisuallyHidden
          component="h2"
          id="your-requests-heading"
        >
          Your requests
        </VisuallyHidden>
        <Stack
          divider={
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderStyle: 'dashed' }}
            />
          }
          sx={{ py: 2, flexDirection: 'row' }}
        >
          {Object.keys(STATUS_GROUPS).map((group) => {
            const style = GROUP_STYLE[group];
            const count = counts ? counts[group] : null;
            return (
              <AnalyticSummary
                key={group}
                title={group}
                total={count}
                percent={count === null || !total ? 0 : (count / total) * 100}
                icon={style?.icon ?? 'solar:file-bold-duotone'}
                color={
                  !style || style.color === 'default'
                    ? theme.vars.palette.text.secondary
                    : theme.vars.palette[style.color].main
                }
              />
            );
          })}
        </Stack>
      </Scrollbar>
    </Card>
  );
}
