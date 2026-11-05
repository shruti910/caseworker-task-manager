import React, { useEffect, useState } from 'react';
import { taskApi } from '../api/taskService';
import { Task, TaskAuditLog, TaskStatus } from '../types/task';
import { formatDateTime, getDueStatusText, isTaskOverdue } from '../utils/dateUtils';
import { StatusBadge } from './StatusBadge';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: number, newStatus: TaskStatus) => Promise<void>;
  onDeleteClick: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteClick,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<TaskAuditLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadAuditLogs = (taskId: number) => {
    setIsLoadingLogs(true);
    taskApi
      .getTaskAuditLogs(taskId)
      .then((logs) => setAuditLogs(logs))
      .catch(() => setAuditLogs([]))
      .finally(() => setIsLoadingLogs(false));
  };

  useEffect(() => {
    if (isOpen && task) {
      loadAuditLogs(task.id);
    } else {
      setAuditLogs([]);
    }
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const overdue = isTaskOverdue(task.dueDateTime, task.status);
  const dueInfo = getDueStatusText(task.dueDateTime, task.status);

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus === task.status) return;

    try {
      setIsUpdating(true);
      await onStatusChange(task.id, newStatus);
      loadAuditLogs(task.id);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatAuditDetail = (log: TaskAuditLog): string => {
    if (log.action === 'CREATE') {
      return 'Task created with initial attributes';
    }
    if (log.action === 'DELETE') {
      return 'Task marked as deleted';
    }
    if (log.action === 'UPDATE') {
      try {
        if (log.previousState && log.newState) {
          const prev = JSON.parse(log.previousState);
          const curr = JSON.parse(log.newState);
          if (prev.status && curr.status) {
            return `Status changed from ${prev.status} to ${curr.status}`;
          }
        }
      } catch {
        // fallback
      }
      return `Updated fields: ${log.changedFields || 'task details'}`;
    }
    return 'Audit event recorded';
  };

  return (
    <div className="modal-backdrop" onClick={onClose} data-testid="task-detail-modal-backdrop">
      <div
        className="modal-container modal-container--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onClick={(e) => e.stopPropagation()}
        data-testid="task-detail-modal"
      >
        <div className="modal-header">
          <div>
            <span className="task-detail-ref">Task Reference #{task.id}</span>
            <h2 id="detail-modal-title" className="govuk-heading-l">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close modal"
            data-testid="detail-close-button"
          >
            &times;
          </button>
        </div>

        <div className="detail-status-banner">
          <div className="detail-status-banner__badges">
            <StatusBadge status={task.status} />
            {overdue && (
              <span className="govuk-tag govuk-tag--red" data-testid="detail-overdue-tag">
                Overdue
              </span>
            )}
          </div>

          <div className="detail-status-banner__action">
            <label htmlFor="detail-status-select" className="govuk-label govuk-label--inline">
              Update Status:
            </label>
            <select
              id="detail-status-select"
              className="govuk-select"
              value={task.status}
              onChange={handleStatusSelect}
              disabled={isUpdating}
              data-testid="detail-status-select"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        <div className="detail-meta-table">
          <div className="detail-meta-row">
            <span className="detail-meta-term">Due Date and Time</span>
            <span className={`detail-meta-desc ${overdue ? 'text-overdue' : ''}`}>
              {formatDateTime(task.dueDateTime)} ({dueInfo.text})
            </span>
          </div>

          <div className="detail-meta-row">
            <span className="detail-meta-term">Created At</span>
            <span className="detail-meta-desc">{formatDateTime(task.createdAt)}</span>
          </div>

          <div className="detail-meta-row">
            <span className="detail-meta-term">Last Updated</span>
            <span className="detail-meta-desc">{formatDateTime(task.updatedAt)}</span>
          </div>
        </div>

        <div className="detail-description-section">
          <h3 className="govuk-heading-s">Description</h3>
          {task.description ? (
            <p className="detail-description-text">{task.description}</p>
          ) : (
            <p className="govuk-hint">No description provided for this task.</p>
          )}
        </div>

        <div className="detail-audit-section">
          <h3 className="govuk-heading-s">Audit & Activity History</h3>
          {isLoadingLogs ? (
            <p className="govuk-hint" data-testid="audit-loading">Loading audit history...</p>
          ) : auditLogs.length === 0 ? (
            <p className="govuk-hint" data-testid="audit-empty">No audit entries recorded.</p>
          ) : (
            <div className="audit-timeline" data-testid="audit-log-list">
              {auditLogs.map((log) => (
                <div key={log.id} className="audit-timeline-item" data-testid={`audit-log-item-${log.id}`}>
                  <div className="audit-timeline-badge">
                    <span
                      className={`govuk-tag ${
                        log.action === 'CREATE'
                          ? 'govuk-tag--green'
                          : log.action === 'DELETE'
                          ? 'govuk-tag--red'
                          : 'govuk-tag--blue'
                      }`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="audit-timeline-content">
                    <span className="audit-timeline-date">{formatDateTime(log.createdAt)}</span>
                    <span className="audit-timeline-desc">{formatAuditDetail(log)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer detail-modal-footer">
          <button
            type="button"
            className="govuk-button govuk-button--warning"
            onClick={() => {
              onClose();
              onDeleteClick(task);
            }}
            data-testid="detail-delete-button"
          >
            Delete Task
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--secondary"
            onClick={onClose}
            data-testid="detail-modal-close-action"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
