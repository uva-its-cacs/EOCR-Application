const STATUS_LABELS: Record<string, string> = {
  Draft: 'Draft',
  Submitted: 'Submitted',
  AiReview: 'AI Review',
  HumanReview: 'Human Review',
  MoreInfoNeeded: 'More Info Needed',
  AwaitingEeaap: 'Awaiting EEAAP',
  Approved: 'Approved',
  ApprovedWithConditions: 'Approved with Conditions',
  Denied: 'Denied',
}

interface Props {
  status: string
}

export function StatusBadge({ status }: Props) {
  const label = STATUS_LABELS[status] ?? status
  const modifier = status.toLowerCase()

  return (
    <span className={`status-badge status-${modifier}`}>
      {label}
    </span>
  )
}
