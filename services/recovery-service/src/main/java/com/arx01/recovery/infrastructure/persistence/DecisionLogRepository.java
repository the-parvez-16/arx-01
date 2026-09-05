package com.arx01.recovery.infrastructure.persistence;

import com.arx01.recovery.domain.DecisionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DecisionLogRepository extends JpaRepository<DecisionLog, UUID> {
}
