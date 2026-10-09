export interface Software {
  softwareId: number
  softwareName: string
  vendorName: string
  publisherWebsite: string | null
  softwareCategoryId: number | null
  softwareCategoryCode: string | null
  softwareCategoryLabel: string | null
  businessOwnerId: number | null
  businessOwnerName: string | null
  technicalOwnerId: number | null
  technicalOwnerName: string | null
  currentApprovalStatusId: number
  currentApprovalStatusCode: string
  currentApprovalStatusLabel: string
  accessibilityRiskId: number | null
  accessibilityRiskCode: string | null
  accessibilityRiskLabel: string | null
  approvalDate: string | null
  approvalExpirationDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CodeOption {
  codeId: number
  value: string
  label: string
}

export interface OwnerOption {
  userId: number
  name: string
}

export interface SoftwareOptions {
  categories: CodeOption[]
  approvalStatuses: CodeOption[]
  risks: CodeOption[]
  owners: OwnerOption[]
}

export interface SoftwareDraft {
  softwareName: string
  vendorName: string
  publisherWebsite: string
  softwareCategoryId: string
  businessOwnerId: string
  technicalOwnerId: string
  currentApprovalStatusId: string
  accessibilityRiskId: string
  approvalDate: string
  approvalExpirationDate: string
  notes: string
}

export type SoftwareFieldErrors = Partial<Record<keyof SoftwareDraft, string>>

export interface UpdateSoftwareInput {
  softwareName: string
  vendorName: string
  publisherWebsite: string | null
  softwareCategoryId: number | null
  businessOwnerId: number | null
  technicalOwnerId: number | null
  currentApprovalStatusId: number
  accessibilityRiskId: number | null
  approvalDate: string | null
  approvalExpirationDate: string | null
  notes: string | null
  updatedAt: string
}
