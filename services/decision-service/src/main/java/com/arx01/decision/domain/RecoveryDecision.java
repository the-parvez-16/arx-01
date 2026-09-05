package com.arx01.decision.domain;

import com.arx01.decision.domain.enums.RecoveryAction;

import java.math.BigDecimal;
import java.util.Objects;

public record RecoveryDecision(
        BigDecimal riskScore,
        RecoveryAction recommendedAction,
        BigDecimal confidence,
        String reason
) {
    public RecoveryDecision {
        Objects.requireNonNull(riskScore, "riskScore must not be null");
        if (riskScore.compareTo(BigDecimal.ZERO) < 0 || riskScore.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("riskScore must be between 0 and 1, got: " + riskScore);
        }

        Objects.requireNonNull(recommendedAction, "recommendedAction must not be null");

        Objects.requireNonNull(confidence, "confidence must not be null");
        if (confidence.compareTo(BigDecimal.ZERO) < 0 || confidence.compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("confidence must be between 0 and 1, got: " + confidence);
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("reason must not be null or blank");
        }
    }
}
