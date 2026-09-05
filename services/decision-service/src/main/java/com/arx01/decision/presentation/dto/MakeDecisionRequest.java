package com.arx01.decision.presentation.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.util.UUID;

public record MakeDecisionRequest(
        @NotNull(message = "recoveryCaseId must not be null")
        UUID recoveryCaseId,

        @NotNull(message = "paymentId must not be null")
        UUID paymentId,

        @NotNull(message = "amountAtRisk must not be null")
        @Positive(message = "amountAtRisk must be positive")
        BigDecimal amountAtRisk,

        @NotBlank(message = "failureReason must not be blank")
        String failureReason,

        @Min(value = 0, message = "attemptCount must be non-negative")
        int attemptCount
) {
}
