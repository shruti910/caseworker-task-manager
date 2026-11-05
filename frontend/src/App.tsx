import { useEffect, useMemo, useState } from 'react';
import { taskApi } from './api/taskService';
import { ConfirmationModal } from './components/ConfirmationModal';
import { Dashboard } from './components/Dashboard';
import { ErrorBanner } from './components/ErrorBanner';
import { Header } from './components/Header';
import { NotificationToast } from './components/NotificationToast';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskFilters } from './components/TaskFilters';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskList } from './components/TaskList';
import {
  CreateTaskPayload,
  SortDirectionOption,
  Task,
  TaskFilterOption,
  TaskStatus,
} from './types/task';
import { isTaskOverdue } from './utils/dateUtils';
import './App.css';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<TaskFilterOption>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirectionOption>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [selectedTaskForDelete, setSelectedTaskForDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskApi.getTasks();
      setTasks(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to connect to HMCTS Task Management Service. Please verify the backend is running.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    const created = await taskApi.createTask(payload);
    setTasks((prev) => [created, ...prev]);
    setToastMessage(`Task "${created.title}" created successfully.`);
  };

  const handleStatusChange = async (id: number, newStatus: TaskStatus) => {
    try {
      const updated = await taskApi.updateTaskStatus(id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

      if (selectedTaskForDetail && selectedTaskForDetail.id === id) {
        setSelectedTaskForDetail(updated);
      }

      setToastMessage(`Task status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update task status.';
      setError(message);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTaskForDelete) return;

    try {
      setIsDeleting(true);
      await taskApi.deleteTask(selectedTaskForDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== selectedTaskForDelete.id));

      if (selectedTaskForDetail && selectedTaskForDetail.id === selectedTaskForDelete.id) {
        setSelectedTaskForDetail(null);
      }

      const deletedTitle = selectedTaskForDelete.title;
      setSelectedTaskForDelete(null);
      setToastMessage(`Task "${deletedTitle}" deleted successfully.`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete task.';
      setError(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (activeFilter === 'OVERDUE') {
          return isTaskOverdue(task.dueDateTime, task.status);
        }
        if (activeFilter !== 'ALL') {
          return task.status === activeFilter;
        }
        return true;
      })
      .filter((task) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description ? task.description.toLowerCase().includes(q) : false;
        return matchTitle || matchDesc;
      })
      .sort((a, b) => {
        const timeA = new Date(a.dueDateTime).getTime();
        const timeB = new Date(b.dueDateTime).getTime();
        return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
      });
  }, [tasks, activeFilter, searchQuery, sortDirection]);

  return (
    <div className="app-container">
      <Header onCreateTaskClick={() => setIsCreateModalOpen(true)} />

      <main id="main-content" className="govuk-main-wrapper" role="main">
        <NotificationToast
          message={toastMessage}
          onDismiss={() => setToastMessage(null)}
        />

        {error && (
          <ErrorBanner
            message={error}
            onRetry={fetchTasks}
            onDismiss={() => setError(null)}
          />
        )}

        <Dashboard
          tasks={tasks}
          activeFilter={activeFilter}
          onFilterSelect={(filter) => setActiveFilter(filter)}
        />

        <TaskFilters
          activeFilter={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
          sortDirection={sortDirection}
          onSortDirectionChange={(dir) => setSortDirection(dir)}
        />

        <TaskList
          tasks={filteredAndSortedTasks}
          isLoading={isLoading}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          onStatusChange={handleStatusChange}
          onViewDetails={(task) => setSelectedTaskForDetail(task)}
          onDeleteClick={(task) => setSelectedTaskForDelete(task)}
          onCreateTaskClick={() => setIsCreateModalOpen(true)}
        />
      </main>

      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <TaskDetailModal
        task={selectedTaskForDetail}
        isOpen={selectedTaskForDetail !== null}
        onClose={() => setSelectedTaskForDetail(null)}
        onStatusChange={handleStatusChange}
        onDeleteClick={(task) => setSelectedTaskForDelete(task)}
      />

      <ConfirmationModal
        task={selectedTaskForDelete}
        isOpen={selectedTaskForDelete !== null}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSelectedTaskForDelete(null)}
      />

      <footer className="govuk-footer" role="contentinfo">
        <div className="govuk-footer__container">
          <p className="govuk-footer__text">
            HMCTS Developer Challenge Solution. Caseworker Task Management System.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

