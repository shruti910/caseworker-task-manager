package uk.gov.hmcts.dts.taskmanager.mapper;

import org.springframework.stereotype.Component;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskAuditLogResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.entity.Task;
import uk.gov.hmcts.dts.taskmanager.entity.TaskAuditLog;

@Component
public class TaskMapper {

    public Task toEntity(CreateTaskRequest request) {
        if (request == null) {
            return null;
        }
        Task task = new Task();
        task.setTitle(request.title().trim());
        task.setDescription(request.description() != null ? request.description().trim() : null);
        task.setStatus(request.status() != null ? request.status() : TaskStatus.TODO);
        task.setDueDateTime(request.dueDateTime());
        return task;
    }

    public TaskResponse toResponse(Task task) {
        if (task == null) {
            return null;
        }
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getDueDateTime(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }

    public TaskAuditLogResponse toAuditResponse(TaskAuditLog auditLog) {
        if (auditLog == null) {
            return null;
        }
        return new TaskAuditLogResponse(
                auditLog.getId(),
                auditLog.getTaskId(),
                auditLog.getAction(),
                auditLog.getChangedFields(),
                auditLog.getPreviousState(),
                auditLog.getNewState(),
                auditLog.getCreatedAt()
        );
    }
}
