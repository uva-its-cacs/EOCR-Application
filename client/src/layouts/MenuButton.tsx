import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'

interface Props {
  onClick: () => void
  isOpen: boolean
  controls: string
}

export function MenuButton({ onClick, isOpen, controls }: Props) {
  return (
    <IconButton
      onClick={onClick}
      aria-label="Open navigation menu"
      aria-expanded={isOpen}
      aria-controls={controls}
      size="small"
      sx={{ mr: 1 }}
    >
      <MenuIcon />
    </IconButton>
  )
}
