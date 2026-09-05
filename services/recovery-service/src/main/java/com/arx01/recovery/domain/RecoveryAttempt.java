package com.arx01.recovery.domain;

import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.domain.enums.RecoveryOutcome;
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
@Table(name = "recovery_attempts")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RecoveryAttempt {

    @Id
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recovery_case_id", nullable = false)
    private RecoveryCase recoveryCase;

    @Column(name = "attempt_no", nullable = false)
    private Integer attemptNo;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "action", nullable = false, columnDefinition = "recovery_action")
    private RecoveryAction action;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "executed_at")
    private Instant executedAt;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "outcome", columnDefinition = "recovery_outcome")
    private RecoveryOutcome outcome;

    @Column(name = "amount_recovered", precision = 12, scale = 2)
    private BigDecimal amountRecovered;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    public static RecoveryAttempt schedule(
            RecoveryCase recoveryCase,
            Integer attemptNo,
            RecoveryAction action,
            Instant scheduledAt
    ) {
        Objects.requireNonNull(recoveryCase, "recoveryCase must not be null");
        Objects.requireNonNull(attemptNo, "attemptNo must not be null");
        Objects.requireNonNull(action, "action must not be null");
        Objects.requireNonNull(scheduledAt, "scheduledAt must not be null");

        RecoveryAttempt attempt = new RecoveryAttempt();
        attempt.id = UUID.randomUUID();
        attempt.recoveryCase = recoveryCase;
        attempt.attemptNo = attemptNo;
        attempt.action = action;
        attempt.scheduledAt = scheduledAt;
        attempt.createdAt = Instant.now();
        return attempt;
    }

    public void complete(RecoveryOutcome outcome, BigDecimal amountRecovered) {
        this.executedAt = Instant.now();
        this.outcome = Objects.requireNonNull(outcome, "outcome must not be null");
        this.amountRecovered = amountRecovered;
    }
}
