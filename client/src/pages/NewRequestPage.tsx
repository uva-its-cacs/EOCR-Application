import { useEffect } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

export function NewRequestPage() {
  useEffect(() => {
    document.title = 'New Request — EOCR'
  }, [])

  return (
    <>
      <Typography
        variant="h4"
        component="h1"
        tabIndex={-1}
        sx={{ outline: 'none', mb: 2 }}
      >
        New Request
      </Typography>
      <Typography sx={{ mb: 3 }}>
        The request form is coming soon.
      </Typography>
      <Button component={RouterLink} to="/" variant="outlined">
        ← Back to My Requests
      </Button>
    </>
  )
}
