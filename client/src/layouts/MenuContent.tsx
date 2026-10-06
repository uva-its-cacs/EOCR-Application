import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddIcon from '@mui/icons-material/Add'
import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'My Requests', to: '/', icon: <DashboardIcon fontSize="small" />, end: true },
  { label: 'New Request', to: '/requests/new', icon: <AddIcon fontSize="small" />, end: false },
]

interface Props {
  onNavigate?: () => void
}

export function MenuContent({ onNavigate }: Props) {
  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{ flexGrow: 1, px: 1, py: 2 }}
    >
      <List>
        {NAV_ITEMS.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                py: 0.75,
                color: 'text.secondary',
                '&.active': {
                  backgroundColor: 'action.selected',
                  color: 'text.primary',
                  '& .MuiListItemIcon-root': { color: 'text.primary' },
                },
                '& .MuiListItemIcon-root': { color: 'text.secondary' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )
}
