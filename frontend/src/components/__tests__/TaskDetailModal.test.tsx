import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskApi } from '../../api/taskService';
import { Task, TaskAuditLog } from '../../types/task';
import { TaskDetailModal } from '../TaskDetailModal';

vi.mock('../../api/taskService', () => ({
  taskApi: {
    getTaskAuditLogs: vi.fn(),
  },
}));

describe('TaskDetailModal Component with Audit Logs', () => {
  const sampleTask: Task = {
    id: 101,
    title: 'Review Appeal Bundle',
    description: 'Check exhibits A through F',
    status: 'TODO',
    dueDateTime: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  };

  const sampleAuditLogs: TaskAuditLog[] = [
    {
      id: 1,
      taskId: 101,
      action: 'CREATE',
      changedFields: 'title,status',
      previousState: null,
      newState: JSON.stringify({ title: 'Review Appeal Bundle', status: 'TODO' }),
      createdAt: '2026-11-01T09:00:00Z',
    },
    {
      id: 2,
      taskId: 101,
      action: 'UPDATE',
      changedFields: 'status',
      previousState: JSON.stringify({ status: 'TODO' }),
      newState: JSON.stringify({ status: 'IN_PROGRESS' }),
      createdAt: '2026-11-02T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders task details and fetches audit logs when opened', async () => {
    vi.mocked(taskApi.getTaskAuditLogs).mockResolvedValue(sampleAuditLogs);

    render(
      <TaskDetailModal
        task={sampleTask}
        isOpen={true}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    expect(screen.getByText('Review Appeal Bundle')).toBeInTheDocument();
    expect(screen.getByText('Check exhibits A through F')).toBeInTheDocument();
    expect(taskApi.getTaskAuditLogs).toHaveBeenCalledWith(101);

    await waitFor(() => {
      expect(screen.getByTestId('audit-log-list')).toBeInTheDocument();
    });

    expect(screen.getByTestId('audit-log-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('audit-log-item-2')).toBeInTheDocument();
    expect(screen.getByText('Status changed from TODO to IN_PROGRESS')).toBeInTheDocument();
  });

  it('renders empty audit state when no logs exist', async () => {
    vi.mocked(taskApi.getTaskAuditLogs).mockResolvedValue([]);

    render(
      <TaskDetailModal
        task={sampleTask}
        isOpen={true}
        onClose={vi.fn()}
        onStatusChange={vi.fn()}
        onDeleteClick={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('audit-empty')).toBeInTheDocument();
    });
  });

  it('triggers onStatusChange when status dropdown changes', async () => {
    vi.mocked(taskApi.getTaskAuditLogs).mockResolvedValue(sampleAuditLogs);
    const mockStatusChange = vi.fn().mockResolvedValue(undefined);

    render(
      <TaskDetailModal
        task={sampleTask}
        isOpen={true}
        onClose={vi.fn()}
        onStatusChange={mockStatusChange}
        onDeleteClick={vi.fn()}
      />
    );

    const select = screen.getByTestId('detail-status-select');
    fireEvent.change(select, { target: { value: 'IN_PROGRESS' } });

    await waitFor(() => {
      expect(mockStatusChange).toHaveBeenCalledWith(101, 'IN_PROGRESS');
    });
  });
});

