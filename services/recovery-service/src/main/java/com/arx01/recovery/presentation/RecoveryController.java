package com.arx01.recovery.presentation;

import com.arx01.recovery.application.RecoveryApplicationService;
import com.arx01.recovery.domain.RecoveryAttempt;
import com.arx01.recovery.domain.RecoveryCase;
import com.arx01.recovery.domain.enums.RecoveryStatus;
import com.arx01.recovery.presentation.dto.CreateRecoveryCaseRequest;
import com.arx01.recovery.presentation.dto.RecoveryAttemptResponse;
import com.arx01.recovery.presentation.dto.RecoveryCaseResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recovery-cases")
@RequiredArgsConstructor
public class RecoveryController {

    private final RecoveryApplicationService recoveryApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RecoveryCaseResponse createRecoveryCase(@Valid @RequestBody CreateRecoveryCaseRequest request) {
        return toCaseResponse(recoveryApplicationService.createRecoveryCase(
                request.merchantId(),
                request.paymentId()
        ));
    }

    @GetMapping("/{id}")
    public RecoveryCaseResponse getRecoveryCase(@PathVariable UUID id) {
        return toCaseResponse(recoveryApplicationService.getById(id));
    }

    @GetMapping
    public List<RecoveryCaseResponse> listRecoveryCases(
            @RequestParam(required = false) UUID merchantId,
            @RequestParam(required = false) RecoveryStatus status
    ) {
        return recoveryApplicationService.listCases(merchantId, status)
                .stream()
                .map(this::toCaseResponse)
                .toList();
    }

    @PostMapping("/{id}/execute")
    public RecoveryCaseResponse executeRecoveryCase(@PathVariable UUID id) {
        return toCaseResponse(recoveryApplicationService.executeRecoveryCase(id));
    }

    @GetMapping("/{id}/attempts")
    public List<RecoveryAttemptResponse> getAttempts(@PathVariable UUID id) {
        return recoveryApplicationService.listAttempts(id)
                .stream()
                .map(this::toAttemptResponse)
                .toList();
    }

    @PostMapping("/{id}/cancel")
    public RecoveryCaseResponse cancelRecoveryCase(@PathVariable UUID id) {
        return toCaseResponse(recoveryApplicationService.cancelRecoveryCase(id));
    }

    private RecoveryCaseResponse toCaseResponse(RecoveryCase recoveryCase) {
        return new RecoveryCaseResponse(
                recoveryCase.getId(),
                recoveryCase.getMerchantId(),
                recoveryCase.getPaymentId(),
                recoveryCase.getStatus(),
                recoveryCase.getRiskScore(),
                recoveryCase.getAmountAtRisk(),
                recoveryCase.getRecommendedAction(),
                recoveryCase.getExecutedAction(),
                recoveryCase.getCreatedAt(),
                recoveryCase.getResolvedAt()
        );
    }

    private RecoveryAttemptResponse toAttemptResponse(RecoveryAttempt attempt) {
        return new RecoveryAttemptResponse(
                attempt.getId(),
                attempt.getRecoveryCase().getId(),
                attempt.getAttemptNo(),
                attempt.getAction(),
                attempt.getScheduledAt(),
                attempt.getExecutedAt(),
                attempt.getOutcome(),
                attempt.getAmountRecovered(),
                attempt.getCreatedAt()
        );
    }
}
