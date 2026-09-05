package com.arx01.decision.application;

import com.arx01.decision.domain.RecoveryDecision;
import com.arx01.decision.infrastructure.GroqDecisionClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class DecisionApplicationService {

    private final GroqDecisionClient groqDecisionClient;

    public DecisionApplicationService(GroqDecisionClient groqDecisionClient) {
        this.groqDecisionClient = groqDecisionClient;
    }

    public RecoveryDecision makeDecision(
            UUID recoveryCaseId,
            UUID paymentId,
            BigDecimal amountAtRisk,
            String failureReason,
            int attemptCount
    ) {
        return groqDecisionClient.decide(
                recoveryCaseId,
                paymentId,
                amountAtRisk,
                failureReason,
                attemptCount
        );
    }
}
