import React, { useEffect, useState } from 'react';
import { ApiError, CreateTaskPayload, TaskStatus } from '../types/task';
import { toInputDateTimeLocal } from '../utils/dateUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTaskPayload) => Promise<void>;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const getDefaultDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    return toInputDateTimeLocal(tomorrow);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDateTime, setDueDateTime] = useState(getDefaultDueDate());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setDueDateTime(getDefaultDueDate());
      setErrors({});
      setServerError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title cannot be blank';
    } else if (title.trim().length > 150) {
      newErrors.title = 'Title must not exceed 150 characters';
    }

    if (description && description.length > 2000) {
      newErrors.description = 'Description must not exceed 2000 characters';
    }

    if (!dueDateTime) {
      newErrors.dueDateTime = 'Due date and time is required';
    } else {
      const parsed = new Date(dueDateTime);
      if (isNaN(parsed.getTime())) {
        newErrors.dueDateTime = 'Please enter a valid due date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const isoDueDate = new Date(dueDateTime).toISOString();

      await onSubmit({
        title: title.trim(),
        description: description.trim() ? description.trim() : undefined,
        status,
        dueDateTime: isoDueDate,
      });

      onClose();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.fieldErrors && apiErr.fieldErrors.length > 0) {
        const fieldMap: Record<string, string> = {};
        apiErr.fieldErrors.forEach((fe) => {
          fieldMap[fe.field] = fe.message;
        });
        setErrors(fieldMap);
      } else {
        setServerError(apiErr.message || 'Failed to create task. Please verify your input.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="task-form-modal-backdrop">
      <div
        className="modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        data-testid="task-form-modal"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="govuk-heading-l">
            Create New Task
          </h2>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
            data-testid="modal-close-button"
          >
            &times;
          </button>
        </div>

        {serverError && (
          <div className="govuk-error-summary" role="alert" tabIndex={-1}>
            <h3 className="govuk-error-summary__title">There is a problem</h3>
            <div className="govuk-error-summary__body">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className={`govuk-form-group ${errors.title ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label" htmlFor="task-title">
              Task Title <span className="govuk-label--mandatory">(required)</span>
            </label>
            <span className="govuk-hint">Enter a descriptive title for this task. Maximum 150 characters.</span>
            {errors.title && (
              <p className="govuk-error-message" data-testid="title-error">
                <span className="govuk-visually-hidden">Error:</span> {errors.title}
              </p>
            )}
            <input
              id="task-title"
              name="title"
              type="text"
              className={`govuk-input ${errors.title ? 'govuk-input--error' : ''}`}
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Review immigration appeal bundle"
              disabled={isSubmitting}
              data-testid="task-title-input"
            />
          </div>

          <div className={`govuk-form-group ${errors.description ? 'govuk-form-group--error' : ''}`}>
            <label className="govuk-label" htmlFor="task-description">
              Description <span className="govuk-label--optional">(optional)</span>
            </label>
            <span className="govuk-hint">Provide any additional context or instructions for this task.</span>
            {errors.description && (
              <p className="govuk-error-message" data-testid="description-error">
                <span className="govuk-visually-hidden">Error:</span> {errors.description}
              </p>
            )}
            <textarea
              id="task-description"
              name="description"
              className={`govuk-textarea ${errors.description ? 'govuk-textarea--error' : ''}`}
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Verify witness statements and check compliance with rule 14..."
              disabled={isSubmitting}
              data-testid="task-description-input"
            />
            <div className="character-count-hint">
              {description.length} / 2000 characters
            </div>
          </div>

          <div className="govuk-form-row">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                className="govuk-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={isSubmitting}
                data-testid="task-status-select"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div className={`govuk-form-group ${errors.dueDateTime ? 'govuk-form-group--error' : ''}`}>
              <label className="govuk-label" htmlFor="task-due-date">
                Due Date & Time <span className="govuk-label--mandatory">(required)</span>
              </label>
              {errors.dueDateTime && (
                <p className="govuk-error-message" data-testid="due-date-error">
                  <span className="govuk-visually-hidden">Error:</span> {errors.dueDateTime}
                </p>
              )}
              <input
                id="task-due-date"
                name="dueDateTime"
                type="datetime-local"
                className={`govuk-input ${errors.dueDateTime ? 'govuk-input--error' : ''}`}
                value={dueDateTime}
                onChange={(e) => setDueDateTime(e.target.value)}
                disabled={isSubmitting}
                data-testid="task-due-date-input"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={onClose}
              disabled={isSubmitting}
              data-testid="modal-cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="govuk-button govuk-button--primary"
              disabled={isSubmitting}
              data-testid="modal-submit-button"
            >
              {isSubmitting ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

