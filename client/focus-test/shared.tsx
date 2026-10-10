// THROWAWAY TEST PAGE. Not committed. URL: http://localhost:5173/focus-test/shared.html
import 'src/global.css';

import { useState } from 'react';
import { createRoot } from 'react-dom/client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { themeConfig, ThemeProvider } from 'src/theme';
import { eocrThemeOverrides } from 'src/theme/eocr-overrides';

import { StatusChip } from 'src/components/status-chip';
import { ConfirmDialog } from 'src/components/custom-dialog';

import {
  REQUEST_STATUS_COLORS,
  APPROVAL_STATUS_COLORS,
} from 'src/sections/requests/status-colors';

const REQUEST = [
  ['Draft', 'Draft'],
  ['Submitted', 'Submitted'],
  ['AiReview', 'AI review'],
  ['HumanReview', 'Human review'],
  ['MoreInfoNeeded', 'More info needed'],
  ['AwaitingEeaap', 'Awaiting EEAAP'],
  ['Approved', 'Approved'],
  ['ApprovedWithConditions', 'Approved with conditions'],
  ['Denied', 'Denied'],
  ['SomeNewCode', 'Unknown code (fallback)'],
];
const APPROVAL = [
  ['NotReviewed', 'Not reviewed'],
  ['UnderReview', 'Under review'],
  ['Approved', 'Approved'],
  ['ApprovedWithConditions', 'Approved with conditions'],
  ['Denied', 'Denied'],
  ['Expired', 'Expired'],
  ['SomeNewCode', 'Unknown code (fallback)'],
];
const SURFACES = ['background.default', 'background.paper', 'background.neutral'];

function Dialogs() {
  const [open, setOpen] = useState<'destructive' | 'normal' | null>(null);
  const [log, setLog] = useState('');
  return (
    <Box sx={{ my: 2, display: 'flex', gap: 1 }}>
      <Button id="open-destructive" variant="outlined" onClick={() => setOpen('destructive')}>
        Delete draft
      </Button>
      <Button id="open-normal" variant="outlined" onClick={() => setOpen('normal')}>
        Submit request
      </Button>
      <span id="dialog-log">{log}</span>
      <ConfirmDialog
        open={open === 'destructive'}
        onClose={() => setOpen(null)}
        title="Delete this draft?"
        content="The draft and its answers are removed. This cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setLog('confirmed destructive');
          setOpen(null);
        }}
      />
      <ConfirmDialog
        open={open === 'normal'}
        onClose={() => setOpen(null)}
        title="Submit this request?"
        confirmLabel="Submit"
        onConfirm={() => {
          setLog('confirmed normal');
          setOpen(null);
        }}
      />
    </Box>
  );
}

function Page() {
  return (
    <Box sx={{ p: 2 }}>
      <h1>Status chips</h1>
      <Dialogs />
      {SURFACES.map((s) => (
        <Box
          key={s}
          data-surface={s}
          sx={{ bgcolor: s, p: 2, mb: 1 }}
        >
          <Typography variant="caption">{s}</Typography>
          {[
            ['RequestStatus', REQUEST, REQUEST_STATUS_COLORS],
            ['ApprovalStatus', APPROVAL, APPROVAL_STATUS_COLORS],
          ].map(([type, list, colors]) => (
            <Box
              key={type as string}
              sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}
            >
              {(list as string[][]).map(([code, label]) => (
                <span
                  key={code}
                  data-chip={`${type}:${code}`}
                >
                  <StatusChip
                    code={code}
                    label={label}
                    colors={colors as typeof REQUEST_STATUS_COLORS}
                  />
                </span>
              ))}
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

createRoot(document.getElementById('root')!).render(
  <ThemeProvider
    modeStorageKey={themeConfig.modeStorageKey}
    defaultMode={themeConfig.defaultMode}
    themeOverrides={eocrThemeOverrides}
  >
    <Page />
  </ThemeProvider>
);
