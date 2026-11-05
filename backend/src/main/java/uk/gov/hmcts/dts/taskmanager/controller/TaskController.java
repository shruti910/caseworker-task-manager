package uk.gov.hmcts.dts.taskmanager.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import uk.gov.hmcts.dts.taskmanager.dto.CreateTaskRequest;
import uk.gov.hmcts.dts.taskmanager.dto.ErrorResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskAuditLogResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskResponse;
import uk.gov.hmcts.dts.taskmanager.dto.TaskStatus;
import uk.gov.hmcts.dts.taskmanager.dto.UpdateTaskStatusRequest;
import uk.gov.hmcts.dts.taskmanager.service.TaskService;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping(path = "/api/tasks", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Tasks", description = "Endpoints for managing tasks lifecycle")
public class TaskController {

        private final TaskService taskService;

        public TaskController(TaskService taskService) {
                this.taskService = taskService;
        }

        @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Create a new task", description = "Creates a task with a title, optional description, status, and due date/time.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Task created successfully", headers = @Header(name = "Location", description = "URI of the created task resource"), content = @Content(schema = @Schema(implementation = TaskResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid input or validation constraint failed", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
                TaskResponse created = taskService.createTask(request);
                URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                                .path("/{id}")
                                .buildAndExpand(created.id())
                                .toUri();

                return ResponseEntity.created(location).body(created);
        }

        @GetMapping
        @Operation(summary = "Retrieve all tasks", description = "Returns all tasks, optionally filtered by status and sorted by specified field.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "List of tasks retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TaskResponse.class)))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<List<TaskResponse>> getAllTasks(
                        @Parameter(description = "Optional filter by task status (TODO, IN_PROGRESS, COMPLETED)") @RequestParam(required = false) TaskStatus status,

                        @Parameter(description = "Field to sort tasks by (dueDateTime, createdAt, updatedAt, title, status). Defaults to dueDateTime.") @RequestParam(required = false, defaultValue = "dueDateTime") String sortBy,

                        @Parameter(description = "Sort direction (asc, desc). Defaults to asc.") @RequestParam(required = false, defaultValue = "asc") String sortDirection) {
                List<TaskResponse> tasks = taskService.getAllTasks(status, sortBy, sortDirection);
                return ResponseEntity.ok(tasks);
        }

        @GetMapping("/{id}")
        @Operation(summary = "Retrieve a task by ID", description = "Retrieves complete details of a single task identified by its unique ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Task found and returned", content = @Content(schema = @Schema(implementation = TaskResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid task ID format", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Task not found with the specified ID", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<TaskResponse> getTaskById(
                        @Parameter(description = "Numeric ID of the task", required = true) @PathVariable Long id) {
                TaskResponse task = taskService.getTaskById(id);
                return ResponseEntity.ok(task);
        }

        @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
        @Operation(summary = "Update task status", description = "Updates the status of an existing task (TODO, IN_PROGRESS, COMPLETED).")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Task status updated successfully", content = @Content(schema = @Schema(implementation = TaskResponse.class))),
                        @ApiResponse(responseCode = "400", description = "Invalid status value provided", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Task not found with the specified ID", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<TaskResponse> updateTaskStatus(
                        @Parameter(description = "Numeric ID of the task", required = true) @PathVariable Long id,

                        @Valid @RequestBody UpdateTaskStatusRequest request) {
                TaskResponse updated = taskService.updateTaskStatus(id, request);
                return ResponseEntity.ok(updated);
        }

        @DeleteMapping("/{id}")
        @ResponseStatus(HttpStatus.NO_CONTENT)
        @Operation(summary = "Delete a task", description = "Deletes a task identified by its unique ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Task deleted successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid task ID format", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Task not found with the specified ID", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<Void> deleteTask(
                        @Parameter(description = "Numeric ID of the task", required = true) @PathVariable Long id) {
                taskService.deleteTask(id);
                return ResponseEntity.noContent().build();
        }

        @GetMapping("/{id}/audit-logs")
        @Operation(summary = "Retrieve audit log history for a task", description = "Returns the chronological audit trail for a task.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully", content = @Content(array = @ArraySchema(schema = @Schema(implementation = TaskAuditLogResponse.class)))),
                        @ApiResponse(responseCode = "400", description = "Invalid task ID format", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "404", description = "Task not found with the specified ID", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
                        @ApiResponse(responseCode = "500", description = "Unexpected internal server error", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
        })
        public ResponseEntity<List<TaskAuditLogResponse>> getTaskAuditLogs(
                        @Parameter(description = "Numeric ID of the task", required = true) @PathVariable Long id) {
                List<TaskAuditLogResponse> logs = taskService.getTaskAuditLogs(id);
                return ResponseEntity.ok(logs);
        }
}
