import React, { useEffect } from 'react';
import { Task } from '../types/task';

interface ConfirmationModalProps {
  task: Task | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  task,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen || !task) return null;

  return (
    <div className="modal-backdrop" onClick={() => !isDeleting && onCancel()} data-testid="confirmation-modal-backdrop">
      <div
        className="modal-container modal-container--narrow"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
        onClick={(e) => e.stopPropagation()}
        data-testid="confirmation-modal"
      >
        <div className="modal-header">
          <h2 id="confirm-modal-title" className="govuk-heading-m">
            Delete Task Confirmation
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onCancel}
            disabled={isDeleting}
            aria-label="Close dialog"
            data-testid="confirm-close-button"
          >
            &times;
          </button>
        </div>

        <div className="modal-body">
          <p id="confirm-modal-description" className="govuk-body">
            Are you sure you want to permanently delete task:
          </p>
          <div className="confirm-task-preview">
            <strong>#{task.id}: {task.title}</strong>
          </div>
          <p className="govuk-warning-text">
            This action cannot be undone and the task will be permanently removed from HMCTS records.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={onCancel}
            disabled={isDeleting}
            data-testid="confirm-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--warning"
            onClick={onConfirm}
            disabled={isDeleting}
            data-testid="confirm-delete-button"
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

