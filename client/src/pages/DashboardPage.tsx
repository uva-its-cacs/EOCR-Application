import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchMyRequests } from '../features/requests/api'
import { StatusBadge } from '../features/requests/components/StatusBadge'

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
}

export function DashboardPage() {
  useEffect(() => {
    document.title = 'My Requests — EOCR'
  }, [])

  const {
    data: requests,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['requests', 'mine'],
    queryFn: fetchMyRequests,
  })

  return (
    <>
      <div className="dashboard-actions">
        <h1 tabIndex={-1}>My Requests</h1>
        <Link
          to="/requests/new"
          className="btn"
        >
          New request
        </Link>
      </div>

      {isLoading && <p>Loading requests…</p>}

      {isError && (
        <p role="alert">Failed to load requests. Please try again.</p>
      )}

      {requests && requests.length === 0 && (
        <p>You have no requests yet.</p>
      )}

      {requests && requests.length > 0 && (
        <table className="requests-table">
          <caption className="sr-only">Your vetting requests</caption>
          <thead>
            <tr>
              <th scope="col">Software</th>
              <th scope="col">Vendor</th>
              <th scope="col">Status</th>
              <th scope="col">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{r.softwareName}</td>
                <td>{r.vendor}</td>
                <td>
                  <StatusBadge status={r.status} />
                </td>
                <td>{formatDate(r.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
