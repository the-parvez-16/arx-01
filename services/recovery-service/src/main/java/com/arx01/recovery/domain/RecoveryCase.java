package com.arx01.recovery.domain;

import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.domain.enums.RecoveryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
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
@Table(name = "recovery_cases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecoveryCase {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "recovery_status")
    private RecoveryStatus status;

    @Column(name = "risk_score", nullable = false, precision = 5, scale = 4)
    private BigDecimal riskScore;

    @Column(name = "amount_at_risk", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountAtRisk;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "recommended_action", nullable = false, columnDefinition = "recovery_action")
    private RecoveryAction recommendedAction;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "executed_action", columnDefinition = "recovery_action")
    private RecoveryAction executedAction;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    public static RecoveryCase create(
            UUID id,
            UUID merchantId,
            UUID paymentId,
            BigDecimal amountAtRisk,
            BigDecimal riskScore,
            RecoveryAction recommendedAction
    ) {
        Objects.requireNonNull(id, "id must not be null");
        Objects.requireNonNull(merchantId, "merchantId must not be null");
        Objects.requireNonNull(paymentId, "paymentId must not be null");
        Objects.requireNonNull(amountAtRisk, "amountAtRisk must not be null");
        Objects.requireNonNull(riskScore, "riskScore must not be null");
        Objects.requireNonNull(recommendedAction, "recommendedAction must not be null");

        RecoveryCase recoveryCase = new RecoveryCase();
        recoveryCase.id = id;
        recoveryCase.merchantId = merchantId;
        recoveryCase.paymentId = paymentId;
        recoveryCase.amountAtRisk = amountAtRisk;
        recoveryCase.riskScore = riskScore;
        recoveryCase.recommendedAction = recommendedAction;
        recoveryCase.status = RecoveryStatus.OPEN;
        recoveryCase.createdAt = Instant.now();
        return recoveryCase;
    }

    public void startProcessing(RecoveryAction action) {
        if (isTerminal()) {
            throw new IllegalStateException("Cannot start processing on terminal case: " + status);
        }
        this.status = RecoveryStatus.IN_PROGRESS;
        this.executedAction = Objects.requireNonNull(action, "action must not be null");
    }

    public void markRecovered() {
        if (this.status != RecoveryStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can only mark recovered from IN_PROGRESS state, current: " + status);
        }
        this.status = RecoveryStatus.RECOVERED;
        this.resolvedAt = Instant.now();
    }

    public void markExhausted() {
        if (isTerminal()) {
            throw new IllegalStateException("Cannot exhaust terminal case: " + status);
        }
        this.status = RecoveryStatus.EXHAUSTED;
        this.resolvedAt = Instant.now();
    }

    public void cancel() {
        if (isTerminal()) {
            throw new IllegalStateException("Cannot cancel terminal case: " + status);
        }
        this.status = RecoveryStatus.CANCELLED;
        this.resolvedAt = Instant.now();
    }

    public boolean isTerminal() {
        return this.status == RecoveryStatus.RECOVERED
                || this.status == RecoveryStatus.EXHAUSTED
                || this.status == RecoveryStatus.CANCELLED;
    }
}
