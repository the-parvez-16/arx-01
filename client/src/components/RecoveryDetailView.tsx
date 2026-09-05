"use client";

import { RecoveryCase, PaymentInfo, RecoveryAttempt, AuditEvent } from "@/types";
import { formatINR, shortPaymentId } from "@/lib/api";

interface RecoveryDetailViewProps {
  recoveryCase: RecoveryCase;
  paymentInfo: PaymentInfo | null;
  attempts: RecoveryAttempt[];
  auditEvents: AuditEvent[];
  onExecute: () => void;
  onBack?: () => void;
  isExecuting?: boolean;
}

export default function RecoveryDetailView({
  recoveryCase,
  paymentInfo,
  attempts,
  auditEvents,
  onExecute,
  onBack,
  isExecuting,
}: RecoveryDetailViewProps) {
  // Deterministic policy evaluation based strictly on RecoveryPolicyEngine rules:
  // 1. Terminal state check: !recoveryCase.isTerminal() (not RECOVERED, EXHAUSTED, CANCELLED)
  // 2. Action check: action != null && action != NO_ACTION
  // 3. Max attempts check: currentAttemptCount < 3
  // 4. Amount at risk check: amountAtRisk > 0
  const maxAttempts = 3;
  const currentAttemptCount = attempts.length;
  const isTerminal =
    recoveryCase.status === "RECOVERED" ||
    recoveryCase.status === "EXHAUSTED" ||
    recoveryCase.status === "CANCELLED";
  const hasValidAction = Boolean(recoveryCase.recommendedAction && recoveryCase.recommendedAction !== "NO_ACTION");
  const underAttemptLimit = currentAttemptCount < maxAttempts;
  const positiveAmount = Number(recoveryCase.amountAtRisk) > 0;

  const isPolicyAllowed =
    !isTerminal && hasValidAction && underAttemptLimit && positiveAmount;

  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs divide-y divide-zinc-800">
      {/* 1. Header Section */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-zinc-100 tracking-wider">
              PAYMENT {shortPaymentId(recoveryCase.paymentId)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              [CASE ID: {recoveryCase.id}]
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-baseline gap-3">
            <span className="text-xl font-bold text-zinc-100">
              {formatINR(recoveryCase.amountAtRisk)}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-rose-400 font-medium">
              FAILED — {paymentInfo?.failureReason || "INSUFFICIENT_FUNDS"}
            </span>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400">STATUS: {recoveryCase.status}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          {recoveryCase.status === "OPEN" && (
            <button
              onClick={onExecute}
              disabled={isExecuting}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 hover:text-white transition-colors disabled:opacity-50 text-xs"
            >
              {isExecuting ? "[ EXECUTING... ]" : "[ EXECUTE RECOVERY ]"}
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-black hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
            >
              [ BACK TO LIST ]
            </button>
          )}
        </div>
      </div>

      {/* 2. Grid of Sections: AI Decision & Policy Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
        {/* AI DECISION */}
        <div className="p-5 space-y-3">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
            AI DECISION
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">Recommended action:</span>
              <span className="text-zinc-200 font-medium">
                {recoveryCase.recommendedAction || "SMART_RETRY"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">Risk Score:</span>
              <span className="text-zinc-200">
                {Number(recoveryCase.riskScore || 0).toFixed(4)}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">Confidence:</span>
              <span className="text-zinc-200">
                {recoveryCase.aiConfidence !== undefined
                  ? `${(Number(recoveryCase.aiConfidence) * 100).toFixed(0)}%`
                  : "80%"}
              </span>
            </div>

            <div className="pt-2">
              <span className="text-zinc-500 block mb-1">Reason:</span>
              <div className="p-2.5 bg-black border border-zinc-900 text-zinc-300 leading-relaxed text-[11px]">
                {recoveryCase.aiReason ||
                  "Recovery assessment executed based on transaction telemetry and failure reason."}
              </div>
            </div>
          </div>
        </div>

        {/* POLICY CHECK */}
        <div className="p-5 space-y-3">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
            <span>POLICY CHECK</span>
            <span
              className={`text-[10px] font-bold ${
                isPolicyAllowed ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {isPolicyAllowed ? "ALLOWED" : "BLOCKED"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">Engine Evaluation:</span>
              <span className={isPolicyAllowed ? "text-emerald-400" : "text-amber-400"}>
                {isPolicyAllowed ? "ALLOWED" : "BLOCKED"}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">MAX ATTEMPTS:</span>
              <span className="text-zinc-300">{maxAttempts}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">CURRENT ATTEMPT:</span>
              <span className="text-zinc-300">{currentAttemptCount}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-zinc-500">AMOUNT AT RISK:</span>
              <span className="text-zinc-300">
                {formatINR(recoveryCase.amountAtRisk)}
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-900 text-[11px] space-y-1">
              <div className="flex items-center gap-2">
                <span className={underAttemptLimit ? "text-emerald-400" : "text-rose-400"}>
                  {underAttemptLimit ? "✓" : "✗"}
                </span>
                <span className="text-zinc-400">Attempt count within threshold (&lt; 3)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={positiveAmount ? "text-emerald-400" : "text-rose-400"}>
                  {positiveAmount ? "✓" : "✗"}
                </span>
                <span className="text-zinc-400">Positive amount at risk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={!isTerminal ? "text-emerald-400" : "text-amber-400"}>
                  {!isTerminal ? "✓" : "—"}
                </span>
                <span className="text-zinc-400">Case in non-terminal state</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EXECUTION SECTION */}
      <div className="p-5 space-y-3">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
          <span>EXECUTION</span>
          <span className="text-zinc-500">
            {attempts.length} ATTEMPT{attempts.length !== 1 ? "S" : ""}
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="py-4 text-center text-zinc-600">
            NO ATTEMPTS EXECUTED YET. CASE PENDING EXECUTION.
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((att) => {
              const isSucceeded = att.outcome === "SUCCEEDED";
              const isBlocked = att.outcome === "BLOCKED";

              return (
                <div
                  key={att.id}
                  className="p-3 bg-black border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500 font-bold">ATTEMPT #{att.attemptNo}</span>
                    <span className="text-zinc-300">{att.action}</span>
                    <span
                      className={`text-[11px] font-bold ${
                        isSucceeded
                          ? "text-emerald-400"
                          : isBlocked
                          ? "text-amber-400"
                          : "text-rose-400"
                      }`}
                    >
                      {att.outcome || "PENDING"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-zinc-500 text-[10px]">
                      {att.executedAt
                        ? new Date(att.executedAt).toLocaleTimeString()
                        : "SCHEDULED"}
                    </span>
                    <span className="text-emerald-400 font-medium">
                      {att.amountRecovered
                        ? `${formatINR(att.amountRecovered)} RECOVERED`
                        : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {recoveryCase.status === "RECOVERED" && (
          <div className="mt-3 p-3 bg-black border border-emerald-950 flex items-center justify-between">
            <span className="text-zinc-400 uppercase tracking-wider text-[11px]">
              RECOVERED
            </span>
            <span className="text-emerald-400 font-bold text-base">
              {formatINR(recoveryCase.amountAtRisk)}
            </span>
          </div>
        )}
      </div>

      {/* 4. AUDIT TIMELINE */}
      <div className="p-5 space-y-3">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
          <span>AUDIT TRAIL</span>
          <span className="text-[10px] text-zinc-500">POSTGRESQL IMMUTABLE LEDGER</span>
        </div>

        {auditEvents.length === 0 ? (
          <div className="py-4 text-center text-zinc-600">
            NO AUDIT EVENTS LOGGED FOR THIS CASE
          </div>
        ) : (
          <div className="space-y-1.5 font-mono text-[11px]">
            {auditEvents.map((evt) => {
              const time = new Date(evt.createdAt).toLocaleTimeString();
              let payloadSummary = "";
              try {
                const parsed = JSON.parse(evt.payload);
                payloadSummary = Object.entries(parsed)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(" ");
              } catch {
                payloadSummary = evt.payload;
              }

              return (
                <div
                  key={evt.id}
                  className="py-1 flex flex-col sm:flex-row sm:items-baseline gap-2 border-b border-zinc-950 pb-1"
                >
                  <span className="text-zinc-500 shrink-0">{time}</span>
                  <span className="text-zinc-300 font-semibold shrink-0">
                    {evt.eventType}
                  </span>
                  <span className="text-zinc-600 truncate">{payloadSummary}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
