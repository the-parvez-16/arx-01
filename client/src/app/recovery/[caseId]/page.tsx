"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import RecoveryDetailView from "@/components/RecoveryDetailView";
import { RecoveryCase, PaymentInfo, RecoveryAttempt, AuditEvent } from "@/types";
import { fetchApi } from "@/lib/api";

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [recoveryCase, setRecoveryCase] = useState<RecoveryCase | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [attempts, setAttempts] = useState<RecoveryAttempt[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCaseData = useCallback(async () => {
    if (!caseId) return;
    setIsLoading(true);
    try {
      const caseData = await fetchApi<RecoveryCase>(`/api/v1/recovery-cases/${caseId}`);

      const [paymentData, attemptsData, eventsData] = await Promise.all([
        fetchApi<PaymentInfo>(`/api/v1/payments/${caseData.paymentId}`).catch(() => null),
        fetchApi<RecoveryAttempt[]>(`/api/v1/recovery-cases/${caseId}/attempts`).catch(() => []),
        fetchApi<AuditEvent[]>(`/api/v1/audit-events?recoveryCaseId=${caseId}`).catch(() => []),
      ]);

      let conf = caseData.aiConfidence;
      let reas = caseData.aiReason;
      if (eventsData && eventsData.length > 0) {
        const aiEvent = eventsData.find((e) => e.eventType === "AI_RECOMMENDATION");
        if (aiEvent) {
          try {
            const parsed = JSON.parse(aiEvent.payload);
            if (parsed.confidence !== undefined && conf === undefined) {
              conf = parsed.confidence;
            }
            if (parsed.reason && !reas) {
              reas = parsed.reason;
            }
          } catch {
            // ignore
          }
        }
      }

      setRecoveryCase({ ...caseData, aiConfidence: conf, aiReason: reas });
      setPaymentInfo(paymentData);
      setAttempts(attemptsData || []);
      setAuditEvents(eventsData || []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : `Failed to load case ${caseId}`);
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

  const handleExecute = async () => {
    if (!caseId) return;
    setIsExecuting(true);
    try {
      await fetchApi<RecoveryCase>(`/api/v1/recovery-cases/${caseId}/execute`, {
        method: "POST",
      });
      await loadCaseData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-mono flex flex-col md:flex-row antialiased">
      <Sidebar
        currentTab="RECOVERY"
        onSelectTab={() => router.push("/")}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          onRefresh={loadCaseData}
          onSimulate={() => router.push("/")}
          isRefreshing={isLoading}
        />

        {errorMessage && (
          <div className="bg-zinc-950 border-b border-rose-900/60 px-6 py-2.5 text-xs text-rose-400 flex items-center justify-between">
            <span>[ERROR] {errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              [ DISMISS ]
            </button>
          </div>
        )}

        <main className="p-6 flex-1 overflow-y-auto">
          {recoveryCase ? (
            <RecoveryDetailView
              recoveryCase={recoveryCase}
              paymentInfo={paymentInfo}
              attempts={attempts}
              auditEvents={auditEvents}
              onExecute={handleExecute}
              onBack={() => router.push("/")}
              isExecuting={isExecuting}
            />
          ) : (
            <div className="py-12 text-center text-zinc-600 text-xs font-mono">
              {isLoading ? "LOADING CASE TELEMETRY..." : "CASE NOT FOUND"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
