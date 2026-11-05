package uk.gov.hmcts.dts.taskmanager.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;
import uk.gov.hmcts.dts.taskmanager.entity.Task;
import uk.gov.hmcts.dts.taskmanager.exception.InvalidTaskStatusException;
import uk.gov.hmcts.dts.taskmanager.exception.ResourceNotFoundException;
import uk.gov.hmcts.dts.taskmanager.mapper.TaskMapper;
import uk.gov.hmcts.dts.taskmanager.repository.TaskRepository;

import java.util.List;
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
            "status"
    );

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    public TaskResponse createTask(CreateTaskRequest request) {
        log.info("Creating task with title: '{}'", request.title());

        Task task = taskMapper.toEntity(request);
        Task saved = taskRepository.save(task);

        log.info("Successfully created task with ID: {}", saved.getId());
        return taskMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> getAllTasks(TaskStatus status, String sortBy, String sortDirection) {
        log.debug("Retrieving tasks with filter status: '{}', sortBy: '{}', direction: '{}'", status, sortBy, sortDirection);

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

        task.setStatus(request.status());
        Task updated = taskRepository.save(task);

        log.info("Successfully updated task ID: {} to status: {}", id, updated.getStatus());
        return taskMapper.toResponse(updated);
    }

    @Override
    public void deleteTask(Long id) {
        log.info("Deleting task with ID: {}", id);

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task with ID " + id + " not found"));

        taskRepository.delete(task);
        log.info("Successfully deleted task with ID: {}", id);
    }

    private Sort buildSafeSort(String sortBy, String sortDirection) {
        String property = (sortBy != null && ALLOWED_SORT_PROPERTIES.contains(sortBy)) ? sortBy : "dueDateTime";
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property);
    }
}

