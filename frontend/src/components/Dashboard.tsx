import React from 'react';
import { Task, TaskFilterOption } from '../types/task';
import { isTaskOverdue } from '../utils/dateUtils';

interface DashboardProps {
  tasks: Task[];
  activeFilter: TaskFilterOption;
  onFilterSelect: (filter: TaskFilterOption) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, activeFilter, onFilterSelect }) => {
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status === 'TODO').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.dueDateTime, t.status)).length;

  const stats = [
    {
      id: 'ALL' as TaskFilterOption,
      label: 'Total Tasks',
      count: totalTasks,
      className: 'stat-card--total',
    },
    {
      id: 'TODO' as TaskFilterOption,
      label: 'Pending Tasks',
      count: pendingTasks,
      className: 'stat-card--todo',
    },
    {
      id: 'IN_PROGRESS' as TaskFilterOption,
      label: 'In Progress',
      count: inProgressTasks,
      className: 'stat-card--in-progress',
    },
    {
      id: 'COMPLETED' as TaskFilterOption,
      label: 'Completed',
      count: completedTasks,
      className: 'stat-card--completed',
    },
    {
      id: 'OVERDUE' as TaskFilterOption,
      label: 'Overdue Tasks',
      count: overdueTasks,
      className: 'stat-card--overdue',
    },
  ];

  return (
    <section className="dashboard-section" aria-label="Task Summary Statistics">
      <h2 className="govuk-heading-m">Task Overview</h2>
      <div className="dashboard-grid">
        {stats.map((stat) => {
          const isSelected = activeFilter === stat.id;
          return (
            <button
              key={stat.id}
              type="button"
              className={`stat-card ${stat.className} ${isSelected ? 'stat-card--active' : ''}`}
              onClick={() => onFilterSelect(stat.id)}
              aria-pressed={isSelected}
              data-testid={`stat-${stat.id.toLowerCase()}`}
            >
              <div className="stat-card__count">{stat.count}</div>
              <div className="stat-card__label">{stat.label}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

