package com.arx01.recovery.presentation.dto;

import com.arx01.recovery.domain.RecoveryCase;
import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.domain.enums.RecoveryStatus;
import com.arx01.recovery.infrastructure.client.dto.DecisionResponse;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record CreateRecoveryCaseResponse(
        UUID id,
        UUID merchantId,
        UUID paymentId,
        RecoveryStatus status,
        BigDecimal riskScore,
        BigDecimal amountAtRisk,
        RecoveryAction recommendedAction,
        RecoveryAction executedAction,
        Instant createdAt,
        Instant resolvedAt,
        BigDecimal aiConfidence,
        String aiReason
) {
    public static CreateRecoveryCaseResponse from(RecoveryCase recoveryCase, DecisionResponse decision) {
        return new CreateRecoveryCaseResponse(
                recoveryCase.getId(),
                recoveryCase.getMerchantId(),
                recoveryCase.getPaymentId(),
                recoveryCase.getStatus(),
                recoveryCase.getRiskScore(),
                recoveryCase.getAmountAtRisk(),
                recoveryCase.getRecommendedAction(),
                recoveryCase.getExecutedAction(),
                recoveryCase.getCreatedAt(),
                recoveryCase.getResolvedAt(),
                decision.confidence(),
                decision.reason()
        );
    }
}
