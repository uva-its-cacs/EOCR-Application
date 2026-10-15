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
  },
  // ADMIN
  admin: {
    software: `${ROOTS.ADMIN}/software`,
    softwareEdit: (softwareId: number) => `${ROOTS.ADMIN}/software/${softwareId}/edit`,
  },
};
