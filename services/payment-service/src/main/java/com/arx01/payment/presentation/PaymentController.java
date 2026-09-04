package com.arx01.payment.presentation;

import com.arx01.payment.application.PaymentApplicationService;
import com.arx01.payment.domain.Payment;
import com.arx01.payment.presentation.dto.CreatePaymentRequest;
import com.arx01.payment.presentation.dto.PaymentResponse;
import com.arx01.payment.presentation.dto.SimulatePaymentFailureRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentApplicationService paymentApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse createPayment(@Valid @RequestBody CreatePaymentRequest request) {
        return toResponse(paymentApplicationService.createPayment(
                request.merchantId(),
                request.customerId(),
                request.subscriptionId(),
                request.amount(),
                request.currency()
        ));
    }

    @GetMapping("/{paymentId}")
    public PaymentResponse getPayment(@PathVariable UUID paymentId) {
        return toResponse(paymentApplicationService.findById(paymentId));
    }

    @PostMapping("/{paymentId}/simulate-failure")
    public PaymentResponse simulateFailure(
            @PathVariable UUID paymentId,
            @Valid @RequestBody SimulatePaymentFailureRequest request
    ) {
        return toResponse(paymentApplicationService.simulateFailure(paymentId, request.failureReason()));
    }

    private PaymentResponse toResponse(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getMerchant().getId(),
                payment.getCustomer().getId(),
                payment.getSubscription().getId(),
                payment.getAmount(),
                payment.getCurrency(),
                payment.getStatus(),
                payment.getFailureReason(),
                payment.getAttemptCount(),
                payment.getFailedAt(),
                payment.getRecoveredAt(),
                payment.getCreatedAt()
        );
    }
}
