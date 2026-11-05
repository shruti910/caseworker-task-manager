package uk.gov.hmcts.dts.taskmanager.dto;

import java.time.OffsetDateTime;

public record TaskAuditLogResponse(
        Long id,
        Long taskId,
        AuditAction action,
        String changedFields,
        String previousState,
        String newState,
        OffsetDateTime createdAt
) {}

