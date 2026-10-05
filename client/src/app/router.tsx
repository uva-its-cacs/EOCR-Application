import { createBrowserRouter } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { DashboardPage } from '../pages/DashboardPage'
import { NewRequestPage } from '../pages/NewRequestPage'

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/requests/new', element: <NewRequestPage /> },
    ],
  },
])
