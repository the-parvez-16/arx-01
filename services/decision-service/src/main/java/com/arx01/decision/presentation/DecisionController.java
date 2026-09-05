package com.arx01.decision.presentation;

import com.arx01.decision.application.DecisionApplicationService;
import com.arx01.decision.domain.RecoveryDecision;
import com.arx01.decision.presentation.dto.MakeDecisionRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/decisions")
public class DecisionController {

    private final DecisionApplicationService decisionApplicationService;

    public DecisionController(DecisionApplicationService decisionApplicationService) {
        this.decisionApplicationService = decisionApplicationService;
    }

    @PostMapping
    public RecoveryDecision createDecision(@Valid @RequestBody MakeDecisionRequest request) {
        return decisionApplicationService.makeDecision(
                request.recoveryCaseId(),
                request.paymentId(),
                request.amountAtRisk(),
                request.failureReason(),
                request.attemptCount()
        );
    }
}
