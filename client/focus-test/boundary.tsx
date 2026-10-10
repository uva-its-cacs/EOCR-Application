// THROWAWAY TEST PAGE. Not committed. URL: http://localhost:5173/focus-test/boundary.html
// Forces a render error under the app's real EocrErrorBoundary (the app code is untouched).
import 'src/global.css';

import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';

import { EocrErrorBoundary } from 'src/routes/components';

function Broken(): React.ReactNode {
  throw new Error('Forced render error from the focus-test page');
}

const router = createBrowserRouter([
  { path: '*', element: <Broken />, errorElement: <EocrErrorBoundary /> },
]);

createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);
