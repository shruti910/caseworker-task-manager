package uk.gov.hmcts.dts.taskmanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

@Schema(description = "Task response data transfer object")
public record TaskResponse(
                @Schema(description = "Unique identifier of the task", example = "1") Long id,

                @Schema(description = "Title of the task", example = "Review appeal documents") String title,

                @Schema(description = "Description of the task", example = "Verify witness statements") String description,

                @Schema(description = "Current status of the task", example = "TODO") TaskStatus status,

                @Schema(description = "Due date and time", example = "2026-11-20T17:00:00Z") OffsetDateTime dueDateTime,

                @Schema(description = "Timestamp when the task was created", example = "2026-11-05T00:00:00Z") OffsetDateTime createdAt,

                @Schema(description = "Timestamp when the task was last updated", example = "2026-11-05T00:00:00Z") OffsetDateTime updatedAt) {
}
