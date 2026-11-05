import { TaskStatus } from '../types/task';

export function isTaskOverdue(dueDateTime: string, status: TaskStatus): boolean {
  if (status === 'COMPLETED') {
    return false;
  }
  const dueDate = new Date(dueDateTime);
  const now = new Date();
  return dueDate.getTime() < now.getTime();
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return isoString;
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return isoString;
  }
}

export function getDueStatusText(dueDateTime: string, status: TaskStatus): { text: string; isOverdue: boolean } {
  const overdue = isTaskOverdue(dueDateTime, status);
  if (status === 'COMPLETED') {
    return { text: 'Completed', isOverdue: false };
  }

  const dueDate = new Date(dueDateTime);
  const now = new Date();
  const diffMs = dueDate.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (overdue) {
    const absHours = Math.abs(diffHours);
    if (absHours < 24) {
      return { text: `Overdue by ${absHours} hour${absHours === 1 ? '' : 's'}`, isOverdue: true };
    }
    const absDays = Math.abs(diffDays);
    return { text: `Overdue by ${absDays} day${absDays === 1 ? '' : 's'}`, isOverdue: true };
  }

  if (diffHours < 24 && diffHours >= 0) {
    return { text: `Due in ${diffHours} hour${diffHours === 1 ? '' : 's'}`, isOverdue: false };
  }

  return { text: `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`, isOverdue: false };
}

export function toInputDateTimeLocal(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

