import { ApiError, CreateTaskPayload, Task, TaskAuditLog, TaskStatus, UpdateTaskStatusPayload } from '../types/task';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (isJson && typeof data === 'object') {
      const apiError: ApiError = {
        status: data.status || response.status,
        error: data.error || response.statusText,
        message: data.message || 'An unexpected error occurred',
        path: data.path,
        fieldErrors: data.fieldErrors || [],
      };
      throw apiError;
    }
    const genericError: ApiError = {
      status: response.status,
      error: response.statusText,
      message: typeof data === 'string' && data ? data : `Request failed with status ${response.status}`,
    };
    throw genericError;
  }

  return data as T;
}

export const taskApi = {
  async getTasks(status?: TaskStatus, sortBy = 'dueDateTime', sortDirection = 'asc'): Promise<Task[]> {
    const params = new URLSearchParams();
    if (status) {
      params.append('status', status);
    }
    if (sortBy) {
      params.append('sortBy', sortBy);
    }
    if (sortDirection) {
      params.append('sortDirection', sortDirection);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(`${BASE_URL}/api/tasks${query}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    return handleResponse<Task[]>(response);
  },

  async getTaskById(id: number): Promise<Task> {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<Task>(response);
  },

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await fetch(`${BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(response);
  },

  async updateTaskStatus(id: number, payload: UpdateTaskStatusPayload): Promise<Task> {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Task>(response);
  },

  async deleteTask(id: number): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<void>(response);
  },

  async getTaskAuditLogs(taskId: number): Promise<TaskAuditLog[]> {
    const response = await fetch(`${BASE_URL}/api/tasks/${taskId}/audit-logs`, {
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<TaskAuditLog[]>(response);
  },
};
