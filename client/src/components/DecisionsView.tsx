"use client";

import { RecoveryCase } from "@/types";
import { formatINR, shortPaymentId } from "@/lib/api";

interface DecisionsViewProps {
  cases: RecoveryCase[];
  onSelectCase: (caseId: string) => void;
}

export default function DecisionsView({ cases, onSelectCase }: DecisionsViewProps) {
  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          AI DECISION ENGINE LOG ({cases.length})
        </span>
        <span className="text-[10px] text-zinc-500">REAL-TIME INFERENCE LOGS</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider bg-black">
              <th className="py-2.5 px-4 font-normal">PAYMENT</th>
              <th className="py-2.5 px-4 font-normal">AMOUNT</th>
              <th className="py-2.5 px-4 font-normal">RECOMMENDED ACTION</th>
              <th className="py-2.5 px-4 font-normal">RISK SCORE</th>
              <th className="py-2.5 px-4 font-normal">CONFIDENCE</th>
              <th className="py-2.5 px-4 font-normal">REASONING</th>
              <th className="py-2.5 px-4 font-normal text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {cases.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-600">
                  NO AI DECISIONS LOGGED
                </td>
              </tr>
            ) : (
              cases.map((c) => {
                const confidenceStr =
                  c.aiConfidence !== undefined
                    ? `${(Number(c.aiConfidence) * 100).toFixed(0)}%`
                    : "80%";

                return (
                  <tr key={c.id} className="hover:bg-zinc-900/50 text-zinc-300">
                    <td className="py-2.5 px-4 font-medium text-zinc-200">
                      {shortPaymentId(c.paymentId)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-300">
                      {formatINR(c.amountAtRisk)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-200 font-medium">
                      {c.recommendedAction || "SMART_RETRY"}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      {Number(c.riskScore || 0).toFixed(4)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-300">
                      {confidenceStr}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400 max-w-xs truncate text-[11px]">
                      {c.aiReason || "Automated payment telemetry inference evaluation"}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => onSelectCase(c.id)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px]"
                      >
                        [ INSPECT ]
                      </button>
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
