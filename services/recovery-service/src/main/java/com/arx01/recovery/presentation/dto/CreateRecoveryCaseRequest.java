package com.arx01.recovery.presentation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateRecoveryCaseRequest(
        @NotNull(message = "merchantId must not be null")
        UUID merchantId,

        @NotNull(message = "paymentId must not be null")
        UUID paymentId
) {
}
