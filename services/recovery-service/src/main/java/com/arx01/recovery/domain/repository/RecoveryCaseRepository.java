package com.arx01.recovery.domain.repository;

import com.arx01.recovery.domain.RecoveryCase;
import com.arx01.recovery.domain.enums.RecoveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecoveryCaseRepository extends JpaRepository<RecoveryCase, UUID> {
    Optional<RecoveryCase> findByPaymentId(UUID paymentId);
    List<RecoveryCase> findByMerchantId(UUID merchantId);
    List<RecoveryCase> findByStatus(RecoveryStatus status);
    List<RecoveryCase> findByMerchantIdAndStatus(UUID merchantId, RecoveryStatus status);
}
