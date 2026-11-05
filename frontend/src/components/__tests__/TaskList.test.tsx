import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskList } from '../TaskList';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Review appeal bundle',
    description: 'Check exhibits and bundle details',
    status: 'TODO',
    dueDateTime: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 2,
    title: 'Urgent overdue case',
    description: null,
    status: 'IN_PROGRESS',
    dueDateTime: '2021-01-01T10:00:00Z',
    createdAt: '2021-01-01T08:00:00Z',
    updatedAt: '2021-01-01T08:00:00Z',
  },
];

describe('TaskList Component', () => {
  it('renders loading state when isLoading is true', () => {
    render(
      <TaskList
        tasks={[]}
        isLoading={true}
        activeFilter="ALL"
        searchQuery=""
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onDeleteClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('task-list-loading')).toBeInTheDocument();
    expect(screen.getByText(/Loading tasks from HMCTS system/i)).toBeInTheDocument();
  });

  it('renders empty state when tasks list is empty', () => {
    render(
      <TaskList
        tasks={[]}
        isLoading={false}
        activeFilter="ALL"
        searchQuery=""
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onDeleteClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
      />
    );

    expect(screen.getByTestId('empty-task-state')).toBeInTheDocument();
    expect(screen.getByText(/No tasks found/i)).toBeInTheDocument();
  });

  it('renders task cards and highlights overdue tasks', () => {
    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        activeFilter="ALL"
        searchQuery=""
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onDeleteClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
      />
    );

    expect(screen.getByText('Review appeal bundle')).toBeInTheDocument();
    expect(screen.getByText('Urgent overdue case')).toBeInTheDocument();
    expect(screen.getByTestId('overdue-badge-2')).toBeInTheDocument();
    expect(screen.queryByTestId('overdue-badge-1')).not.toBeInTheDocument();
  });

  it('triggers onViewDetails when "View Details" button is clicked', async () => {
    const user = userEvent.setup();
    const handleViewDetails = vi.fn();

    render(
      <TaskList
        tasks={mockTasks}
        isLoading={false}
        activeFilter="ALL"
        searchQuery=""
        onStatusChange={vi.fn()}
        onViewDetails={handleViewDetails}
        onDeleteClick={vi.fn()}
        onCreateTaskClick={vi.fn()}
      />
    );

    await user.click(screen.getByTestId('view-details-1'));
    expect(handleViewDetails).toHaveBeenCalledWith(mockTasks[0]);
  });
});

