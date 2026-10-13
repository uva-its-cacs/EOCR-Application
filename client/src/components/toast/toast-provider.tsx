import { useMemo, useContext, useCallback, createContext, useRef, useState } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

type ToastSeverity = 'success' | 'error';

type ToastMessage = {
  id: number;
  message: string;
  severity: ToastSeverity;
};

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function ToastProvider({ children }: Props) {
  const nextId = useRef(0);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const show = useCallback((severity: ToastSeverity, message: string) => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, severity });
  }, []);

  const showSuccess = useCallback((message: string) => show('success', message), [show]);
  const showError = useCallback((message: string) => show('error', message), [show]);
  const value = useMemo(() => ({ showSuccess, showError }), [showSuccess, showError]);

  const handleClose = useCallback(
    (_event: Event | React.SyntheticEvent, reason: string) => {
      if (reason !== 'clickaway') setToast(null);
    },
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.id}
        open={toast !== null}
        autoHideDuration={toast?.severity === 'error' ? null : 6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleClose}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            variant="standard"
            role={toast.severity === 'success' ? 'status' : 'alert'}
            onClose={() => setToast(null)}
            sx={{ width: '100%', boxShadow: 8, alignItems: 'center' }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }

  return context;
}
