import Box from '@mui/material/Box'
import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppNavbar } from './AppNavbar'
import { SideMenu } from './SideMenu'
import { Header } from './Header'

export function DashboardLayout() {
  const location = useLocation()

  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('#main-content h1')
    if (h1) h1.focus()
  }, [location.pathname])

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Skip link — visually hidden until focused */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          top: '-48px',
          left: '8px',
          zIndex: 9999,
          px: 2,
          py: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 1,
          fontWeight: 600,
          textDecoration: 'none',
          '&:focus': {
            top: '8px',
            outline: '2px solid #fff',
            outlineOffset: '2px',
          },
        }}
      >
        Skip to main content
      </Box>

      {/* Permanent sidebar — desktop only */}
      <SideMenu />

      {/* Mobile top bar */}
      <AppNavbar />

      {/* Main content */}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          outline: 'none',
          minWidth: 0,
          pb: 5,
          px: { xs: 2, sm: 3 },
          // On mobile: offset top AppBar (~56px)
          mt: { xs: 7, md: 0 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 1700, mx: 'auto' }}>
          <Header />
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
