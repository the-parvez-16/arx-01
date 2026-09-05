package com.arx01.audit.presentation.dto;

import com.arx01.audit.domain.enums.AuditEventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateAuditEventRequest(
        @NotNull UUID merchantId,
        @NotNull UUID recoveryCaseId,
        @NotNull AuditEventType eventType,
        @NotBlank String actorType,
        @NotNull UUID actorId,
        @NotBlank String payload
) {
}
