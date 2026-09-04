package com.arx01.payment.presentation.dto;

import com.arx01.payment.domain.enums.PaymentFailureReason;
import jakarta.validation.constraints.NotNull;

public record SimulatePaymentFailureRequest(
        @NotNull PaymentFailureReason failureReason
) {
}
