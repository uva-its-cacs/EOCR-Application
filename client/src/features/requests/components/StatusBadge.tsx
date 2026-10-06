import Chip from '@mui/material/Chip'

type BadgeTone = 'neutral' | 'review' | 'action' | 'success' | 'denied'

const STATUS_TONES: Record<string, BadgeTone> = {
  Draft: 'neutral',
  Submitted: 'review',
  AiReview: 'review',
  HumanReview: 'review',
  MoreInfoNeeded: 'action',
  AwaitingEeaap: 'action',
  Approved: 'success',
  ApprovedWithConditions: 'action',
  Denied: 'denied',
}

// Explicit foreground/background pairs make badge contrast auditable in both modes.
const TONE_COLORS = {
  neutral: {
    light: { color: '#475569', backgroundColor: '#f0f3f7', borderColor: '#dce0e6' },
    dark: { color: '#aebacd', backgroundColor: '#1b2432', borderColor: '#39465a' },
  },
  review: {
    light: { color: '#0059b3', backgroundColor: '#e6f0ff', borderColor: '#b3d4ff' },
    dark: { color: '#9acbff', backgroundColor: '#162b45', borderColor: '#315579' },
  },
  action: {
    light: { color: '#854d0e', backgroundColor: '#fff4d6', borderColor: '#ecd49a' },
    dark: { color: '#f5d580', backgroundColor: '#352a16', borderColor: '#67522a' },
  },
  success: {
    light: { color: '#236329', backgroundColor: '#e9f6e9', borderColor: '#b9dcbc' },
    dark: { color: '#9cdda5', backgroundColor: '#142d1b', borderColor: '#315b3a' },
  },
  denied: {
    light: { color: '#a61b1b', backgroundColor: '#ffeded', borderColor: '#edbcbc' },
    dark: { color: '#ffaaaa', backgroundColor: '#391b20', borderColor: '#71343c' },
  },
}

interface Props {
  statusCode: string
  statusLabel: string
}

export function StatusBadge({ statusCode, statusLabel }: Props) {
  const tone = Object.hasOwn(STATUS_TONES, statusCode) ? STATUS_TONES[statusCode] : 'neutral'
  const colors = TONE_COLORS[tone]

  return (
    <Chip
      label={statusLabel || statusCode}
      size="small"
      variant="outlined"
      sx={(theme) => ({
        ...colors.light,
        maxWidth: '100%',
        ...theme.applyStyles('dark', colors.dark),
      })}
    />
  )
}
