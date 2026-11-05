package uk.gov.hmcts.dts.taskmanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;
import java.util.List;

@Schema(description = "Standard API error response structure")
public record ErrorResponse(
        @Schema(description = "Timestamp of the error", example = "2026-11-05T00:00:00Z")
        OffsetDateTime timestamp,

        @Schema(description = "HTTP status code", example = "400")
        int status,

        @Schema(description = "HTTP error title", example = "Bad Request")
        String error,

        @Schema(description = "Descriptive error message", example = "Validation failed for one or more fields")
        String message,

        @Schema(description = "Request URI path", example = "/api/tasks")
        String path,

        @Schema(description = "Field-level validation error details")
        List<FieldErrorDetail> fieldErrors
) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(OffsetDateTime.now(), status, error, message, path, List.of());
    }

    public ErrorResponse(int status, String error, String message, String path, List<FieldErrorDetail> fieldErrors) {
        this(OffsetDateTime.now(), status, error, message, path, fieldErrors != null ? fieldErrors : List.of());
    }
}

