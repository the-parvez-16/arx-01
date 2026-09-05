package com.arx01.decision.infrastructure;

import com.arx01.decision.domain.RecoveryDecision;
import com.arx01.decision.domain.enums.RecoveryAction;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class GroqDecisionClient {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public GroqDecisionClient(
            @Value("${groq.base-url}") String baseUrl,
            @Value("${groq.api-key}") String apiKey,
            @Value("${groq.model}") String model
    ) {
        this.restClient = RestClient.create(baseUrl);
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
    }

    public RecoveryDecision decide(
            UUID recoveryCaseId,
            UUID paymentId,
            BigDecimal amountAtRisk,
            String failureReason,
            int attemptCount
    ) {
        String systemPrompt = """
                You are ARX-01's AI Payment Recovery Decision Engine.
                Analyze the failed payment context and determine the risk score and recommended recovery action.
                Return ONLY a valid, raw JSON object (no markdown, no formatting) with this exact schema:
                {
                  "riskScore": <number between 0.0 and 1.0>,
                  "recommendedAction": "<one of: SMART_RETRY, PAYMENT_LINK, REMINDER, ESCALATE, NO_ACTION>",
                  "confidence": <number between 0.0 and 1.0>,
                  "reason": "<explanation for the decision>"
                }
                """;

        String userPrompt = String.format("""
                Recovery Case ID: %s
                Payment ID: %s
                Amount at Risk: %s
                Failure Reason: %s
                Attempt Count: %d
                """, recoveryCaseId, paymentId, amountAtRisk, failureReason, attemptCount);

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "response_format", Map.of("type", "json_object"),
                "temperature", 0.2
        );

        JsonNode responseNode = restClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(JsonNode.class);

        if (responseNode == null || !responseNode.has("choices") || responseNode.path("choices").isEmpty()) {
            throw new IllegalStateException("Empty or invalid response received from Groq API");
        }

        String content = responseNode.path("choices").get(0).path("message").path("content").asString();

        String rawJson = content.trim();
        if (rawJson.startsWith("```json")) {
            rawJson = rawJson.substring(7);
        } else if (rawJson.startsWith("```")) {
            rawJson = rawJson.substring(3);
        }
        if (rawJson.endsWith("```")) {
            rawJson = rawJson.substring(0, rawJson.length() - 3);
        }
        rawJson = rawJson.trim();

        try {
            JsonNode decisionNode = objectMapper.readTree(rawJson);
            BigDecimal riskScore = new BigDecimal(decisionNode.path("riskScore").asString());
            RecoveryAction recommendedAction = RecoveryAction.valueOf(decisionNode.path("recommendedAction").asString().trim());
            BigDecimal confidence = new BigDecimal(decisionNode.path("confidence").asString());
            String reason = decisionNode.path("reason").asString();

            return new RecoveryDecision(riskScore, recommendedAction, confidence, reason);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse Groq AI decision response: " + content, ex);
        }
    }
}
