import type { IconifyName } from 'src/components/iconify';

// Maps dashboard stat-card titles to the request status codes they count.
// Update this list when new status codes are added to the Codes table.
export const STATUS_GROUPS: Record<string, string[]> = {
  Drafts: ['Draft'],
  'In review': ['Submitted', 'AiReview', 'HumanReview'],
  'Needs your action': ['MoreInfoNeeded', 'AwaitingEeaap'],
  Decided: ['Approved', 'ApprovedWithConditions', 'Denied'],
};

// Icon and color per status group (the template's invoice analytics: Draft, Pending, Overdue, Paid),
// shared by My requests and the catalog page's "Your requests" strip.
export type GroupColor = 'default' | 'info' | 'warning' | 'success';

export const GROUP_STYLE: Record<string, { icon: IconifyName; color: GroupColor }> = {
  Drafts: { icon: 'solar:file-corrupted-bold-duotone', color: 'default' },
  'In review': { icon: 'solar:sort-by-time-bold-duotone', color: 'info' },
  'Needs your action': { icon: 'solar:bell-bing-bold-duotone', color: 'warning' },
  Decided: { icon: 'solar:file-check-bold-duotone', color: 'success' },
};

// Group title for a status code. A code that is not listed (admins can add codes) falls back to 'Other'.
export const UNKNOWN_STATUS_GROUP = 'Other';

export function getStatusGroup(statusCode: string): string {
  const entry = Object.entries(STATUS_GROUPS).find(([, codes]) => codes.includes(statusCode));
  return entry ? entry[0] : UNKNOWN_STATUS_GROUP;
}

// Number of requests in each group, in STATUS_GROUPS order. Codes in no group are not counted.
export function countByGroup(requests: readonly { statusCode: string }[]): Record<string, number> {
  return Object.fromEntries(
    Object.entries(STATUS_GROUPS).map(([group, codes]) => [
      group,
      requests.filter((r) => codes.includes(r.statusCode)).length,
    ])
  );
}
