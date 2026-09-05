package com.arx01.audit.domain;

import com.arx01.audit.domain.enums.AuditEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_events")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "recovery_case_id", nullable = false)
    private UUID recoveryCaseId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AuditEventType eventType;

    @Column(name = "actor_type", nullable = false)
    private String actorType;

    @Column(name = "actor_id", nullable = false)
    private UUID actorId;

    @Column(name = "payload", columnDefinition = "jsonb", nullable = false)
    private String payload;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    private AuditEvent(
            UUID merchantId,
            UUID recoveryCaseId,
            AuditEventType eventType,
            String actorType,
            UUID actorId,
            String payload
    ) {
        this.merchantId = merchantId;
        this.recoveryCaseId = recoveryCaseId;
        this.eventType = eventType;
        this.actorType = actorType;
        this.actorId = actorId;
        this.payload = payload;
        this.createdAt = Instant.now();
    }

    public static AuditEvent create(
            UUID merchantId,
            UUID recoveryCaseId,
            AuditEventType eventType,
            String actorType,
            UUID actorId,
            String payload
    ) {
        return new AuditEvent(merchantId, recoveryCaseId, eventType, actorType, actorId, payload);
    }
}
