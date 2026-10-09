// Moves focus to the page's h1 (PageHeader renders it with tabIndex -1). Used when the focused control
// disappears, for example the Retry button after a successful retry, so focus is not lost to the body.
export function focusPageHeading(): void {
  document.querySelector<HTMLElement>('#main-content h1')?.focus();
}
