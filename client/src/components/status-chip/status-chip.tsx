import type { StatusColorMap } from 'src/sections/requests/status-colors';

import { Label } from 'src/components/label';

import { getStatusColor } from 'src/sections/requests/status-colors';

// ----------------------------------------------------------------------

type Props = {
  // Codes.Value, used only to pick the color.
  code: string;
  // Codes.Label, always shown (it is the chip's text and accessible name).
  label: string;
  colors: StatusColorMap;
};

/**
 * Status display on the template's Label (soft). The status is always shown as text, never by color
 * alone; the color comes from a code map with a safe fallback for unknown codes. The default (grey) chip
 * pins text.primary so its contrast does not depend on the surrounding text color.
 */
export function StatusChip({ code, label, colors }: Props) {
  const color = getStatusColor(colors, code);

  return (
    <Label
      variant="soft"
      color={color}
      sx={color === 'default' ? { color: 'text.primary' } : undefined}
    >
      {label || code}
    </Label>
  );
}
