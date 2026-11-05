package uk.gov.hmcts.dts.taskmanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.OffsetDateTime;

@Schema(description = "Request payload for creating a task")
public record CreateTaskRequest(
                @Schema(description = "Title of the task", example = "Review appeal documents", requiredMode = Schema.RequiredMode.REQUIRED) @NotBlank(message = "Title cannot be blank") @Size(max = 150, message = "Title must not exceed 150 characters") String title,

                @Schema(description = "Detailed description of the task", example = "Verify witness statements..") @Size(max = 2000, message = "Description must not exceed 2000 characters") String description,

                @Schema(description = "Initial task status, defaults to TODO if not supplied", example = "TODO") TaskStatus status,

                @Schema(description = "Due date and time for the task", example = "2026-11-20T17:00:00Z", requiredMode = Schema.RequiredMode.REQUIRED) @NotNull(message = "Due date and time cannot be null") OffsetDateTime dueDateTime) {
}
