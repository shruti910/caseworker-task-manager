package uk.gov.hmcts.dts.taskmanager.service;

import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskAuditLogResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;

import java.util.List;

public interface TaskService {

    TaskResponse createTask(CreateTaskRequest request);

    List<TaskResponse> getAllTasks(TaskStatus status, String sortBy, String sortDirection);

    TaskResponse getTaskById(Long id);

    TaskResponse updateTaskStatus(Long id, UpdateTaskStatusRequest request);

    void deleteTask(Long id);

    List<TaskAuditLogResponse> getTaskAuditLogs(Long taskId);
}
