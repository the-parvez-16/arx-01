package com.arx01.recovery.infrastructure.client;

import com.arx01.recovery.infrastructure.client.dto.PaymentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class PaymentServiceClient {

    private final RestClient restClient;

    public PaymentServiceClient(
            @Value("${services.payment.base-url}") String baseUrl
    ) {
        this.restClient = RestClient.create(baseUrl);
    }

    public PaymentResponse getPayment(UUID paymentId) {
        return restClient.get()
                .uri("/api/v1/payments/{paymentId}", paymentId)
                .retrieve()
                .body(PaymentResponse.class);
    }

    public PaymentResponse retryPayment(UUID paymentId) {
        return restClient.post()
                .uri("/api/v1/payments/{paymentId}/retry", paymentId)
                .retrieve()
                .body(PaymentResponse.class);
    }
}
