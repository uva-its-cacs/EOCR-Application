// ----------------------------------------------------------------------

const ROOTS = {
  REQUESTS: '/requests',
  ADMIN: '/admin',
};

// ----------------------------------------------------------------------

export const paths = {
  // REQUESTS
  requests: {
    root: '/',
    new: `${ROOTS.REQUESTS}/new`,
  },
  // ADMIN
  admin: {
    software: `${ROOTS.ADMIN}/software`,
  },
};
