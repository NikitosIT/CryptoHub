import { SnackbarProvider, useSnackbar } from 'notistack';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      preventDuplicate
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={3000}
    >
      {children}
    </SnackbarProvider>
  );
}

export function useToast() {
  const { enqueueSnackbar } = useSnackbar();

  return {
    showToast: (
      message: string,
      severity: 'error' | 'success' | 'warning' | 'info' = 'info',
      duration?: number,
    ) =>
      enqueueSnackbar(message, {
        variant: severity,
        autoHideDuration: duration,
      }),

    showError: (message: string) =>
      enqueueSnackbar(message, { variant: 'error', autoHideDuration: 3000 }),

    showSuccess: (message: string) =>
      enqueueSnackbar(message, { variant: 'success', autoHideDuration: 3000 }),

    showWarning: (message: string) =>
      enqueueSnackbar(message, { variant: 'warning', autoHideDuration: 3000 }),

    showInfo: (message: string) =>
      enqueueSnackbar(message, { variant: 'info', autoHideDuration: 3000 }),
  };
}
