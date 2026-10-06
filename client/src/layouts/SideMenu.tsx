import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { MenuContent } from './MenuContent'

const DRAWER_WIDTH = 240

export function SideMenu() {
  const { user } = useCurrentUser()

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'flex' },
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          top: 0,
          height: '100%',
        },
      }}
    >
      <Box sx={{ px: 2, py: 2.5 }}>
        <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700 }}>
          EOCR Application
        </Typography>
      </Box>
      <Divider />
      <MenuContent />
      <Divider />
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {user ? (
          <>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.light',
                color: 'primary.main',
                fontSize: '0.875rem',
              }}
              aria-hidden="true"
            >
              {user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {user.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user.roleLabel}
              </Typography>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              height: 36,
              width: '100%',
              bgcolor: 'action.hover',
              borderRadius: 1,
            }}
            aria-label="Loading user information"
          />
        )}
      </Box>
    </Drawer>
  )
}
