package com.arx01.recovery.infrastructure.client.dto;

import com.arx01.recovery.domain.enums.RecoveryAction;

import java.math.BigDecimal;

public record DecisionResponse(
        BigDecimal riskScore,
        RecoveryAction recommendedAction,
        BigDecimal confidence,
        String reason
) {
}
