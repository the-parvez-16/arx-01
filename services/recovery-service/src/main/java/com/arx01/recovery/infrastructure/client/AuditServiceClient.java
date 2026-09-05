package com.arx01.recovery.infrastructure.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.UUID;

@Component
public class AuditServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AuditServiceClient.class);

    private final RestClient restClient;

    public AuditServiceClient(
            @Value("${services.audit.base-url}") String baseUrl
    ) {
        this.restClient = RestClient.create(baseUrl);
    }

    public void sendAuditEvent(
            UUID merchantId,
            UUID recoveryCaseId,
            String eventType,
            String actorType,
            UUID actorId,
            Object payload
    ) {
        try {
            restClient.post()
                    .uri("/api/v1/audit-events")
                    .body(Map.of(
                            "merchantId", merchantId,
                            "recoveryCaseId", recoveryCaseId,
                            "eventType", eventType,
                            "actorType", actorType,
                            "actorId", actorId,
                            "payload", payload
                    ))
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Could not send audit event: {} for case: {}. Error: {}", eventType, recoveryCaseId, ex.getMessage());
        }
    }
}
