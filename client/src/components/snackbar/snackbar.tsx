import Portal from '@mui/material/Portal';

import { Iconify } from '../iconify';
import { SnackbarRoot } from './styles';
import { snackbarClasses } from './classes';

// ----------------------------------------------------------------------

// The template's toaster (sonner): a polite live region named "Notifications" (Alt+T moves focus to it),
// a named close button on each toast, and no motion under prefers-reduced-motion (sonner's own CSS).
// EOCR: error toasts must not time out (WCAG 2.2.1): raise them with `{ duration: Infinity }`.
export function Snackbar() {
  return (
    <Portal>
      <SnackbarRoot
        expand
        closeButton
        gap={12}
        offset={16}
        visibleToasts={4}
        position="top-right"
        className={snackbarClasses.root}
        toastOptions={{
          unstyled: true,
          classNames: {
            toast: snackbarClasses.toast,
            icon: snackbarClasses.icon,
            loader: snackbarClasses.loader,
            loading: snackbarClasses.loading,
            /********/
            content: snackbarClasses.content,
            title: snackbarClasses.title,
            description: snackbarClasses.description,
            /********/
            closeButton: snackbarClasses.closeButton,
            actionButton: snackbarClasses.actionButton,
            cancelButton: snackbarClasses.cancelButton,
            /********/
            info: snackbarClasses.info,
            error: snackbarClasses.error,
            success: snackbarClasses.success,
            warning: snackbarClasses.warning,
          },
        }}
        icons={{
          loading: <span className={snackbarClasses.loadingIcon} />,
          info: <Iconify className={snackbarClasses.iconSvg} icon="solar:info-circle-bold" />,
          success: <Iconify className={snackbarClasses.iconSvg} icon="solar:check-circle-bold" />,
          warning: (
            <Iconify className={snackbarClasses.iconSvg} icon="solar:danger-triangle-bold" />
          ),
          error: <Iconify className={snackbarClasses.iconSvg} icon="solar:danger-bold" />,
        }}
      />
    </Portal>
  );
}
