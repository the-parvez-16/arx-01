package com.arx01.recovery.domain;

import com.arx01.recovery.domain.enums.RecoveryAction;
import com.arx01.recovery.policy.PolicyDecision;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
@Table(name = "decision_logs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DecisionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recovery_case_id", nullable = false)
    private RecoveryCase recoveryCase;

    @Column(name = "model", nullable = false)
    private String model;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "recommendation", nullable = false, columnDefinition = "recovery_action")
    private RecoveryAction recommendation;

    @Column(name = "confidence", nullable = false, precision = 5, scale = 4)
    private BigDecimal confidence;

    @Column(name = "reason", nullable = false, columnDefinition = "text")
    private String reason;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "policy_decision", nullable = false, columnDefinition = "policy_decision")
    private PolicyDecision policyDecision;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    private DecisionLog(
            RecoveryCase recoveryCase,
            String model,
            RecoveryAction recommendation,
            BigDecimal confidence,
            String reason,
            PolicyDecision policyDecision
    ) {
        this.recoveryCase = Objects.requireNonNull(recoveryCase, "recoveryCase must not be null");
        this.model = Objects.requireNonNull(model, "model must not be null");
        this.recommendation = Objects.requireNonNull(recommendation, "recommendation must not be null");
        this.confidence = Objects.requireNonNull(confidence, "confidence must not be null");
        this.reason = Objects.requireNonNull(reason, "reason must not be null");
        this.policyDecision = Objects.requireNonNull(policyDecision, "policyDecision must not be null");
        this.createdAt = Instant.now();
    }

    public static DecisionLog create(
            RecoveryCase recoveryCase,
            String model,
            RecoveryAction recommendation,
            BigDecimal confidence,
            String reason,
            PolicyDecision policyDecision
    ) {
        return new DecisionLog(recoveryCase, model, recommendation, confidence, reason, policyDecision);
    }
}
