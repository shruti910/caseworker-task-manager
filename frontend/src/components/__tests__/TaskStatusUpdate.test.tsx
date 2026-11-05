import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { TaskCard } from '../TaskCard';
import { TaskDetailModal } from '../TaskDetailModal';

const sampleTask: Task = {
  id: 10,
  title: 'Review asylum claim',
  description: 'Priority case',
  status: 'TODO',
  dueDateTime: '2026-11-20T17:00:00Z',
  createdAt: '2026-11-01T09:00:00Z',
  updatedAt: '2026-11-01T09:00:00Z',
};

describe('Task Status Updates', () => {
  it('updates status from TaskCard select dropdown', async () => {
    const user = userEvent.setup();
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskCard
        task={sampleTask}
        onStatusChange={handleStatusChange}
        onViewDetails={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    const select = screen.getByTestId('status-select-10');
    expect(select).toHaveValue('TODO');

    await user.selectOptions(select, 'IN_PROGRESS');

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith(10, 'IN_PROGRESS');
    });
  });

  it('updates status from TaskDetailModal select dropdown', async () => {
    const user = userEvent.setup();
    const handleStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskDetailModal
        task={sampleTask}
        isOpen={true}
        onClose={vi.fn()}
        onStatusChange={handleStatusChange}
        onDeleteClick={vi.fn()}
      />
    );

    const select = screen.getByTestId('detail-status-select');
    expect(select).toHaveValue('TODO');

    await user.selectOptions(select, 'COMPLETED');

    await waitFor(() => {
      expect(handleStatusChange).toHaveBeenCalledWith(10, 'COMPLETED');
    });
  });
});

