import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSoftwareOptions, updateSoftware } from './api'
import { SOFTWARE_QUERY_KEY } from './useSoftware'
import type { Software, SoftwareDraft, SoftwareFieldErrors, UpdateSoftwareInput } from './types'

function toDraft(software: Software): SoftwareDraft {
  return {
    softwareName: software.softwareName,
    vendorName: software.vendorName,
    publisherWebsite: software.publisherWebsite ?? '',
    softwareCategoryId: software.softwareCategoryId?.toString() ?? '',
    businessOwnerId: software.businessOwnerId?.toString() ?? '',
    technicalOwnerId: software.technicalOwnerId?.toString() ?? '',
    currentApprovalStatusId: software.currentApprovalStatusId.toString(),
    accessibilityRiskId: software.accessibilityRiskId?.toString() ?? '',
    approvalDate: software.approvalDate ?? '',
    approvalExpirationDate: software.approvalExpirationDate ?? '',
    notes: software.notes ?? '',
  }
}

function validate(draft: SoftwareDraft): SoftwareFieldErrors {
  const errors: SoftwareFieldErrors = {}
  if (!draft.softwareName.trim() || draft.softwareName.length > 200) {
    errors.softwareName = 'Enter a software name of up to 200 characters.'
  }
  if (!draft.vendorName.trim() || draft.vendorName.length > 200) {
    errors.vendorName = 'Enter a vendor name of up to 200 characters.'
  }
  if (draft.publisherWebsite.trim()) {
    try {
      const url = new URL(draft.publisherWebsite.trim())
      if (!['http:', 'https:'].includes(url.protocol) || draft.publisherWebsite.length > 2000) {
        errors.publisherWebsite = 'Enter a valid HTTP or HTTPS website.'
      }
    } catch {
      errors.publisherWebsite = 'Enter a valid HTTP or HTTPS website.'
    }
  }
  if (!draft.currentApprovalStatusId) {
    errors.currentApprovalStatusId = 'Select an approval status.'
  }
  for (const field of ['approvalDate', 'approvalExpirationDate'] as const) {
    const value = draft[field]
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value)
      || Number(value.slice(0, 4)) < 1
      || Number.isNaN(Date.parse(value))
      || new Date(value).toISOString().slice(0, 10) !== value)) {
      errors[field] = 'Enter a valid date.'
    }
  }
  if (draft.approvalDate && draft.approvalExpirationDate
    && draft.approvalExpirationDate < draft.approvalDate) {
    errors.approvalExpirationDate = 'Expiration cannot be before the approval date.'
  }
  if (draft.notes.length > 4000) {
    errors.notes = 'Notes must be 4000 characters or fewer.'
  }
  return errors
}

function saveErrorMessage(error: Error): string {
  if (error.message.startsWith('409')) {
    return 'Another administrator changed this software. Cancel, refresh the list, and reopen the editor.'
  }
  if (error.message.startsWith('403') || error.message.startsWith('401')) {
    return 'Your administrator access is no longer available. This edit was not saved.'
  }
  if (error.message.startsWith('404')) {
    return 'This software is no longer available. Cancel and refresh the list.'
  }
  if (error.message.startsWith('400')) {
    return 'The server rejected these values. Check the fields; a selected option may no longer be available.'
  }
  return 'The software could not be saved. Please try again.'
}

export function useSoftwareEditor() {
  const queryClient = useQueryClient()
  const [selected, setSelected] = useState<Software | null>(null)
  const [draft, setDraft] = useState<SoftwareDraft | null>(null)
  const [fieldErrors, setFieldErrors] = useState<SoftwareFieldErrors>({})
  const [message, setMessage] = useState('')
  const options = useQuery({
    queryKey: ['software', 'options', 'admin'],
    queryFn: fetchSoftwareOptions,
    enabled: selected !== null,
    staleTime: 0,
    retry: false,
  })

  const mutation = useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateSoftwareInput }) => updateSoftware(id, input),
    onSuccess: (software) => {
      queryClient.setQueryData<Software[]>(SOFTWARE_QUERY_KEY, (rows) =>
        rows?.map((row) => row.softwareId === software.softwareId ? software : row),
      )
      void queryClient.invalidateQueries({ queryKey: SOFTWARE_QUERY_KEY })
      setSelected(null)
      setDraft(null)
      setMessage(`${software.softwareName} was saved.`)
    },
  })

  const resetMutation = mutation.reset
  const beginEdit = useCallback((software: Software) => {
    resetMutation()
    setFieldErrors({})
    setMessage('')
    setSelected(software)
    setDraft(toDraft(software))
  }, [resetMutation])

  function changeField(field: keyof SoftwareDraft, value: string) {
    setDraft((current) => current ? { ...current, [field]: value } : current)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    mutation.reset()
  }

  function cancelEdit() {
    if (mutation.isPending) return
    setSelected(null)
    setDraft(null)
    mutation.reset()
    setFieldErrors({})
  }

  function save(): keyof SoftwareDraft | undefined {
    if (!selected || !draft || mutation.isPending || !options.data || options.isError) return
    const errors = validate(draft)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return Object.keys(errors)[0] as keyof SoftwareDraft

    const optionalId = (value: string) => value ? Number(value) : null
    mutation.mutate({
      id: selected.softwareId,
      input: {
        softwareName: draft.softwareName.trim(),
        vendorName: draft.vendorName.trim(),
        publisherWebsite: draft.publisherWebsite.trim() || null,
        softwareCategoryId: optionalId(draft.softwareCategoryId),
        businessOwnerId: optionalId(draft.businessOwnerId),
        technicalOwnerId: optionalId(draft.technicalOwnerId),
        currentApprovalStatusId: Number(draft.currentApprovalStatusId),
        accessibilityRiskId: optionalId(draft.accessibilityRiskId),
        approvalDate: draft.approvalDate || null,
        approvalExpirationDate: draft.approvalExpirationDate || null,
        notes: draft.notes.trim() || null,
        updatedAt: selected.updatedAt,
      },
    })
  }

  return {
    selected,
    draft,
    fieldErrors,
    options: options.data,
    isLoadingOptions: options.isFetching,
    optionsError: options.isError,
    retryOptions: () => { void options.refetch() },
    isSaving: mutation.isPending,
    saveError: mutation.error ? saveErrorMessage(mutation.error) : '',
    message,
    beginEdit,
    changeField,
    cancelEdit,
    save,
  }
}
