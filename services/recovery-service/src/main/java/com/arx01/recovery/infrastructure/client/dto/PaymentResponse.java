package com.arx01.recovery.infrastructure.client.dto;

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
        String status,
        String failureReason,
        Integer attemptCount,
        Instant failedAt,
        Instant recoveredAt,
        Instant createdAt
) {
}
