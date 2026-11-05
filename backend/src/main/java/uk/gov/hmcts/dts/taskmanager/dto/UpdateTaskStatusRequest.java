package uk.gov.hmcts.dts.taskmanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for updating task status")
public record UpdateTaskStatusRequest(
        @Schema(description = "New status for the task", example = "IN_PROGRESS", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "Status cannot be null")
        TaskStatus status
) {
}

