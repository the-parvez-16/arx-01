package com.arx01.recovery.domain.repository;

import com.arx01.recovery.domain.RecoveryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecoveryAttemptRepository extends JpaRepository<RecoveryAttempt, UUID> {
    List<RecoveryAttempt> findByRecoveryCaseIdOrderByAttemptNoAsc(UUID recoveryCaseId);
    Optional<RecoveryAttempt> findTopByRecoveryCaseIdOrderByAttemptNoDesc(UUID recoveryCaseId);
}
