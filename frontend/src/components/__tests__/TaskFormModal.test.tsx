import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TaskFormModal } from '../TaskFormModal';

describe('TaskFormModal Component', () => {
  it('does not render when isOpen is false', () => {
    render(
      <TaskFormModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.queryByTestId('task-form-modal')).not.toBeInTheDocument();
  });

  it('renders form fields when isOpen is true', () => {
    render(
      <TaskFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );

    expect(screen.getByTestId('task-form-modal')).toBeInTheDocument();
    expect(screen.getByLabelText(/Task Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Due Date & Time/i)).toBeInTheDocument();
  });

  it('shows validation error when attempting to submit blank title', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();

    render(
      <TaskFormModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={handleSubmit}
      />
    );

    const submitBtn = screen.getByTestId('modal-submit-button');
    await user.click(submitBtn);

    expect(screen.getByTestId('title-error')).toHaveTextContent(/Title cannot be blank/i);
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('submits form successfully when required fields are valid', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    const handleClose = vi.fn();

    render(
      <TaskFormModal
        isOpen={true}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    );

    const titleInput = screen.getByTestId('task-title-input');
    await user.type(titleInput, 'Draft tribunal determination');

    const descInput = screen.getByTestId('task-description-input');
    await user.type(descInput, 'Check appellant bundle index');

    const submitBtn = screen.getByTestId('modal-submit-button');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    const callArg = handleSubmit.mock.calls[0][0];
    expect(callArg.title).toBe('Draft tribunal determination');
    expect(callArg.description).toBe('Check appellant bundle index');
    expect(callArg.status).toBe('TODO');
    expect(callArg.dueDateTime).toBeDefined();
    expect(handleClose).toHaveBeenCalled();
  });
});

