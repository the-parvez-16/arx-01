package com.arx01.recovery.application;

import com.arx01.recovery.domain.RecoveryAttempt;
import com.arx01.recovery.domain.RecoveryCase;
import com.arx01.recovery.domain.enums.RecoveryOutcome;
import com.arx01.recovery.domain.enums.RecoveryStatus;
import com.arx01.recovery.domain.repository.RecoveryAttemptRepository;
import com.arx01.recovery.domain.repository.RecoveryCaseRepository;
import com.arx01.recovery.infrastructure.client.AuditServiceClient;
import com.arx01.recovery.infrastructure.client.DecisionServiceClient;
import com.arx01.recovery.infrastructure.client.PaymentServiceClient;
import com.arx01.recovery.infrastructure.client.dto.DecisionResponse;
import com.arx01.recovery.infrastructure.client.dto.PaymentResponse;
import com.arx01.recovery.policy.PolicyDecision;
import com.arx01.recovery.policy.RecoveryPolicyEngine;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecoveryApplicationService {

    private final RecoveryCaseRepository recoveryCaseRepository;
    private final RecoveryAttemptRepository recoveryAttemptRepository;
    private final RecoveryPolicyEngine recoveryPolicyEngine;
    private final PaymentServiceClient paymentServiceClient;
    private final DecisionServiceClient decisionServiceClient;
    private final AuditServiceClient auditServiceClient;

    @Transactional
    public RecoveryCase createRecoveryCase(UUID merchantId, UUID paymentId) {
        if (recoveryCaseRepository.findByPaymentId(paymentId).isPresent()) {
            throw new IllegalStateException("Recovery case already exists for payment: " + paymentId);
        }

        PaymentResponse payment = paymentServiceClient.getPayment(paymentId);

        BigDecimal amountAtRisk = payment.amount();
        String failureReason = payment.failureReason();
        int attemptCount = payment.attemptCount();

        UUID recoveryCaseId = UUID.randomUUID();

        DecisionResponse decision = decisionServiceClient.makeDecision(
                recoveryCaseId,
                paymentId,
                amountAtRisk,
                failureReason,
                attemptCount
        );

        RecoveryCase recoveryCase = RecoveryCase.create(
                recoveryCaseId,
                merchantId,
                paymentId,
                amountAtRisk,
                decision.riskScore(),
                decision.recommendedAction()
        );
        recoveryCase = recoveryCaseRepository.save(recoveryCase);

        auditServiceClient.sendAuditEvent(
                merchantId,
                recoveryCase.getId(),
                "AI_RECOMMENDATION",
                "SYSTEM",
                merchantId,
                Map.of(
                        "riskScore", decision.riskScore(),
                        "recommendedAction", decision.recommendedAction(),
                        "confidence", decision.confidence(),
                        "reason", decision.reason()
                )
        );

        return recoveryCase;
    }

    @Transactional
    public RecoveryCase executeRecoveryCase(UUID caseId) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(caseId)
                .orElseThrow(() -> new EntityNotFoundException("Recovery case not found: " + caseId));

        if (recoveryCase.isTerminal()) {
            throw new IllegalStateException("Cannot execute recovery on terminal case: " + recoveryCase.getStatus());
        }

        int attemptNo = recoveryAttemptRepository
                .findTopByRecoveryCaseIdOrderByAttemptNoDesc(caseId)
                .map(lastAttempt -> lastAttempt.getAttemptNo() + 1)
                .orElse(1);

        PolicyDecision policyDecision = recoveryPolicyEngine.evaluate(
                recoveryCase,
                recoveryCase.getRecommendedAction(),
                attemptNo - 1
        );

        if (policyDecision == PolicyDecision.BLOCKED) {
            RecoveryAttempt attempt = RecoveryAttempt.schedule(
                    recoveryCase,
                    attemptNo,
                    recoveryCase.getRecommendedAction(),
                    Instant.now()
            );
            attempt.complete(RecoveryOutcome.BLOCKED, null);
            recoveryAttemptRepository.save(attempt);

            if (attemptNo >= RecoveryPolicyEngine.MAX_ATTEMPTS) {
                recoveryCase.markExhausted();
                recoveryCaseRepository.save(recoveryCase);
            }

            auditServiceClient.sendAuditEvent(
                    recoveryCase.getMerchantId(),
                    recoveryCase.getId(),
                    "POLICY_BLOCKED",
                    "SYSTEM",
                    recoveryCase.getMerchantId(),
                    Map.of()
            );

            return recoveryCase;
        }

        recoveryCase.startProcessing(recoveryCase.getRecommendedAction());

        PaymentResponse paymentResponse = paymentServiceClient.retryPayment(recoveryCase.getPaymentId());

        RecoveryAttempt attempt = RecoveryAttempt.schedule(
                recoveryCase,
                attemptNo,
                recoveryCase.getRecommendedAction(),
                Instant.now()
        );

        boolean isSucceeded = paymentResponse != null && "SUCCEEDED".equals(paymentResponse.status());
        RecoveryOutcome outcome = isSucceeded ? RecoveryOutcome.SUCCEEDED : RecoveryOutcome.FAILED;
        BigDecimal amountRecovered = isSucceeded ? paymentResponse.amount() : null;

        attempt.complete(outcome, amountRecovered);
        recoveryAttemptRepository.save(attempt);

        if (isSucceeded) {
            recoveryCase.markRecovered();
            recoveryCaseRepository.save(recoveryCase);
        } else {
            if (attemptNo >= RecoveryPolicyEngine.MAX_ATTEMPTS) {
                recoveryCase.markExhausted();
            }
            recoveryCaseRepository.save(recoveryCase);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("attemptNo", attemptNo);
        payload.put("action", recoveryCase.getRecommendedAction());
        payload.put("outcome", outcome);
        payload.put("amountRecovered", amountRecovered);

        String eventType = isSucceeded ? "PAYMENT_RECOVERED" : "ACTION_EXECUTED";

        auditServiceClient.sendAuditEvent(
                recoveryCase.getMerchantId(),
                recoveryCase.getId(),
                eventType,
                "SYSTEM",
                recoveryCase.getMerchantId(),
                payload
        );

        return recoveryCase;
    }

    @Transactional(readOnly = true)
    public RecoveryCase getById(UUID caseId) {
        return recoveryCaseRepository.findById(caseId)
                .orElseThrow(() -> new EntityNotFoundException("Recovery case not found: " + caseId));
    }

    @Transactional(readOnly = true)
    public List<RecoveryCase> listCases(UUID merchantId, RecoveryStatus status) {
        if (merchantId != null && status != null) {
            return recoveryCaseRepository.findByMerchantIdAndStatus(merchantId, status);
        } else if (merchantId != null) {
            return recoveryCaseRepository.findByMerchantId(merchantId);
        } else if (status != null) {
            return recoveryCaseRepository.findByStatus(status);
        }
        return recoveryCaseRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<RecoveryAttempt> listAttempts(UUID caseId) {
        if (!recoveryCaseRepository.existsById(caseId)) {
            throw new EntityNotFoundException("Recovery case not found: " + caseId);
        }
        return recoveryAttemptRepository.findByRecoveryCaseIdOrderByAttemptNoAsc(caseId);
    }

    @Transactional
    public RecoveryCase cancelRecoveryCase(UUID caseId) {
        RecoveryCase recoveryCase = recoveryCaseRepository.findById(caseId)
                .orElseThrow(() -> new EntityNotFoundException("Recovery case not found: " + caseId));

        recoveryCase.cancel();
        return recoveryCaseRepository.save(recoveryCase);
    }
}
