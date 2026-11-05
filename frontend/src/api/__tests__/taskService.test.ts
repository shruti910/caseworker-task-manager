import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateTaskPayload, Task, TaskStatus, UpdateTaskStatusPayload } from '../../types/task';
import { taskApi } from '../taskService';

describe('taskService API client', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockTask: Task = {
    id: 1,
    title: 'Review case bundle',
    description: 'Check exhibits',
    status: 'TODO',
    dueDateTime: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-01T09:00:00Z',
    updatedAt: '2026-11-01T09:00:00Z',
  };

  it('fetches tasks with correct query parameters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => [mockTask],
    });
    globalThis.fetch = fetchMock;

    const result = await taskApi.getTasks('TODO' as TaskStatus, 'title', 'desc');

    expect(result).toEqual([mockTask]);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks?status=TODO&sortBy=title&sortDirection=desc',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
      })
    );
  });

  it('fetches a single task by ID', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTask,
    });
    globalThis.fetch = fetchMock;

    const result = await taskApi.getTaskById(1);

    expect(result).toEqual(mockTask);
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/1', expect.anything());
  });

  it('creates a task via POST', async () => {
    const payload: CreateTaskPayload = {
      title: 'New Case Task',
      description: 'Review details',
      status: 'TODO',
      dueDateTime: '2026-11-25T10:00:00Z',
    };

    const createdTask = { ...mockTask, id: 2, title: payload.title };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => createdTask,
    });
    globalThis.fetch = fetchMock;

    const result = await taskApi.createTask(payload);

    expect(result).toEqual(createdTask);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
      })
    );
  });

  it('updates task status via PATCH', async () => {
    const payload: UpdateTaskStatusPayload = { status: 'COMPLETED' };
    const updatedTask = { ...mockTask, status: 'COMPLETED' as TaskStatus };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => updatedTask,
    });
    globalThis.fetch = fetchMock;

    const result = await taskApi.updateTaskStatus(1, payload);

    expect(result.status).toBe('COMPLETED');
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks/1/status',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    );
  });

  it('deletes a task via DELETE', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    });
    globalThis.fetch = fetchMock;

    await taskApi.deleteTask(1);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/tasks/1',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('throws structured ApiError when server returns error JSON', async () => {
    const errorJson = {
      status: 400,
      error: 'Bad Request',
      message: 'Validation failed',
      fieldErrors: [{ field: 'title', message: 'Title cannot be blank' }],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorJson,
    });
    globalThis.fetch = fetchMock;

    await expect(taskApi.createTask({ title: '', dueDateTime: '' })).rejects.toEqual(
      expect.objectContaining({
        status: 400,
        message: 'Validation failed',
        fieldErrors: [{ field: 'title', message: 'Title cannot be blank' }],
      })
    );
  });
});
