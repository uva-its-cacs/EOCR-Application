import type { RequestDetail } from './types';

// ----------------------------------------------------------------------

// The reviewer's comment on the latest move to "More info needed", or null when there is none.
export function latestReviewerMessage(request: RequestDetail): string | null {
  const entry = [...request.history]
    .reverse()
    .find((item) => item.newStatusCode === 'MoreInfoNeeded');
  return entry?.comments ?? null;
}
