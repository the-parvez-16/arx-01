package com.arx01.payment.presentation.dto;

import com.arx01.payment.domain.enums.PaymentFailureReason;
import com.arx01.payment.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
        UUID id,
        UUID merchantId,
        UUID customerId,
        UUID subscriptionId,
        BigDecimal amount,
        String currency,
        PaymentStatus status,
        PaymentFailureReason failureReason,
        Integer attemptCount,
        Instant failedAt,
        Instant recoveredAt,
        Instant createdAt
) {
}
