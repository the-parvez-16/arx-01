package com.arx01.payment.domain.enums;

public enum PaymentFailureReason {
    INSUFFICIENT_FUNDS,
    CARD_EXPIRED,
    BANK_DECLINED,
    NETWORK_ERROR,
    LIMIT_EXCEEDED
}
