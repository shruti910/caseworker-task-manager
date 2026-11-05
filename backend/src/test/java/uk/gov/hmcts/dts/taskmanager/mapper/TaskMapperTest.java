package uk.gov.hmcts.dts.taskmanager.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.entity.Task;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("TaskMapper Unit Tests")
class TaskMapperTest {

    private TaskMapper taskMapper;
    private final OffsetDateTime sampleDueDateTime = OffsetDateTime.parse("2026-11-20T17:00:00Z");

    @BeforeEach
    void setUp() {
        taskMapper = new TaskMapper();
    }

    @Test
    @DisplayName("Should map CreateTaskRequest to Task entity correctly and trim strings")
    void shouldMapCreateRequestToEntity() {
        CreateTaskRequest request = new CreateTaskRequest(
                "  Review document bundle  ",
                "  Check pages 1-50  ",
                TaskStatus.IN_PROGRESS,
                sampleDueDateTime
        );

        Task entity = taskMapper.toEntity(request);

        assertThat(entity).isNotNull();
        assertThat(entity.getTitle()).isEqualTo("Review document bundle");
        assertThat(entity.getDescription()).isEqualTo("Check pages 1-50");
        assertThat(entity.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(entity.getDueDateTime()).isEqualTo(sampleDueDateTime);
    }

    @Test
    @DisplayName("Should default status to TODO when request status is null")
    void shouldDefaultStatusToTodo() {
        CreateTaskRequest request = new CreateTaskRequest(
                "Draft decision",
                null,
                null,
                sampleDueDateTime
        );

        Task entity = taskMapper.toEntity(request);

        assertThat(entity).isNotNull();
        assertThat(entity.getStatus()).isEqualTo(TaskStatus.TODO);
        assertThat(entity.getDescription()).isNull();
    }

    @Test
    @DisplayName("Should return null when mapping null request or null entity")
    void shouldReturnNullForNullInput() {
        assertThat(taskMapper.toEntity(null)).isNull();
        assertThat(taskMapper.toResponse(null)).isNull();
    }

    @Test
    @DisplayName("Should map Task entity to TaskResponse DTO correctly")
    void shouldMapEntityToResponse() {
        Task task = new Task(100L, "File court record", "Record all exhibits", TaskStatus.COMPLETED, sampleDueDateTime);
        OffsetDateTime created = OffsetDateTime.parse("2026-11-01T09:00:00Z");
        OffsetDateTime updated = OffsetDateTime.parse("2026-11-02T10:00:00Z");
        task.setCreatedAt(created);
        task.setUpdatedAt(updated);

        TaskResponse response = taskMapper.toResponse(task);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(100L);
        assertThat(response.title()).isEqualTo("File court record");
        assertThat(response.description()).isEqualTo("Record all exhibits");
        assertThat(response.status()).isEqualTo(TaskStatus.COMPLETED);
        assertThat(response.dueDateTime()).isEqualTo(sampleDueDateTime);
        assertThat(response.createdAt()).isEqualTo(created);
        assertThat(response.updatedAt()).isEqualTo(updated);
    }
}

