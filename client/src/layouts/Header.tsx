import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ColorModeToggle } from '../theme/ColorModeToggle'

export function Header() {
  const { pathname } = useLocation()

  return (
    <Box
      component="header"
      sx={{
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        mb: 1,
      }}
    >
      <Breadcrumbs
        aria-label="Breadcrumb"
        separator={<NavigateNextRoundedIcon fontSize="small" />}
      >
        <Link component={RouterLink} to="/" underline="hover" color="text.secondary">
          Dashboard
        </Link>
        <Typography color="text.primary" variant="body2" aria-current="page">
          {pathname === '/admin/software' ? 'Software' : pathname === '/' ? 'My Requests' : 'New Request'}
        </Typography>
      </Breadcrumbs>
      <ColorModeToggle />
    </Box>
  )
}
