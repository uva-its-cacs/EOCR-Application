import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useCurrentUser } from '../features/auth/useCurrentUser'
import { MenuContent } from './MenuContent'

const DRAWER_WIDTH = 240

interface Props {
  open: boolean
  onClose: () => void
  id: string
}

export function SideMenuMobile({ open, onClose, id }: Props) {
  const location = useLocation()
  const { user } = useCurrentUser()

  // Close drawer on navigation
  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  if (!open) return null

  return (
    <Drawer
      id={id}
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: false }}
      slotProps={{ paper: { sx: { width: DRAWER_WIDTH } } }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700 }}>
          EOCR
        </Typography>
      </Box>
      <Divider />
      <MenuContent onNavigate={onClose} />
      {user && (
        <>
          <Divider />
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
              {user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user.roleLabel}
            </Typography>
          </Box>
        </>
      )}
    </Drawer>
  )
}
