import React from 'react';
import { SortDirectionOption, TaskFilterOption } from '../types/task';

interface TaskFiltersProps {
  activeFilter: TaskFilterOption;
  onFilterChange: (filter: TaskFilterOption) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortDirection: SortDirectionOption;
  onSortDirectionChange: (direction: SortDirectionOption) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortDirection,
  onSortDirectionChange,
}) => {
  const filterTabs: Array<{ id: TaskFilterOption; label: string }> = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
    { id: 'OVERDUE', label: 'Overdue' },
  ];

  return (
    <div className="task-filters" role="search" aria-label="Task filters and search">
      <div className="task-filters__tabs" role="tablist">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeFilter === tab.id}
            className={`filter-tab ${activeFilter === tab.id ? 'filter-tab--active' : ''}`}
            onClick={() => onFilterChange(tab.id)}
            data-testid={`filter-tab-${tab.id.toLowerCase()}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="task-filters__controls">
        <div className="govuk-form-group search-input-group">
          <label className="govuk-label" htmlFor="task-search-input">
            Search tasks
          </label>
          <input
            id="task-search-input"
            className="govuk-input"
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            data-testid="task-search-input"
          />
        </div>

        <div className="govuk-form-group sort-input-group">
          <label className="govuk-label" htmlFor="task-sort-select">
            Sort by due date
          </label>
          <select
            id="task-sort-select"
            className="govuk-select"
            value={sortDirection}
            onChange={(e) => onSortDirectionChange(e.target.value as SortDirectionOption)}
            data-testid="task-sort-select"
          >
            <option value="asc">Earliest due date first</option>
            <option value="desc">Latest due date first</option>
          </select>
        </div>
      </div>
    </div>
  );
};

