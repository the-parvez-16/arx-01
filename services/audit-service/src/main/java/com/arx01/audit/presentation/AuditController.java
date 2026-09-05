package com.arx01.audit.presentation;

import com.arx01.audit.application.AuditApplicationService;
import com.arx01.audit.domain.AuditEvent;
import com.arx01.audit.presentation.dto.CreateAuditEventRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-events")
public class AuditController {

    private final AuditApplicationService auditApplicationService;

    public AuditController(AuditApplicationService auditApplicationService) {
        this.auditApplicationService = auditApplicationService;
    }

    @PostMapping
    public AuditEvent createAuditEvent(
            @Valid @RequestBody CreateAuditEventRequest request
    ) {
        return auditApplicationService.createAuditEvent(
                request.merchantId(),
                request.recoveryCaseId(),
                request.eventType(),
                request.actorType(),
                request.actorId(),
                request.payload()
        );
    }

    @GetMapping
    public List<AuditEvent> getAuditEvents(@RequestParam UUID recoveryCaseId) {
        return auditApplicationService.getAuditEventsByRecoveryCaseId(recoveryCaseId);
    }
}
