package com.arx01.recovery.presentation.dto;

import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.domain.enums.RecoveryStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecoveryCaseResponse(
        UUID id,
        UUID merchantId,
        UUID paymentId,
        RecoveryStatus status,
        BigDecimal riskScore,
        BigDecimal amountAtRisk,
        RecoveryAction recommendedAction,
        RecoveryAction executedAction,
        Instant createdAt,
        Instant resolvedAt
) {
}
