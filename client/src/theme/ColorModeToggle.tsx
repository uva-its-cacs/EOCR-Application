import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'

export function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark'
  const label = `Switch to ${isDark ? 'light' : 'dark'} mode`

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={() => setMode(isDark ? 'light' : 'dark')}
        sx={{ border: 1, borderColor: 'divider', width: 36, height: 36 }}
      >
        {isDark ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  )
}
