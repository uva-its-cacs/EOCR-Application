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
  },
  // ADMIN
  admin: {
    software: `${ROOTS.ADMIN}/software`,
    softwareEdit: (softwareId: number) => `${ROOTS.ADMIN}/software/${softwareId}/edit`,
  },
};
