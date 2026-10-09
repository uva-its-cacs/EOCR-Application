import type { LabelColor } from 'src/components/label';

// ----------------------------------------------------------------------

/**
 * Label color per status code (Codes.Value), as plain data. Statuses are told apart by their text, not
 * their color: several statuses share a color on purpose. Every color here is a soft Label that passes
 * contrast in both schemes (see docs/migration/theme-contrast.md). Codes not listed (admins can add codes)
 * fall back to 'default'.
 */
export type StatusColorMap = Readonly<Record<string, LabelColor>>;

// CodeType RequestStatus (server/Data/CodeConstants.cs, RequestStatuses).
export const REQUEST_STATUS_COLORS: StatusColorMap = {
  Draft: 'default',
  Submitted: 'info',
  AiReview: 'info',
  HumanReview: 'info',
  MoreInfoNeeded: 'warning',
  AwaitingEeaap: 'warning',
  Approved: 'success',
  ApprovedWithConditions: 'warning',
  Denied: 'error',
};

// CodeType ApprovalStatus (server/Data/CodeConstants.cs, ApprovalStatuses), used by the software grid.
export const APPROVAL_STATUS_COLORS: StatusColorMap = {
  NotReviewed: 'default',
  UnderReview: 'info',
  Approved: 'success',
  ApprovedWithConditions: 'warning',
  Denied: 'error',
  Expired: 'warning',
};

export const UNKNOWN_STATUS_COLOR: LabelColor = 'default';

export function getStatusColor(colors: StatusColorMap, code: string): LabelColor {
  return Object.hasOwn(colors, code) ? colors[code] : UNKNOWN_STATUS_COLOR;
}
