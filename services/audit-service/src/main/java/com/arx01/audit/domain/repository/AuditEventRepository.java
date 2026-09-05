package com.arx01.audit.domain.repository;

import com.arx01.audit.domain.AuditEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AuditEventRepository extends JpaRepository<AuditEvent, UUID> {
    List<AuditEvent> findByRecoveryCaseIdOrderByCreatedAtAsc(UUID recoveryCaseId);
}
