package com.arx01.payment.presentation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequest(
        @NotNull UUID merchantId,
        @NotNull UUID customerId,
        @NotNull UUID subscriptionId,
        @NotNull
        @DecimalMin(value = "0.00", inclusive = false)
        @Digits(integer = 10, fraction = 2)
        BigDecimal amount,
        @NotNull
        @Pattern(regexp = "^[A-Z]{3}$")
        String currency
) {
}
