export interface RequestSummary {
  requestId: number;
  softwareName: string;
  vendor: string;
  version: string;
  statusCode: string;
  statusLabel: string;
  updatedAt: string;
}

// My requests list filters (the template's invoice table filters). `status` is a request status code or
// 'all'.
export interface RequestTableFilters {
  name: string;
  status: string;
}

// Matches server/DTOs/WorkflowHistoryDto.cs.
export interface WorkflowHistoryItem {
  workflowHistoryId: number;
  previousStatusCode: string | null;
  previousStatusLabel: string | null;
  newStatusCode: string;
  newStatusLabel: string;
  changedByName: string;
  changedAt: string;
  comments: string | null;
}

// Matches server/DTOs/ExceptionDto.cs (isExpired is computed by the server).
export interface RequestException {
  exceptionId: number;
  statusCode: string;
  statusLabel: string;
  businessJustification: string | null;
  accessibilityImpact: string | null;
  mitigationPlan: string | null;
  submittedAt: string | null;
  approvalDate: string | null;
  expirationDate: string | null;
  updatedAt: string;
  isExpired: boolean;
}

// Matches server/DTOs/SaveExceptionDto.cs.
export interface SaveExceptionInput {
  businessJustification: string | null;
  accessibilityImpact: string | null;
  mitigationPlan: string | null;
  updatedAt: string;
}

// Matches server/DTOs/RequestDetailDto.cs (title is computed by the server).
export interface RequestDetail {
  requestId: number;
  title: string;
  softwareName: string;
  vendor: string;
  version: string;
  department: string;
  businessNeed: string;
  fundingSourceId: number | null;
  fundingSourceCode: string | null;
  fundingSourceLabel: string | null;
  url: string | null;
  vpatSubmitted: boolean;
  softwareId: number | null;
  statusCode: string;
  statusLabel: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  history: WorkflowHistoryItem[];
  exception: RequestException | null;
}

// Matches server/DTOs/SaveRequestDto.cs.
export interface SaveRequestInput {
  softwareName: string;
  vendor: string;
  version: string;
  department: string;
  businessNeed: string;
  fundingSourceId: number | null;
  url: string | null;
  vpatSubmitted: boolean;
  softwareId: number | null;
  updatedAt?: string;
}

export interface FundingSourceOption {
  codeId: number;
  value: string;
  label: string;
}
