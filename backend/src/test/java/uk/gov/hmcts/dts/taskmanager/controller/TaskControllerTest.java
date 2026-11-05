package uk.gov.hmcts.dts.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;
import uk.gov.hmcts.dts.taskmanager.exception.ResourceNotFoundException;
import uk.gov.hmcts.dts.taskmanager.service.TaskService;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TaskController.class)
@DisplayName("TaskController Web MVC Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private final OffsetDateTime sampleDueDateTime = OffsetDateTime.parse("2026-11-20T17:00:00Z");

    @Nested
    @DisplayName("POST /api/tasks")
    class CreateTaskTests {

        @Test
        @DisplayName("Should successfully create a task and return 201 Created with Location header")
        void shouldCreateTaskSuccessfully() throws Exception {
            CreateTaskRequest request = new CreateTaskRequest(
                    "Review Immigration Appeal",
                    "Detailed review of applicant grounds",
                    TaskStatus.TODO,
                    sampleDueDateTime
            );

            TaskResponse response = new TaskResponse(
                    1L,
                    "Review Immigration Appeal",
                    "Detailed review of applicant grounds",
                    TaskStatus.TODO,
                    sampleDueDateTime,
                    OffsetDateTime.now(),
                    OffsetDateTime.now()
            );

            when(taskService.createTask(any(CreateTaskRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(header().string("Location", containsString("/api/tasks/1")))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.title", is("Review Immigration Appeal")))
                    .andExpect(jsonPath("$.description", is("Detailed review of applicant grounds")))
                    .andExpect(jsonPath("$.status", is("TODO")))
                    .andExpect(jsonPath("$.dueDateTime", notNullValue()));
        }

        @Test
        @DisplayName("Should reject task creation when title is blank")
        void shouldRejectBlankTitle() throws Exception {
            CreateTaskRequest request = new CreateTaskRequest(
                    "   ",
                    "Description here",
                    TaskStatus.TODO,
                    sampleDueDateTime
            );

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.error", is("Bad Request")))
                    .andExpect(jsonPath("$.fieldErrors[0].field", is("title")));
        }

        @Test
        @DisplayName("Should reject task creation when title exceeds 150 characters")
        void shouldRejectOverlongTitle() throws Exception {
            String longTitle = "A".repeat(151);
            CreateTaskRequest request = new CreateTaskRequest(
                    longTitle,
                    "Description",
                    TaskStatus.TODO,
                    sampleDueDateTime
            );

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors[0].field", is("title")));
        }

        @Test
        @DisplayName("Should reject task creation when due date is null")
        void shouldRejectNullDueDate() throws Exception {
            CreateTaskRequest request = new CreateTaskRequest(
                    "Valid Title",
                    "Description",
                    TaskStatus.TODO,
                    null
            );

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.fieldErrors[0].field", is("dueDateTime")));
        }

        @Test
        @DisplayName("Should handle malformed JSON payload gracefully")
        void shouldHandleMalformedJson() throws Exception {
            String malformedJson = "{ title: 'Missing quotes', dueDateTime: ";

            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(malformedJson))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.message", containsString("Malformed request body")));
        }
    }

    @Nested
    @DisplayName("GET /api/tasks")
    class GetAllTasksTests {

        @Test
        @DisplayName("Should return empty list when no tasks exist")
        void shouldReturnEmptyList() throws Exception {
            when(taskService.getAllTasks(any(), any(), any())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/tasks"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }

        @Test
        @DisplayName("Should return all tasks sorted by due date ascending by default")
        void shouldReturnAllTasksSortedByDefault() throws Exception {
            TaskResponse task1 = new TaskResponse(1L, "Earlier task", null, TaskStatus.IN_PROGRESS, sampleDueDateTime, OffsetDateTime.now(), OffsetDateTime.now());
            TaskResponse task2 = new TaskResponse(2L, "Later task", null, TaskStatus.TODO, sampleDueDateTime.plusDays(2), OffsetDateTime.now(), OffsetDateTime.now());

            when(taskService.getAllTasks(any(), eq("dueDateTime"), eq("asc"))).thenReturn(List.of(task1, task2));

            mockMvc.perform(get("/api/tasks"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].title", is("Earlier task")))
                    .andExpect(jsonPath("$[1].title", is("Later task")));
        }

        @Test
        @DisplayName("Should filter tasks by status correctly")
        void shouldFilterByStatus() throws Exception {
            TaskResponse doneTask = new TaskResponse(3L, "Completed item", null, TaskStatus.COMPLETED, sampleDueDateTime, OffsetDateTime.now(), OffsetDateTime.now());

            when(taskService.getAllTasks(eq(TaskStatus.COMPLETED), any(), any())).thenReturn(List.of(doneTask));

            mockMvc.perform(get("/api/tasks").param("status", "COMPLETED"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].title", is("Completed item")))
                    .andExpect(jsonPath("$[0].status", is("COMPLETED")));
        }
    }

    @Nested
    @DisplayName("GET /api/tasks/{id}")
    class GetTaskByIdTests {

        @Test
        @DisplayName("Should retrieve task successfully by ID")
        void shouldGetTaskById() throws Exception {
            TaskResponse task = new TaskResponse(10L, "Target task", "Specific desc", TaskStatus.IN_PROGRESS, sampleDueDateTime, OffsetDateTime.now(), OffsetDateTime.now());

            when(taskService.getTaskById(10L)).thenReturn(task);

            mockMvc.perform(get("/api/tasks/{id}", 10L))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(10)))
                    .andExpect(jsonPath("$.title", is("Target task")))
                    .andExpect(jsonPath("$.status", is("IN_PROGRESS")));
        }

        @Test
        @DisplayName("Should return 404 when task ID does not exist")
        void shouldReturn404WhenNotFound() throws Exception {
            when(taskService.getTaskById(99999L)).thenThrow(new ResourceNotFoundException("Task with ID 99999 not found"));

            mockMvc.perform(get("/api/tasks/{id}", 99999L))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)))
                    .andExpect(jsonPath("$.error", is("Not Found")))
                    .andExpect(jsonPath("$.message", containsString("Task with ID 99999 not found")));
        }

        @Test
        @DisplayName("Should return 400 when task ID is non-numeric")
        void shouldReturn400ForNonNumericId() throws Exception {
            mockMvc.perform(get("/api/tasks/invalid-id"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.message", containsString("must be of type Long")));
        }
    }

    @Nested
    @DisplayName("PATCH /api/tasks/{id}/status")
    class UpdateTaskStatusTests {

        @Test
        @DisplayName("Should update task status successfully")
        void shouldUpdateStatusSuccessfully() throws Exception {
            UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.COMPLETED);
            TaskResponse updated = new TaskResponse(5L, "Status Test", null, TaskStatus.COMPLETED, sampleDueDateTime, OffsetDateTime.now(), OffsetDateTime.now());

            when(taskService.updateTaskStatus(eq(5L), any(UpdateTaskStatusRequest.class))).thenReturn(updated);

            mockMvc.perform(patch("/api/tasks/{id}/status", 5L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id", is(5)))
                    .andExpect(jsonPath("$.status", is("COMPLETED")));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent task")
        void shouldReturn404WhenTaskNotFound() throws Exception {
            UpdateTaskStatusRequest request = new UpdateTaskStatusRequest(TaskStatus.IN_PROGRESS);

            when(taskService.updateTaskStatus(eq(77777L), any(UpdateTaskStatusRequest.class)))
                    .thenThrow(new ResourceNotFoundException("Task with ID 77777 not found"));

            mockMvc.perform(patch("/api/tasks/{id}/status", 77777L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)));
        }

        @Test
        @DisplayName("Should return 400 when payload status is invalid")
        void shouldReturn400ForInvalidStatus() throws Exception {
            String invalidPayload = "{\"status\": \"UNKNOWN_STATUS\"}";

            mockMvc.perform(patch("/api/tasks/{id}/status", 1L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(invalidPayload))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)));
        }
    }

    @Nested
    @DisplayName("DELETE /api/tasks/{id}")
    class DeleteTaskTests {

        @Test
        @DisplayName("Should delete task successfully and return 204 No Content")
        void shouldDeleteTaskSuccessfully() throws Exception {
            doNothing().when(taskService).deleteTask(1L);

            mockMvc.perform(delete("/api/tasks/{id}", 1L))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent task")
        void shouldReturn404WhenDeletingNonExistentTask() throws Exception {
            doThrow(new ResourceNotFoundException("Task with ID 88888 not found")).when(taskService).deleteTask(88888L);

            mockMvc.perform(delete("/api/tasks/{id}", 88888L))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)));
        }
    }

    @Nested
    @DisplayName("Unsupported HTTP Method Tests")
    class UnsupportedMethodTests {

        @Test
        @DisplayName("Should return 405 Method Not Allowed when calling PUT on /api/tasks")
        void shouldReturn405ForPutOnCollection() throws Exception {
            mockMvc.perform(put("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andExpect(status().isMethodNotAllowed())
                    .andExpect(jsonPath("$.status", is(405)))
                    .andExpect(jsonPath("$.error", is("Method Not Allowed")));
        }
    }
}

