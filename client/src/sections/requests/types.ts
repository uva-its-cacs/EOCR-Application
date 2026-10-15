export interface RequestSummary {
  requestId: number;
  softwareName: string;
  vendor: string;
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
