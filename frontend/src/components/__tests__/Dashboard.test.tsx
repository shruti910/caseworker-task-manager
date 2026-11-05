import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { Dashboard } from '../Dashboard';

const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Review appeal bundle',
    description: 'Check exhibits',
    status: 'TODO',
    dueDateTime: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 2,
    title: 'Prepare tribunal notice',
    description: null,
    status: 'IN_PROGRESS',
    dueDateTime: '2026-11-25T12:00:00Z',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
  },
  {
    id: 3,
    title: 'Send decision letter',
    description: 'Letter sent to appellant',
    status: 'COMPLETED',
    dueDateTime: '2026-11-01T15:00:00Z',
    createdAt: '2026-10-25T09:00:00Z',
    updatedAt: '2026-11-01T16:00:00Z',
  },
  {
    id: 4,
    title: 'Overdue tribunal listing',
    description: 'Immediate action needed',
    status: 'TODO',
    dueDateTime: '2020-01-01T10:00:00Z', // In the past
    createdAt: '2020-01-01T08:00:00Z',
    updatedAt: '2020-01-01T08:00:00Z',
  },
];

describe('Dashboard Component', () => {
  it('renders correct task statistics summary', () => {
    render(
      <Dashboard
        tasks={mockTasks}
        activeFilter="ALL"
        onFilterSelect={vi.fn()}
      />
    );

    // Total: 4
    expect(screen.getByTestId('stat-all')).toHaveTextContent('4');
    expect(screen.getByTestId('stat-all')).toHaveTextContent('Total Tasks');

    // Pending (TODO): 2
    expect(screen.getByTestId('stat-todo')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-todo')).toHaveTextContent('Pending Tasks');

    // In Progress: 1
    expect(screen.getByTestId('stat-in_progress')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-in_progress')).toHaveTextContent('In Progress');

    // Completed: 1
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-completed')).toHaveTextContent('Completed');

    // Overdue: 1 (task #4 is TODO with past due date; task #3 is completed so not overdue)
    expect(screen.getByTestId('stat-overdue')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-overdue')).toHaveTextContent('Overdue Tasks');
  });

  it('triggers onFilterSelect when a stat card is clicked', async () => {
    const user = userEvent.setup();
    const handleFilterSelect = vi.fn();

    render(
      <Dashboard
        tasks={mockTasks}
        activeFilter="ALL"
        onFilterSelect={handleFilterSelect}
      />
    );

    await user.click(screen.getByTestId('stat-in_progress'));
    expect(handleFilterSelect).toHaveBeenCalledWith('IN_PROGRESS');
  });
});

