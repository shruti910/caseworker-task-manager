-- Add soft-delete columns to tasks table
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);

CREATE TABLE IF NOT EXISTS task_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    action VARCHAR(30) NOT NULL,
    changed_fields VARCHAR(255),
    previous_state TEXT,
    new_state TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_task_audit_logs_task_id ON task_audit_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_task_audit_logs_created_at ON task_audit_logs(created_at);

