package uk.gov.hmcts.dts.taskmanager.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;
import uk.gov.hmcts.dts.taskmanager.entity.Task;
import uk.gov.hmcts.dts.taskmanager.exception.InvalidTaskStatusException;
import uk.gov.hmcts.dts.taskmanager.exception.ResourceNotFoundException;
import uk.gov.hmcts.dts.taskmanager.mapper.TaskMapper;
import uk.gov.hmcts.dts.taskmanager.repository.TaskRepository;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskServiceImpl Unit Tests")
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskMapper taskMapper;
    private TaskServiceImpl taskService;

    private final OffsetDateTime sampleDueDateTime = OffsetDateTime.parse("2026-11-20T17:00:00Z");

    @BeforeEach
    void setUp() {
        taskMapper = new TaskMapper();
        taskService = new TaskServiceImpl(taskRepository, taskMapper);
    }

    @Nested
    @DisplayName("Create Task Tests")
    class CreateTaskTests {

        @Test
        @DisplayName("Should successfully create a task with default TODO status when status is null")
        void shouldCreateTaskWithDefaultStatus() {
            CreateTaskRequest request = new CreateTaskRequest(
                    "Review applicant bundle",
                    "Verify evidence and statement",
                    null,
                    sampleDueDateTime
            );

            Task savedEntity = new Task(1L, "Review applicant bundle", "Verify evidence and statement", TaskStatus.TODO, sampleDueDateTime);
            savedEntity.setCreatedAt(OffsetDateTime.now());
            savedEntity.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.save(any(Task.class))).thenReturn(savedEntity);

            TaskResponse response = taskService.createTask(request);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(1L);
            assertThat(response.title()).isEqualTo("Review applicant bundle");
            assertThat(response.description()).isEqualTo("Verify evidence and statement");
            assertThat(response.status()).isEqualTo(TaskStatus.TODO);
            assertThat(response.dueDateTime()).isEqualTo(sampleDueDateTime);

            ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository).save(captor.capture());
            assertThat(captor.getValue().getStatus()).isEqualTo(TaskStatus.TODO);
        }

        @Test
        @DisplayName("Should successfully create a task with explicit IN_PROGRESS status")
        void shouldCreateTaskWithExplicitStatus() {
            CreateTaskRequest request = new CreateTaskRequest(
                    "Prepare hearing schedule",
                    null,
                    TaskStatus.IN_PROGRESS,
                    sampleDueDateTime
            );

            Task savedEntity = new Task(2L, "Prepare hearing schedule", null, TaskStatus.IN_PROGRESS, sampleDueDateTime);
            savedEntity.setCreatedAt(OffsetDateTime.now());
            savedEntity.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.save(any(Task.class))).thenReturn(savedEntity);

            TaskResponse response = taskService.createTask(request);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(2L);
            assertThat(response.status()).isEqualTo(TaskStatus.IN_PROGRESS);
            assertThat(response.description()).isNull();
        }
    }

    @Nested
    @DisplayName("Retrieve All Tasks Tests")
    class GetAllTasksTests {

        @Test
        @DisplayName("Should retrieve all tasks sorted by due date by default")
        void shouldRetrieveAllTasksSortedByDefault() {
            Task task1 = new Task(1L, "First task", null, TaskStatus.TODO, sampleDueDateTime);
            task1.setCreatedAt(OffsetDateTime.now());
            task1.setUpdatedAt(OffsetDateTime.now());

            Task task2 = new Task(2L, "Second task", null, TaskStatus.COMPLETED, sampleDueDateTime.plusDays(1));
            task2.setCreatedAt(OffsetDateTime.now());
            task2.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.findAll(any(Sort.class))).thenReturn(List.of(task1, task2));

            List<TaskResponse> result = taskService.getAllTasks(null, null, null);

            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(1).id()).isEqualTo(2L);
            verify(taskRepository).findAll(Sort.by(Sort.Direction.ASC, "dueDateTime"));
        }

        @Test
        @DisplayName("Should return empty list when no tasks exist")
        void shouldReturnEmptyListWhenNoTasksExist() {
            when(taskRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

            List<TaskResponse> result = taskService.getAllTasks(null, "dueDateTime", "asc");

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Should filter tasks by status when status parameter is provided")
        void shouldFilterTasksByStatus() {
            Task task = new Task(3L, "Pending task", null, TaskStatus.TODO, sampleDueDateTime);
            task.setCreatedAt(OffsetDateTime.now());
            task.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.findByStatus(any(TaskStatus.class), any(Sort.class)))
                    .thenReturn(List.of(task));

            List<TaskResponse> result = taskService.getAllTasks(TaskStatus.TODO, "title", "desc");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).status()).isEqualTo(TaskStatus.TODO);
            verify(taskRepository).findByStatus(TaskStatus.TODO, Sort.by(Sort.Direction.DESC, "title"));
        }

        @Test
        @DisplayName("Should fallback to dueDateTime sort property if untrusted property is passed")
        void shouldFallbackToSafeSortWhenUntrustedPropertyPassed() {
            when(taskRepository.findAll(any(Sort.class))).thenReturn(Collections.emptyList());

            taskService.getAllTasks(null, "malicious_column; DROP TABLE tasks;", "asc");

            verify(taskRepository).findAll(Sort.by(Sort.Direction.ASC, "dueDateTime"));
        }
    }

    @Nested
    @DisplayName("Retrieve Task By ID Tests")
    class GetTaskByIdTests {

        @Test
        @DisplayName("Should retrieve task successfully when it exists")
        void shouldRetrieveTaskWhenExists() {
            Task task = new Task(10L, "Specific Task", "Description", TaskStatus.IN_PROGRESS, sampleDueDateTime);
            task.setCreatedAt(OffsetDateTime.now());
            task.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

            TaskResponse response = taskService.getTaskById(10L);

            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo(10L);
            assertThat(response.title()).isEqualTo("Specific Task");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when task ID does not exist")
        void shouldThrowExceptionWhenTaskNotFound() {
            when(taskRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.getTaskById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Task with ID 999 not found");
        }
    }

    @Nested
    @DisplayName("Update Task Status Tests")
    class UpdateTaskStatusTests {

        @Test
        @DisplayName("Should update task status successfully")
        void shouldUpdateStatusSuccessfully() {
            Task existingTask = new Task(5L, "Task to update", "Desc", TaskStatus.TODO, sampleDueDateTime);
            existingTask.setCreatedAt(OffsetDateTime.now());
            existingTask.setUpdatedAt(OffsetDateTime.now());

            Task updatedTask = new Task(5L, "Task to update", "Desc", TaskStatus.COMPLETED, sampleDueDateTime);
            updatedTask.setCreatedAt(existingTask.getCreatedAt());
            updatedTask.setUpdatedAt(OffsetDateTime.now());

            when(taskRepository.findById(5L)).thenReturn(Optional.of(existingTask));
            when(taskRepository.save(existingTask)).thenReturn(updatedTask);

            UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.COMPLETED);
            TaskResponse response = taskService.updateTaskStatus(5L, request);

            assertThat(response.status()).isEqualTo(TaskStatus.COMPLETED);
            verify(taskRepository).save(existingTask);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when updating non-existent task")
        void shouldThrowWhenUpdatingNonExistentTask() {
            when(taskRepository.findById(404L)).thenReturn(Optional.empty());

            UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.IN_PROGRESS);

            assertThatThrownBy(() -> taskService.updateTaskStatus(404L, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Task with ID 404 not found");

            verify(taskRepository, never()).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw InvalidTaskStatusException when status is null")
        void shouldThrowWhenStatusIsNull() {
            UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(null);

            assertThatThrownBy(() -> taskService.updateTaskStatus(1L, request))
                    .isInstanceOf(InvalidTaskStatusException.class)
                    .hasMessage("Task status cannot be null");

            verify(taskRepository, never()).findById(any());
        }
    }

    @Nested
    @DisplayName("Delete Task Tests")
    class DeleteTaskTests {

        @Test
        @DisplayName("Should delete task successfully when it exists")
        void shouldDeleteTaskSuccessfully() {
            Task existingTask = new Task(8L, "Task to delete", null, TaskStatus.TODO, sampleDueDateTime);
            when(taskRepository.findById(8L)).thenReturn(Optional.of(existingTask));

            taskService.deleteTask(8L);

            verify(taskRepository).delete(existingTask);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when deleting non-existent task")
        void shouldThrowWhenDeletingNonExistentTask() {
            when(taskRepository.findById(888L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> taskService.deleteTask(888L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Task with ID 888 not found");

            verify(taskRepository, never()).delete(any(Task.class));
        }
    }
}

