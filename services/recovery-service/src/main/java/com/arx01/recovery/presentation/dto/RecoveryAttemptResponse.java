package com.arx01.recovery.presentation.dto;

import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.domain.enums.RecoveryOutcome;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecoveryAttemptResponse(
        UUID id,
        UUID recoveryCaseId,
        Integer attemptNo,
        RecoveryAction action,
        Instant scheduledAt,
        Instant executedAt,
        RecoveryOutcome outcome,
        BigDecimal amountRecovered,
        Instant createdAt
) {
}
