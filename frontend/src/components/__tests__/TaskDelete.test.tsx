import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Task } from '../../types/task';
import { ConfirmationModal } from '../ConfirmationModal';
import { TaskCard } from '../TaskCard';

const sampleTask: Task = {
  id: 15,
  title: 'Duplicate filing to delete',
  description: null,
  status: 'TODO',
  dueDateTime: '2026-11-20T17:00:00Z',
  createdAt: '2026-11-01T09:00:00Z',
  updatedAt: '2026-11-01T09:00:00Z',
};

describe('Task Deletion Flow', () => {
  it('triggers onDeleteClick from TaskCard', async () => {
    const user = userEvent.setup();
    const handleDeleteClick = vi.fn();

    render(
      <TaskCard
        task={sampleTask}
        onStatusChange={vi.fn()}
        onViewDetails={vi.fn()}
        onDeleteClick={handleDeleteClick}
      />
    );

    const deleteBtn = screen.getByTestId('delete-task-15');
    await user.click(deleteBtn);

    expect(handleDeleteClick).toHaveBeenCalledWith(sampleTask);
  });

  it('renders ConfirmationModal with task details and handles cancel', async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmationModal
        task={sampleTask}
        isOpen={true}
        isDeleting={false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    expect(screen.getByText(/Duplicate filing to delete/i)).toBeInTheDocument();

    const cancelBtn = screen.getByTestId('confirm-cancel-button');
    await user.click(cancelBtn);

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when user confirms deletion in ConfirmationModal', async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <ConfirmationModal
        task={sampleTask}
        isOpen={true}
        isDeleting={false}
        onConfirm={handleConfirm}
        onCancel={vi.fn()}
      />
    );

    const confirmBtn = screen.getByTestId('confirm-delete-button');
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledTimes(1);
    });
  });
});

