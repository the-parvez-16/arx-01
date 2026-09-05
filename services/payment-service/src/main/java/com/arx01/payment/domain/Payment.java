package com.arx01.payment.domain;

import com.arx01.payment.domain.enums.PaymentFailureReason;
import com.arx01.payment.domain.enums.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "merchant_id", nullable = false)
    private Merchant merchant;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subscription_id", nullable = false)
    private Subscription subscription;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @JdbcTypeCode(SqlTypes.CHAR)
    @Column(name = "currency", nullable = false, length = 3, columnDefinition = "char(3)")
    private String currency;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "payment_status")
    private PaymentStatus status;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "failure_reason", columnDefinition = "payment_failure_reason")
    private PaymentFailureReason failureReason;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "failed_at")
    private Instant failedAt;

    @Column(name = "recovered_at")
    private Instant recoveredAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public static Payment create(
            Merchant merchant,
            Customer customer,
            Subscription subscription,
            BigDecimal amount,
            String currency
    ) {
        Payment payment = new Payment();
        payment.id = UUID.randomUUID();
        payment.merchant = merchant;
        payment.customer = customer;
        payment.subscription = subscription;
        payment.amount = amount;
        payment.currency = currency;
        payment.status = PaymentStatus.PENDING;
        payment.attemptCount = 0;
        payment.createdAt = Instant.now();
        return payment;
    }

    public void markFailed(PaymentFailureReason failureReason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = Objects.requireNonNull(failureReason, "failureReason must not be null");
        this.failedAt = Instant.now();
        this.attemptCount++;
    }

    public void retry() {
        if (this.status != PaymentStatus.FAILED) {
            throw new IllegalStateException("Payment can only be retried when in FAILED status. Current status: " + this.status);
        }
        this.status = PaymentStatus.SUCCEEDED;
        this.recoveredAt = Instant.now();
        this.attemptCount++;
    }
}
