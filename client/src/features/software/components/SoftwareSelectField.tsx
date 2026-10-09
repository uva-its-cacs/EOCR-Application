import TextField from '@mui/material/TextField'

interface Props {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

export function SoftwareSelectField({
  id,
  label,
  value,
  options,
  onChange,
  error,
  required = false,
  disabled = false,
}: Props) {
  return (
    <TextField
      id={id}
      label={label}
      value={value}
      select
      fullWidth
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error}
      slotProps={{
        select: { native: true },
        inputLabel: { shrink: true },
      }}
    >
      <option value="">{required ? 'Select a status' : 'Not set'}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </TextField>
  )
}
