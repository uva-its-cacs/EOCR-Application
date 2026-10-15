import type { RequestDetail } from 'src/sections/requests/types';
import type { SoftwareCatalogItem } from 'src/sections/software/types';

// Matches server/DTOs/AdminRequestSummaryDto.cs.
export interface ReviewQueueItem {
  requestId: number;
  softwareName: string;
  vendor: string;
  version: string;
  requestorName: string;
  statusCode: string;
  statusLabel: string;
  assignedReviewerId: number | null;
  assignedReviewerName: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

// Review queue filters. `status` is a request status code or 'all'.
export interface ReviewQueueFilters {
  name: string;
  status: string;
  assignment: 'all' | 'mine' | 'unassigned';
}

// Matches server/DTOs/ReviewDto.cs.
export interface Review {
  reviewId: number;
  reviewerName: string;
  reviewTypeCode: string;
  reviewTypeLabel: string;
  vendorQuestions: string | null;
  overallAssessment: string | null;
  findings: string | null;
  riskRatingId: number | null;
  riskRatingCode: string | null;
  riskRatingLabel: string | null;
  recommendationId: number | null;
  recommendationCode: string | null;
  recommendationLabel: string | null;
  conditions: string | null;
  reviewedAt: string;
  updatedAt: string;
}

// Matches server/DTOs/AdminRequestDetailDto.cs. `allowedActions` holds the server's workflow action
// names (see REVIEW_ACTIONS).
export interface ReviewRequestDetail {
  request: RequestDetail;
  requestorName: string;
  requestorEmail: string;
  assignedReviewerId: number | null;
  assignedReviewerName: string | null;
  review: Review | null;
  catalogVersions: SoftwareCatalogItem[];
  allowedActions: string[];
}

// Matches server/DTOs/SaveReviewDto.cs.
export interface SaveReviewInput {
  vendorQuestions: string | null;
  overallAssessment: string | null;
  findings: string | null;
  riskRatingId: number | null;
  recommendationId: number | null;
  conditions: string | null;
  updatedAt: string | null;
}

// Matches server/DTOs/DecideRequestDto.cs. `outcome` is a RequestStatus value.
export interface DecideInput {
  outcome: string;
  approvalExpirationDate: string | null;
  accessibilityRiskId: number | null;
  conditions: string | null;
  comments: string | null;
  updatedAt: string;
}

export interface ReviewerOption {
  userId: number;
  name: string;
}

export interface ReviewCodeOption {
  codeId: number;
  value: string;
  label: string;
}

export interface ReviewOptions {
  risks: ReviewCodeOption[];
  recommendations: ReviewCodeOption[];
  // The decision outcomes, from the RequestStatus codes (see DECISION_OUTCOMES).
  outcomes: ReviewCodeOption[];
  reviewers: ReviewerOption[];
}
