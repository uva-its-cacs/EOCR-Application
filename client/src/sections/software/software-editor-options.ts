export type EditorOption = { id: number; label: string };

/**
 * Options for an editor select. When the record's current value is no longer offered (an inactive code
 * or owner), it is kept as "(current)" so the select still shows it and saving does not change it.
 */
export function withCurrentOption(
  options: EditorOption[],
  currentId: number | null,
  currentLabel: string | null
): EditorOption[] {
  if (currentId === null || options.some((option) => option.id === currentId)) return options;
  return [...options, { id: currentId, label: `${currentLabel ?? 'Current option'} (current)` }];
}
