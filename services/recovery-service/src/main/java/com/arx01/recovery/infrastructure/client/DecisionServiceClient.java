package com.arx01.recovery.infrastructure.client;

import com.arx01.recovery.infrastructure.client.dto.DecisionResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
public class DecisionServiceClient {

    private final RestClient restClient;

    public DecisionServiceClient(
            @Value("${services.decision.base-url}") String baseUrl
    ) {
        this.restClient = RestClient.create(baseUrl);
    }

    public DecisionResponse makeDecision(
            UUID recoveryCaseId,
            UUID paymentId,
            BigDecimal amountAtRisk,
            String failureReason,
            int attemptCount
    ) {
        return restClient.post()
                .uri("/api/v1/decisions")
                .body(Map.of(
                        "recoveryCaseId", recoveryCaseId,
                        "paymentId", paymentId,
                        "amountAtRisk", amountAtRisk,
                        "failureReason", failureReason,
                        "attemptCount", attemptCount
                ))
                .retrieve()
                .body(DecisionResponse.class);
    }
}
