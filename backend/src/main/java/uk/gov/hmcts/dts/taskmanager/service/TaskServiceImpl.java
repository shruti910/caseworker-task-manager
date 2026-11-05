package uk.gov.hmcts.dts.taskmanager.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.hmcts.dts.taskmanager.dto.AuditAction;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskAuditLogResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;
import uk.gov.hmcts.dts.taskmanager.entity.Task;
import uk.gov.hmcts.dts.taskmanager.entity.TaskAuditLog;
import uk.gov.hmcts.dts.taskmanager.exception.InvalidTaskStatusException;
import uk.gov.hmcts.dts.taskmanager.exception.ResourceNotFoundException;
import uk.gov.hmcts.dts.taskmanager.mapper.TaskMapper;
import uk.gov.hmcts.dts.taskmanager.repository.TaskAuditLogRepository;
import uk.gov.hmcts.dts.taskmanager.repository.TaskRepository;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class TaskServiceImpl implements TaskService {

    private static final Logger log = LoggerFactory.getLogger(TaskServiceImpl.class);

    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "dueDateTime",
            "createdAt",
            "updatedAt",
            "title",
            "status");

    private final TaskRepository taskRepository;
    private final TaskAuditLogRepository taskAuditLogRepository;
    private final TaskMapper taskMapper;
    private final ObjectMapper objectMapper;

    public TaskServiceImpl(TaskRepository taskRepository,
            TaskAuditLogRepository taskAuditLogRepository,
            TaskMapper taskMapper,
            ObjectMapper objectMapper) {
        this.taskRepository = taskRepository;
        this.taskAuditLogRepository = taskAuditLogRepository;
        this.taskMapper = taskMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        log.info("Creating task with title: '{}'", request.title());

        Task task = taskMapper.toEntity(request);
        Task saved = taskRepository.save(task);

        Map<String, Object> initialValues = new LinkedHashMap<>();
        initialValues.put("id", saved.getId());
        initialValues.put("title", saved.getTitle());
        initialValues.put("description", saved.getDescription());
        initialValues.put("status", saved.getStatus());
        initialValues.put("dueDateTime", saved.getDueDateTime());

        TaskAuditLog auditLog = new TaskAuditLog(
                saved.getId(),
                AuditAction.CREATE,
                "title,description,status,dueDateTime",
                null,
                toJson(initialValues),
                OffsetDateTime.now());
        taskAuditLogRepository.save(auditLog);

        log.info("Successfully created task with ID: {}", saved.getId());
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(TaskStatus status, String sortBy, String sortDirection) {
        log.debug("Retrieving tasks with filter status: '{}', sortBy: '{}', direction: '{}'", status, sortBy,
                sortDirection);

        Sort sort = buildSafeSort(sortBy, sortDirection);

        List<Task> tasks;
        if (status != null) {
            tasks = taskRepository.findByStatus(status, sort);
        } else {
            tasks = taskRepository.findAll(sort);
        }

        return tasks.stream()
                .map(taskMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long id) {
        log.debug("Retrieving task with ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with ID " + id + " not found"));

        return taskMapper.toResponse(task);
    }

    @Override
    public TaskResponse updateTaskStatus(Long id, UpdateTaskStatusRequest request) {
        log.info("Updating status for task ID: {} to {}", id, request.status());

        if (request.status() == null) {
            throw new InvalidTaskStatusException("Task status cannot be null");
        }

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with ID " + id + " not found"));

        TaskStatus oldStatus = task.getStatus();
        task.setStatus(request.status());
        Task updated = taskRepository.save(task);

        if (!Objects.equals(oldStatus, request.status())) {
            Map<String, Object> previousState = Map.of("status", oldStatus);
            Map<String, Object> newState = Map.of("status", request.status());

            TaskAuditLog auditLog = new TaskAuditLog(
                    id,
                    AuditAction.UPDATE,
                    "status",
                    toJson(previousState),
                    toJson(newState),
                    OffsetDateTime.now());
            taskAuditLogRepository.save(auditLog);
        }

        log.info("Successfully updated task ID: {} to status: {}", id, updated.getStatus());
        return taskMapper.toResponse(updated);
    }

    @Override
    public void deleteTask(Long id) {
        log.info("Deleting task with ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with ID " + id + " not found"));

        Map<String, Object> previousState = new LinkedHashMap<>();
        previousState.put("id", task.getId());
        previousState.put("title", task.getTitle());
        previousState.put("status", task.getStatus());
        previousState.put("dueDateTime", task.getDueDateTime());
        previousState.put("isDeleted", false);

        OffsetDateTime deletionTimestamp = OffsetDateTime.now();
        Map<String, Object> newState = new LinkedHashMap<>();
        newState.put("isDeleted", true);
        newState.put("deletedAt", deletionTimestamp);

        taskRepository.delete(task);

        TaskAuditLog auditLog = new TaskAuditLog(
                id,
                AuditAction.DELETE,
                "isDeleted,deletedAt",
                toJson(previousState),
                toJson(newState),
                deletionTimestamp);
        taskAuditLogRepository.save(auditLog);

        log.info("Successfully soft-deleted task with ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskAuditLogResponse> getTaskAuditLogs(Long taskId) {
        log.debug("Retrieving audit logs for task ID: {}", taskId);

        List<TaskAuditLog> logs = taskAuditLogRepository.findByTaskIdOrderByCreatedAtAsc(taskId);
        if (logs.isEmpty()) {
            throw new ResourceNotFoundException("Task with ID " + taskId + " not found");
        }

        return logs.stream()
                .map(taskMapper::toAuditResponse)
                .toList();
    }

    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize audit log state to JSON", e);
            return String.valueOf(obj);
        }
    }

    private Sort buildSafeSort(String sortBy, String sortDirection) {
        String property = (sortBy != null && ALLOWED_SORT_PROPERTIES.contains(sortBy)) ? sortBy : "dueDateTime";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }
}
