import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { MenuButton } from './MenuButton'
import { SideMenuMobile } from './SideMenuMobile'
import { ColorModeToggle } from '../theme/ColorModeToggle'

const MOBILE_DRAWER_ID = 'mobile-nav-drawer'

export function AppNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', md: 'none' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <MenuButton
            onClick={() => setDrawerOpen(true)}
            isOpen={drawerOpen}
            controls={MOBILE_DRAWER_ID}
          />
          <Typography
            component="div"
            variant="h6"
            sx={{ fontWeight: 700, flexGrow: 1 }}
          >
            EOCR
          </Typography>
          <ColorModeToggle />
        </Toolbar>
      </AppBar>

      <SideMenuMobile
        id={MOBILE_DRAWER_ID}
        open={drawerOpen}
        onClose={closeDrawer}
      />
    </>
  )
}
