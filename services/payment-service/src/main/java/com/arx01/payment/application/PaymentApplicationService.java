package com.arx01.payment.application;

import com.arx01.payment.domain.Customer;
import com.arx01.payment.domain.Merchant;
import com.arx01.payment.domain.Payment;
import com.arx01.payment.domain.Subscription;
import com.arx01.payment.domain.enums.PaymentFailureReason;
import com.arx01.payment.domain.repository.CustomerRepository;
import com.arx01.payment.domain.repository.MerchantRepository;
import com.arx01.payment.domain.repository.PaymentRepository;
import com.arx01.payment.domain.repository.SubscriptionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentApplicationService {

    private final PaymentRepository paymentRepository;
    private final MerchantRepository merchantRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Transactional
    public Payment createPayment(
            UUID merchantId,
            UUID customerId,
            UUID subscriptionId,
            BigDecimal amount,
            String currency
    ) {
        Merchant merchant = merchantRepository.getReferenceById(merchantId);
        Customer customer = customerRepository.getReferenceById(customerId);
        Subscription subscription = subscriptionRepository.getReferenceById(subscriptionId);

        return paymentRepository.save(Payment.create(merchant, customer, subscription, amount, currency));
    }

    @Transactional(readOnly = true)
    public Payment findById(UUID paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found: " + paymentId));
    }

    @Transactional
    public Payment simulateFailure(UUID paymentId, PaymentFailureReason failureReason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found: " + paymentId));
        payment.markFailed(failureReason);
        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment retryPayment(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new EntityNotFoundException("Payment not found: " + paymentId));
        payment.retry();
        return paymentRepository.save(payment);
    }
}
