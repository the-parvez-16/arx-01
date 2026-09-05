package com.arx01.recovery.policy;

import com.arx01.recovery.domain.RecoveryCase;
import com.arx01.recovery.domain.enums.RecoveryAction;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class RecoveryPolicyEngine {

    public static final int MAX_ATTEMPTS = 3;

    public PolicyDecision evaluate(RecoveryCase recoveryCase, RecoveryAction action, int currentAttemptCount) {
        if (recoveryCase == null || recoveryCase.isTerminal()) {
            return PolicyDecision.BLOCKED;
        }

        if (action == null || action == RecoveryAction.NO_ACTION) {
            return PolicyDecision.BLOCKED;
        }

        if (currentAttemptCount >= MAX_ATTEMPTS) {
            return PolicyDecision.BLOCKED;
        }

        if (recoveryCase.getAmountAtRisk() == null || recoveryCase.getAmountAtRisk().compareTo(BigDecimal.ZERO) <= 0) {
            return PolicyDecision.BLOCKED;
        }

        return PolicyDecision.ALLOWED;
    }
}
