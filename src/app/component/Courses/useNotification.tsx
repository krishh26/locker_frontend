/**
 * useNotification.tsx
 * 
 * Custom hook for professional notifications using Material-UI Snackbar
 */

import { useState, useCallback } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSuccess = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'success',
    });
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'error',
    });
  }, []);

  const showInfo = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'info',
    });
  }, []);

  const showWarning = useCallback((message: string) => {
    setNotification({
      open: true,
      message,
      severity: 'warning',
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  const NotificationComponent = () => (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={hideNotification}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        '& .MuiSnackbarContent-root': {
          minWidth: '300px',
        },
      }}
    >
      <Alert
        onClose={hideNotification}
        severity={notification.severity}
        variant="filled"
        sx={{
          width: '100%',
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          '& .MuiAlert-icon': {
            fontSize: '1.5rem',
          },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideNotification,
    NotificationComponent,
  };
};

