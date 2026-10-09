import { LoadingScreen } from 'src/components/loading-screen';
import { VisuallyHidden } from 'src/components/visually-hidden';

// ----------------------------------------------------------------------

/**
 * Page-level loading (route Suspense fallback, access check). Wraps the template's LoadingScreen without
 * editing it: its progress bar (MUI LinearProgress, role="progressbar") gets the name "Loading" through the
 * template's own slotsProps, and a visually hidden polite status announces it.
 */
export function PageLoading() {
  return (
    <>
      <VisuallyHidden>
        <span role="status">Loading page</span>
      </VisuallyHidden>
      <LoadingScreen slotsProps={{ progress: { 'aria-label': 'Loading' } }} />
    </>
  );
}
