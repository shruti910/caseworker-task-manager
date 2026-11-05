import React from 'react';
import { Task, TaskFilterOption, TaskStatus } from '../types/task';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  activeFilter: TaskFilterOption;
  searchQuery: string;
  onStatusChange: (id: number, newStatus: TaskStatus) => Promise<void>;
  onViewDetails: (task: Task) => void;
  onDeleteClick: (task: Task) => void;
  onCreateTaskClick: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  activeFilter,
  searchQuery,
  onStatusChange,
  onViewDetails,
  onDeleteClick,
  onCreateTaskClick,
}) => {
  if (isLoading) {
    return (
      <div className="task-list-loading" data-testid="task-list-loading" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true"></div>
        <p className="govuk-body">Loading tasks from HMCTS system...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state" data-testid="empty-task-state">
        <div className="empty-state__graphic" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <path d="M9 12h6" />
            <path d="M9 16h6" />
          </svg>
        </div>
        <h3 className="govuk-heading-m">No tasks found</h3>
        <p className="govuk-body">
          {searchQuery
            ? `No tasks matched your search query "${searchQuery}". Try different keywords or reset your filters.`
            : activeFilter !== 'ALL'
              ? `There are no tasks with status "${activeFilter.replace('_', ' ')}".`
              : 'You currently have no tasks assigned. Create your first task to start managing your workload.'}
        </p>
        <button
          type="button"
          className="govuk-button govuk-button--primary"
          onClick={onCreateTaskClick}
          data-testid="empty-state-create-button"
        >
          Create a Task
        </button>
      </div>
    );
  }

  return (
    <section className="task-list-section" aria-label="Tasks List">
      <div className="task-list-header">
        <h2 className="govuk-heading-s">
          Showing {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
        </h2>
      </div>
      <div className="task-grid" data-testid="task-grid">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            onViewDetails={onViewDetails}
            onDeleteClick={onDeleteClick}
          />
        ))}
      </div>
    </section>
  );
};
