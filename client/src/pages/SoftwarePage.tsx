import { useEffect } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { SoftwareGrid } from '../features/software/components/SoftwareGrid'
import { SoftwareEditDialog } from '../features/software/components/SoftwareEditDialog'
import { useSoftware } from '../features/software/useSoftware'
import { useSoftwareEditor } from '../features/software/useSoftwareEditor'

export function SoftwarePage() {
  const { user, isLoading: isLoadingUser, isError: userError } = useCurrentUser()
  const isAdmin = user?.roleCode === 'Admin'
  const software = useSoftware(isAdmin)
  const editor = useSoftwareEditor()

  useEffect(() => {
    document.title = 'Software Administration — EOCR'
  }, [])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mt: { xs: 3, md: 0 },
          mb: 2,
        }}
      >
        <Typography component="h1" variant="h4" tabIndex={-1} sx={{ outline: 'none' }}>
          Software
        </Typography>
        {isAdmin && (
          <Button onClick={() => { void software.refetch() }} disabled={software.isFetching}>
            {software.isFetching ? 'Refreshing...' : 'Refresh'}
          </Button>
        )}
      </Box>
      {isLoadingUser ? (
        <Typography role="status">Checking administrator access...</Typography>
      ) : userError ? (
        <Alert severity="error">Your access could not be verified. Please reload the page.</Alert>
      ) : !isAdmin ? (
        <Alert severity="warning">Software administration is available to administrators only.</Alert>
      ) : (
        <>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Manage existing software and accessibility review details. Choose Edit on a row to make changes.
          </Typography>
          {editor.message && <Alert severity="success" role="status" sx={{ mb: 2 }}>{editor.message}</Alert>}
          {software.isPending && (
            <Box role="status" sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
              <CircularProgress size={20} aria-hidden="true" />
              <Typography>Loading software...</Typography>
            </Box>
          )}
          {software.isError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={<Button onClick={() => { void software.refetch() }}>Retry</Button>}
            >
              Software could not be loaded. Retry or check your administrator access.
            </Alert>
          )}
          {software.data && (
            <SoftwareGrid rows={software.data} onEdit={editor.beginEdit} />
          )}
          {editor.selected && editor.draft && (
            <SoftwareEditDialog
              software={editor.selected}
              draft={editor.draft}
              fieldErrors={editor.fieldErrors}
              options={editor.options}
              isLoadingOptions={editor.isLoadingOptions}
              optionsError={editor.optionsError}
              isSaving={editor.isSaving}
              saveError={editor.saveError}
              onChange={editor.changeField}
              onCancel={editor.cancelEdit}
              onSave={editor.save}
              onRetryOptions={editor.retryOptions}
            />
          )}
        </>
      )}
    </>
  )
}
