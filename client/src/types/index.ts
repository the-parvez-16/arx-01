export type CaseStatus = "OPEN" | "IN_PROGRESS" | "RECOVERED" | "EXHAUSTED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED";
export type AttemptOutcome = "SUCCEEDED" | "FAILED" | "BLOCKED" | "SKIPPED";

export interface RecoveryCase {
  id: string;
  merchantId: string;
  paymentId: string;
  status: CaseStatus;
  riskScore: number;
  amountAtRisk: number;
  recommendedAction: string;
  executedAction: string | null;
  createdAt: string;
  resolvedAt: string | null;
  aiConfidence?: number;
  aiReason?: string;
}

export interface PaymentInfo {
  id: string;
  merchantId: string;
  customerId: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  failureReason: string | null;
  attemptCount: number;
  failedAt: string | null;
  recoveredAt: string | null;
  createdAt: string;
}

export interface RecoveryAttempt {
  id: string;
  recoveryCaseId: string;
  attemptNo: number;
  action: string;
  scheduledAt: string;
  executedAt: string | null;
  outcome: AttemptOutcome | null;
  amountRecovered: number | null;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  merchantId: string;
  recoveryCaseId: string;
  eventType: string;
  actorType: string;
  actorId: string;
  payload: string;
  createdAt: string;
}

export interface RecoveryMetrics {
  totalAtRisk: number;
  totalRecovered: number;
  rate: string;
  totalCount: number;
  recoveredCount: number;
  processedCount: number;
}
