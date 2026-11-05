export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDateTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDateTime: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

export interface FieldErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  path?: string;
  fieldErrors?: FieldErrorDetail[];
}

export type TaskFilterOption = 'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type SortDirectionOption = 'asc' | 'desc';

