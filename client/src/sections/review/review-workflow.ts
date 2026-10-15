// The server's workflow action names (server/Repos/RequestWorkflow.cs, Actions). The server sends the ones
// allowed for a request's current status in `allowedActions`; the client only uses them to decide which
// buttons to show.
export const REVIEW_ACTIONS = {
  assign: 'assign',
  saveReview: 'save-review',
  startAiReview: 'start-ai-review',
  startReview: 'start-review',
  requestInfo: 'request-info',
  sendForEeaap: 'send-for-eeaap',
  decide: 'decide',
} as const;

// The status moves posted to /api/admin/requests/{id}/{action}.
export type ReviewMoveAction =
  | typeof REVIEW_ACTIONS.startAiReview
  | typeof REVIEW_ACTIONS.startReview
  | typeof REVIEW_ACTIONS.requestInfo
  | typeof REVIEW_ACTIONS.sendForEeaap;

// RequestStatus values a decision may set (CodeConstants.RequestStatuses on the server). Labels come from
// the server's codes.
export const DECISION_OUTCOMES = ['Approved', 'ApprovedWithConditions', 'Denied'];
export const APPROVED = 'Approved';
export const APPROVED_WITH_CONDITIONS = 'ApprovedWithConditions';
export const DENIED = 'Denied';

// Review queue summary groups: stat title to the request status codes it counts.
export const REVIEW_STATUS_GROUPS: Record<string, string[]> = {
  'Waiting to start': ['Submitted'],
  'In review': ['AiReview', 'HumanReview'],
  'Waiting on others': ['MoreInfoNeeded', 'AwaitingEeaap'],
  Decided: ['Approved', 'ApprovedWithConditions', 'Denied'],
};

export function countByReviewGroup(
  requests: readonly { statusCode: string }[]
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(REVIEW_STATUS_GROUPS).map(([group, codes]) => [
      group,
      requests.filter((r) => codes.includes(r.statusCode)).length,
    ])
  );
}

// The default approval expiry: twelve months from today, as a date field value (yyyy-mm-dd).
export function defaultExpiryDate(today: Date = new Date()): string {
  const date = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
