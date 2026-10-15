import { DashboardContent } from 'src/layouts/dashboard';

import { NotFoundView } from 'src/sections/error/not-found-view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <DashboardContent>
      <NotFoundView />
    </DashboardContent>
  );
}
