import React from 'react';

interface ErrorBannerProps {
  message: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="govuk-error-summary error-banner" role="alert" data-testid="error-banner">
      <div className="error-banner__content">
        <h3 className="govuk-error-summary__title">System Notice</h3>
        <p className="govuk-error-summary__body">{message}</p>
      </div>
      <div className="error-banner__actions">
        {onRetry && (
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-button--small"
            onClick={onRetry}
            data-testid="error-retry-button"
          >
            Retry Connection
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            className="error-banner__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss error notice"
            data-testid="error-dismiss-button"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

