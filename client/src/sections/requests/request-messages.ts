import type { RequestDetail } from './types';

// ----------------------------------------------------------------------

// The reviewer's comment on the latest move to a status that waits on the requester ("More info
// needed" by default, or "Awaiting EEAAP"), or null when there is none.
export function latestReviewerMessage(
  request: RequestDetail,
  statusCode = 'MoreInfoNeeded'
): string | null {
  const entry = [...request.history].reverse().find((item) => item.newStatusCode === statusCode);
  return entry?.comments ?? null;
}

// The requester owes an EEAAP: the request awaits one and the exception has not been submitted.
export function needsEeaap(request: RequestDetail): boolean {
  return request.statusCode === 'AwaitingEeaap' && request.exception?.statusCode === 'Requested';
}
