package com.arx01.audit.application;

import com.arx01.audit.domain.AuditEvent;
import com.arx01.audit.domain.enums.AuditEventType;
import com.arx01.audit.domain.repository.AuditEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuditApplicationService {

    private final AuditEventRepository auditEventRepository;

    public AuditApplicationService(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    @Transactional
    public AuditEvent createAuditEvent(
            UUID merchantId,
            UUID recoveryCaseId,
            AuditEventType eventType,
            String actorType,
            UUID actorId,
            String payload
    ) {
        AuditEvent auditEvent = AuditEvent.create(
                merchantId,
                recoveryCaseId,
                eventType,
                actorType,
                actorId,
                payload
        );
        return auditEventRepository.save(auditEvent);
    }
}
