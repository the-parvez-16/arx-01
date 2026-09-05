"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import MetricPanels from "@/components/MetricPanels";
import PipelineBanner from "@/components/PipelineBanner";
import RecentActionsTable from "@/components/RecentActionsTable";
import RecoveryDetailView from "@/components/RecoveryDetailView";
import PaymentsView from "@/components/PaymentsView";
import DecisionsView from "@/components/DecisionsView";
import AuditView from "@/components/AuditView";
import SystemView from "@/components/SystemView";

import {
  RecoveryCase,
  PaymentInfo,
  RecoveryAttempt,
  AuditEvent,
  RecoveryMetrics,
} from "@/types";
import { fetchApi } from "@/lib/api";

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState<string>("OVERVIEW");
  const [cases, setCases] = useState<RecoveryCase[]>([]);
  const [payments, setPayments] = useState<PaymentInfo[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  // Selected case state
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<RecoveryCase | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentInfo | null>(null);
  const [caseAttempts, setCaseAttempts] = useState<RecoveryAttempt[]>([]);
  const [caseAuditEvents, setCaseAuditEvents] = useState<AuditEvent[]>([]);

  // Action states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch all cases
  const loadDashboardData = useCallback(async () => {
    try {
      setErrorMessage(null);
      const fetchedCases = await fetchApi<RecoveryCase[]>("/api/v1/recovery-cases");
      const sorted = [...fetchedCases].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCases(sorted);

      // Fetch payment details for cases
      const paymentPromises = sorted.slice(0, 20).map((c) =>
        fetchApi<PaymentInfo>(`/api/v1/payments/${c.paymentId}`).catch(() => null)
      );
      const resolvedPayments = (await Promise.all(paymentPromises)).filter(
        (p): p is PaymentInfo => p !== null
      );
      setPayments(resolvedPayments);

      // Fetch global audit events
      try {
        const events = await fetchApi<AuditEvent[]>("/api/v1/audit-events");
        setAuditEvents(events || []);
      } catch {
        // global audit might be empty or scoped
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to connect to ARX-01 API Gateway (:8080)"
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 2. Fetch specific case details
  const loadCaseDetails = useCallback(async (caseId: string) => {
    try {
      const caseData = await fetchApi<RecoveryCase>(`/api/v1/recovery-cases/${caseId}`);

      const [paymentData, attemptsData, eventsData] = await Promise.all([
        fetchApi<PaymentInfo>(`/api/v1/payments/${caseData.paymentId}`).catch(() => null),
        fetchApi<RecoveryAttempt[]>(`/api/v1/recovery-cases/${caseId}/attempts`).catch(
          () => []
        ),
        fetchApi<AuditEvent[]>(`/api/v1/audit-events?recoveryCaseId=${caseId}`).catch(
          () => []
        ),
      ]);

      // Extract authentic AI confidence & reason from audit event if missing on case
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
            // ignore parse error
          }
        }
      }

      setSelectedCase({ ...caseData, aiConfidence: conf, aiReason: reas });
      setSelectedPayment(paymentData);
      setCaseAttempts(attemptsData || []);
      setCaseAuditEvents(eventsData || []);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : `Failed to load details for case ${caseId}`
      );
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load details whenever selectedCaseId changes
  useEffect(() => {
    if (selectedCaseId) {
      loadCaseDetails(selectedCaseId);
    } else {
      setSelectedCase(null);
      setSelectedPayment(null);
      setCaseAttempts([]);
      setCaseAuditEvents([]);
    }
  }, [selectedCaseId, loadCaseDetails]);

  // Calculate high-level recovery metrics
  const metrics: RecoveryMetrics = useMemo(() => {
    const totalAtRisk = cases.reduce(
      (sum, c) => sum + Number(c.amountAtRisk || 0),
      0
    );
    const recoveredCases = cases.filter((c) => c.status === "RECOVERED");
    const totalRecovered = recoveredCases.reduce(
      (sum, c) => sum + Number(c.amountAtRisk || 0),
      0
    );
    const processedCount = cases.filter((c) => c.status !== "OPEN").length;
    const rate = totalAtRisk > 0 ? ((totalRecovered / totalAtRisk) * 100).toFixed(1) : "0.0";

    return {
      totalAtRisk,
      totalRecovered,
      rate,
      totalCount: cases.length,
      recoveredCount: recoveredCases.length,
      processedCount,
    };
  }, [cases]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    if (selectedCaseId) {
      await loadCaseDetails(selectedCaseId);
    }
  };

  // Execution handler
  const handleExecute = async () => {
    if (!selectedCaseId) return;
    setIsExecuting(true);
    setErrorMessage(null);
    try {
      await fetchApi<RecoveryCase>(`/api/v1/recovery-cases/${selectedCaseId}/execute`, {
        method: "POST",
      });
      await loadCaseDetails(selectedCaseId);
      await loadDashboardData();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Execution failed");
    } finally {
      setIsExecuting(false);
    }
  };

  // Live simulation handler
  const handleSimulate = async () => {
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const merchantId = "11111111-1111-1111-1111-111111111111";
      const customerId = "22222222-2222-2222-2222-222222222222";
      const subscriptionId = "33333333-3333-3333-3333-333333333333";
      // Generate INR amounts e.g. 2499, 4999, 8999
      const sampleAmounts = [1499, 2499, 4999, 7999, 8999];
      const amount = sampleAmounts[Math.floor(Math.random() * sampleAmounts.length)];

      // 1. Create Payment (in INR)
      const payment = await fetchApi<PaymentInfo>("/api/v1/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          customerId,
          subscriptionId,
          amount,
          currency: "INR",
        }),
      });

      // 2. Simulate Failure
      const failureReasons = [
        "INSUFFICIENT_FUNDS",
        "CARD_EXPIRED",
        "BANK_DECLINED",
        "NETWORK_ERROR",
      ];
      const failureReason =
        failureReasons[Math.floor(Math.random() * failureReasons.length)];
      await fetchApi(`/api/v1/payments/${payment.id}/simulate-failure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ failureReason }),
      });

      // 3. Create Recovery Case (Decision Service evaluates real Groq recommendation)
      const newCase = await fetchApi<RecoveryCase>("/api/v1/recovery-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          paymentId: payment.id,
        }),
      });

      // Update state and open newly created case
      setSelectedCaseId(newCase.id);
      await loadDashboardData();
      await loadCaseDetails(newCase.id);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Simulation workflow failed"
      );
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-mono flex flex-col md:flex-row antialiased">
      {/* 1. Persistent Desktop Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          // If navigating to OVERVIEW, keep or clear selection appropriately
          if (tab !== "RECOVERY" && selectedCaseId) {
            // Keep selection preserved in memory
          }
        }}
        caseCount={cases.length}
      />

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Operations Header */}
        <TopHeader
          onRefresh={handleRefresh}
          onSimulate={handleSimulate}
          isRefreshing={isRefreshing}
          isSimulating={isSimulating}
        />

        {/* Error Banner */}
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

        {/* Viewport Content */}
        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* If a case is selected, render the dedicated RecoveryDetailView */}
          {selectedCase ? (
            <RecoveryDetailView
              recoveryCase={selectedCase}
              paymentInfo={selectedPayment}
              attempts={caseAttempts}
              auditEvents={caseAuditEvents}
              onExecute={handleExecute}
              onBack={() => setSelectedCaseId(null)}
              isExecuting={isExecuting}
            />
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {currentTab === "OVERVIEW" && (
                <div className="space-y-6">
                  <div className="flex items-baseline justify-between border-b border-zinc-900 pb-2">
                    <h1 className="text-sm font-bold tracking-widest text-zinc-100 uppercase">
                      REVENUE RECOVERY
                    </h1>
                    <span className="text-[10px] text-zinc-500">
                      LIVE TRANSACTION FEED
                    </span>
                  </div>

                  {/* Three Compact Metric Panels */}
                  <MetricPanels metrics={metrics} />

                  {/* Recovery Pipeline Progress Bar & Line */}
                  <PipelineBanner metrics={metrics} />

                  {/* Recent Recovery Actions */}
                  <RecentActionsTable
                    cases={cases}
                    selectedCaseId={selectedCaseId || undefined}
                    onSelectCase={(id) => setSelectedCaseId(id)}
                  />
                </div>
              )}

              {/* TAB: PAYMENTS */}
              {currentTab === "PAYMENTS" && (
                <PaymentsView
                  payments={payments}
                  cases={cases}
                  onSelectCase={(id) => setSelectedCaseId(id)}
                />
              )}

              {/* TAB: RECOVERY */}
              {currentTab === "RECOVERY" && (
                <div className="space-y-4">
                  <div className="flex items-baseline justify-between border-b border-zinc-900 pb-2">
                    <h2 className="text-sm font-bold tracking-widest text-zinc-100 uppercase">
                      RECOVERY CASES ({cases.length})
                    </h2>
                    <span className="text-[10px] text-zinc-500">
                      ALL MONITORED CASES
                    </span>
                  </div>
                  <RecentActionsTable
                    cases={cases}
                    selectedCaseId={selectedCaseId || undefined}
                    onSelectCase={(id) => setSelectedCaseId(id)}
                  />
                </div>
              )}

              {/* TAB: DECISIONS */}
              {currentTab === "DECISIONS" && (
                <DecisionsView
                  cases={cases}
                  onSelectCase={(id) => setSelectedCaseId(id)}
                />
              )}

              {/* TAB: AUDIT */}
              {currentTab === "AUDIT" && (
                <AuditView
                  events={auditEvents}
                  selectedCaseId={selectedCaseId || undefined}
                />
              )}

              {/* TAB: SYSTEM */}
              {currentTab === "SYSTEM" && <SystemView />}
            </>
          )}

          {isLoading && cases.length === 0 && (
            <div className="py-12 text-center text-zinc-600 text-xs font-mono">
              CONNECTING TO ARX-01 GATEWAY...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
