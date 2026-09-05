"use client";

import { RecoveryCase } from "@/types";
import { formatINR, shortPaymentId } from "@/lib/api";

interface RecentActionsTableProps {
  cases: RecoveryCase[];
  selectedCaseId?: string;
  onSelectCase: (caseId: string) => void;
}

export default function RecentActionsTable({
  cases,
  selectedCaseId,
  onSelectCase,
}: RecentActionsTableProps) {
  const getStatusDisplay = (status: RecoveryCase["status"]) => {
    switch (status) {
      case "RECOVERED":
        return <span className="text-emerald-400">✓ RECOVERED</span>;
      case "EXHAUSTED":
        return <span className="text-rose-400">✗ EXHAUSTED</span>;
      case "OPEN":
        return <span className="text-zinc-400">— OPEN</span>;
      case "IN_PROGRESS":
        return <span className="text-zinc-300">~ IN_PROGRESS</span>;
      case "CANCELLED":
        return <span className="text-zinc-500">✗ CANCELLED</span>;
      default:
        return <span className="text-zinc-400">{status}</span>;
    }
  };

  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          RECENT RECOVERY ACTIONS
        </span>
        <span className="text-[10px] text-zinc-500">SELECT ROW TO INSPECT</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider bg-black">
              <th className="py-2.5 px-4 font-normal">PAYMENT</th>
              <th className="py-2.5 px-4 font-normal">AMOUNT</th>
              <th className="py-2.5 px-4 font-normal">AI ACTION</th>
              <th className="py-2.5 px-4 font-normal">STATUS</th>
              <th className="py-2.5 px-4 font-normal text-right">RECOVERED</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-zinc-600">
                  NO RECOVERY ACTIONS RECORDED
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const isSelected = c.id === selectedCaseId;
                const recoveredAmount =
                  c.status === "RECOVERED" ? formatINR(c.amountAtRisk) : "—";

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-zinc-900 text-zinc-100"
                        : "hover:bg-zinc-900/50 text-zinc-300"
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-zinc-200">
                      {shortPaymentId(c.paymentId)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-300">
                      {formatINR(c.amountAtRisk)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      {c.recommendedAction || "SMART_RETRY"}
                    </td>
                    <td className="py-2.5 px-4">{getStatusDisplay(c.status)}</td>
                    <td className="py-2.5 px-4 text-right text-emerald-400/90 font-medium">
                      {recoveredAmount}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
