import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `My requests - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="My requests" />
    </>
  );
}
