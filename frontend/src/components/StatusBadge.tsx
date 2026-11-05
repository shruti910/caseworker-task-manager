import React from 'react';
import { TaskStatus } from '../types/task';

interface StatusBadgeProps {
  status: TaskStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'TODO':
        return {
          label: 'To Do',
          className: 'govuk-tag govuk-tag--grey',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          className: 'govuk-tag govuk-tag--blue',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          className: 'govuk-tag govuk-tag--green',
        };
    }
  };

  const { label, className } = getBadgeConfig();

  return (
    <span className={className} data-testid={`status-badge-${status.toLowerCase()}`}>
      {label}
    </span>
  );
};

