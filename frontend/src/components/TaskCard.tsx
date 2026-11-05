import React, { useState } from 'react';
import { Task, TaskStatus } from '../types/task';
import { formatDateTime, getDueStatusText, isTaskOverdue } from '../utils/dateUtils';
import { StatusBadge } from './StatusBadge';

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, newStatus: TaskStatus) => Promise<void>;
  onViewDetails: (task: Task) => void;
  onDeleteClick: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onViewDetails,
  onDeleteClick,
}) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const overdue = isTaskOverdue(task.dueDateTime, task.status);
  const dueInfo = getDueStatusText(task.dueDateTime, task.status);

  const handleStatusSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as TaskStatus;
    if (newStatus === task.status) return;

    try {
      setIsUpdatingStatus(true);
      await onStatusChange(task.id, newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <article
      className={`task-card ${overdue ? 'task-card--overdue' : ''} task-card--${task.status.toLowerCase()}`}
      data-testid={`task-card-${task.id}`}
      aria-labelledby={`task-title-${task.id}`}
    >
      <div className="task-card__header">
        <div className="task-card__header-main">
          <h3 id={`task-title-${task.id}`} className="task-card__title">
            {task.title}
          </h3>
          <span className="task-card__id">ID: #{task.id}</span>
        </div>
        <div className="task-card__badges">
          <StatusBadge status={task.status} />
          {overdue && (
            <span className="govuk-tag govuk-tag--red" data-testid={`overdue-badge-${task.id}`}>
              Overdue
            </span>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-card__description">
          {task.description.length > 180
            ? `${task.description.substring(0, 180)}...`
            : task.description}
        </p>
      )}

      <div className="task-card__meta">
        <div className="task-card__due-date">
          <span className="task-meta-label">Due Date:</span>
          <span className={`task-meta-value ${overdue ? 'task-meta-value--overdue' : ''}`}>
            {formatDateTime(task.dueDateTime)}
          </span>
          <span className="task-meta-hint">({dueInfo.text})</span>
        </div>
      </div>

      <div className="task-card__footer">
        <div className="task-card__status-control">
          <label htmlFor={`status-select-${task.id}`} className="govuk-visually-hidden">
            Change status for task {task.title}
          </label>
          <select
            id={`status-select-${task.id}`}
            className="govuk-select govuk-select--small"
            value={task.status}
            onChange={handleStatusSelect}
            disabled={isUpdatingStatus}
            data-testid={`status-select-${task.id}`}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
          {isUpdatingStatus && <span className="status-saving-hint">Updating...</span>}
        </div>

        <div className="task-card__actions">
          <button
            type="button"
            className="govuk-button govuk-button--secondary govuk-button--small"
            onClick={() => onViewDetails(task)}
            data-testid={`view-details-${task.id}`}
          >
            View Details
          </button>
          <button
            type="button"
            className="govuk-button govuk-button--warning govuk-button--small"
            onClick={() => onDeleteClick(task)}
            data-testid={`delete-task-${task.id}`}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

