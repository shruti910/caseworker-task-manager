import React, { useEffect } from 'react';

interface NotificationToastProps {
  message: string | null;
  type?: 'success' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  message,
  type = 'success',
  onDismiss,
  duration = 4000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  return (
    <div
      className={`notification-toast notification-toast--${type}`}
      role="status"
      aria-live="polite"
      data-testid="notification-toast"
    >
      <div className="notification-toast__content">
        <span className="notification-toast__text">{message}</span>
      </div>
      <button
        type="button"
        className="notification-toast__dismiss"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        data-testid="toast-dismiss-button"
      >
        &times;
      </button>
    </div>
  );
};

