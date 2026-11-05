import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { taskApi } from '../../api/taskService';
import { App } from '../../App';
import { Task } from '../../types/task';

vi.mock('../../api/taskService', () => ({
  taskApi: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTaskStatus: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Review case bundle',
    description: 'Check witness exhibits',
    status: 'TODO',
    dueDateTime: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  },
  {
    id: 2,
    title: 'Schedule hearing session',
    description: null,
    status: 'IN_PROGRESS',
    dueDateTime: '2026-11-22T10:00:00Z',
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
  },
];

describe('App Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays tasks on initial mount', async () => {
    vi.mocked(taskApi.getTasks).mockResolvedValue(initialTasks);

    render(<App />);

    expect(screen.getByTestId('task-list-loading')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Review case bundle')).toBeInTheDocument();
      expect(screen.getByText('Schedule hearing session')).toBeInTheDocument();
    });

    expect(screen.getByTestId('stat-all')).toHaveTextContent('2');
    expect(screen.getByTestId('stat-todo')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-in_progress')).toHaveTextContent('1');
  });

  it('displays error banner when initial fetch fails and supports retry', async () => {
    const user = userEvent.setup();
    vi.mocked(taskApi.getTasks).mockRejectedValueOnce(new Error('Network error connecting to backend'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
      expect(screen.getByText(/Network error connecting to backend/i)).toBeInTheDocument();
    });

    vi.mocked(taskApi.getTasks).mockResolvedValueOnce(initialTasks);
    const retryBtn = screen.getByTestId('error-retry-button');
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Review case bundle')).toBeInTheDocument();
    });
  });

  it('filters tasks when searching via search input', async () => {
    const user = userEvent.setup();
    vi.mocked(taskApi.getTasks).mockResolvedValue(initialTasks);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Review case bundle')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('task-search-input');
    await user.type(searchInput, 'hearing');

    expect(screen.queryByText('Review case bundle')).not.toBeInTheDocument();
    expect(screen.getByText('Schedule hearing session')).toBeInTheDocument();
  });

  it('filters tasks when clicking status filter tabs', async () => {
    const user = userEvent.setup();
    vi.mocked(taskApi.getTasks).mockResolvedValue(initialTasks);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Review case bundle')).toBeInTheDocument();
    });

    const inProgressTab = screen.getByTestId('filter-tab-in_progress');
    await user.click(inProgressTab);

    expect(screen.queryByText('Review case bundle')).not.toBeInTheDocument();
    expect(screen.getByText('Schedule hearing session')).toBeInTheDocument();
  });

  it('creates a task, appends it to list, and displays success notification', async () => {
    const user = userEvent.setup();
    vi.mocked(taskApi.getTasks).mockResolvedValue(initialTasks);

    const newTask: Task = {
      id: 3,
      title: 'New urgent filing',
      description: 'Check priority documents',
      status: 'TODO',
      dueDateTime: '2026-11-30T17:00:00Z',
      createdAt: '2026-11-05T00:00:00Z',
      updatedAt: '2026-11-05T00:00:00Z',
    };
    vi.mocked(taskApi.createTask).mockResolvedValue(newTask);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Review case bundle')).toBeInTheDocument();
    });

    const createBtn = screen.getByTestId('header-create-task-button');
    await user.click(createBtn);

    expect(screen.getByTestId('task-form-modal')).toBeInTheDocument();

    await user.type(screen.getByTestId('task-title-input'), 'New urgent filing');
    await user.click(screen.getByTestId('modal-submit-button'));

    await waitFor(() => {
      expect(screen.getByText('New urgent filing')).toBeInTheDocument();
      expect(screen.getByTestId('notification-toast')).toHaveTextContent(/created successfully/i);
    });
  });
});

