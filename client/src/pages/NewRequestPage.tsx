import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function NewRequestPage() {
  useEffect(() => {
    document.title = 'New Request — EOCR'
  }, [])

  return (
    <>
      <h1 tabIndex={-1}>New Request</h1>
      <p>The request form is coming soon.</p>
      <Link to="/">← Back to My Requests</Link>
    </>
  )
}
