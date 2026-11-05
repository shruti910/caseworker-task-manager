package uk.gov.hmcts.dts.taskmanager.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Validation failure details for a specific field")
public record FieldErrorDetail(
        @Schema(description = "Name of the invalid field", example = "title")
        String field,

        @Schema(description = "Validation message describing the error", example = "Title cannot be blank")
        String message
) {
}

