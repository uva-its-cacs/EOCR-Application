// Maps dashboard stat-card titles to the request status codes they count.
// Update this list when new status codes are added to the Codes table.
export const STATUS_GROUPS: Record<string, string[]> = {
  Drafts:             ['Draft'],
  'In review':        ['Submitted', 'AiReview', 'HumanReview'],
  'Needs your action': ['MoreInfoNeeded', 'AwaitingEeaap'],
  Decided:            ['Approved', 'ApprovedWithConditions', 'Denied'],
}
