import { createBrowserRouter } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { NewRequestPage } from '../pages/NewRequestPage'
import { SoftwarePage } from '../pages/SoftwarePage'

export const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/requests/new', element: <NewRequestPage /> },
      { path: '/admin/software', element: <SoftwarePage /> },
    ],
  },
])
