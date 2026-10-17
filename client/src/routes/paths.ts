// ----------------------------------------------------------------------

const ROOTS = {
  REQUESTS: '/requests',
  ADMIN: '/admin',
};

// ----------------------------------------------------------------------

export const paths = {
  // SOFTWARE CATALOG
  catalog: {
    root: '/',
  },
  // REQUESTS
  requests: {
    root: `${ROOTS.REQUESTS}`,
    new: `${ROOTS.REQUESTS}/new`,
    details: (requestId: number) => `${ROOTS.REQUESTS}/${requestId}`,
    edit: (requestId: number) => `${ROOTS.REQUESTS}/${requestId}/edit`,
    eeaap: (requestId: number) => `${ROOTS.REQUESTS}/${requestId}/eeaap`,
  },
  // DEV ONLY (proof of concept, registered only when import.meta.env.DEV)
  dev: {
    files: '/dev/files',
  },
  // ADMIN
  admin: {
    software: `${ROOTS.ADMIN}/software`,
    requests: `${ROOTS.ADMIN}/requests`,
    request: (requestId: number) => `${ROOTS.ADMIN}/requests/${requestId}`,
    softwareEdit: (softwareId: number) => `${ROOTS.ADMIN}/software/${softwareId}/edit`,
  },
};
