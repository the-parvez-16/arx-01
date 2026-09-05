"use client";

import { PaymentInfo, RecoveryCase } from "@/types";
import { formatINR, shortPaymentId } from "@/lib/api";

interface PaymentsViewProps {
  payments: PaymentInfo[];
  cases: RecoveryCase[];
  onSelectCase: (caseId: string) => void;
}

export default function PaymentsView({ payments, cases, onSelectCase }: PaymentsViewProps) {
  // Map paymentId to recovery case
  const caseByPaymentId = new Map(cases.map((c) => [c.paymentId, c]));

  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          PAYMENTS JOURNAL ({payments.length})
        </span>
        <span className="text-[10px] text-zinc-500">GET /api/v1/payments</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-wider bg-black">
              <th className="py-2.5 px-4 font-normal">PAYMENT</th>
              <th className="py-2.5 px-4 font-normal">AMOUNT</th>
              <th className="py-2.5 px-4 font-normal">STATUS</th>
              <th className="py-2.5 px-4 font-normal">FAILURE REASON</th>
              <th className="py-2.5 px-4 font-normal">CREATED</th>
              <th className="py-2.5 px-4 font-normal text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-600">
                  NO PAYMENTS RECORDED
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const recCase = caseByPaymentId.get(p.id);
                const isFailed = p.status === "FAILED";
                const isSucceeded = p.status === "SUCCEEDED";

                return (
                  <tr key={p.id} className="hover:bg-zinc-900/50 text-zinc-300">
                    <td className="py-2.5 px-4 font-medium text-zinc-200">
                      {shortPaymentId(p.id)}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-100 font-medium">
                      {formatINR(p.amount)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={
                          isSucceeded
                            ? "text-emerald-400"
                            : isFailed
                            ? "text-rose-400"
                            : "text-zinc-400"
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400 font-mono text-[11px]">
                      {p.failureReason || "—"}
                    </td>
                    <td className="py-2.5 px-4 text-zinc-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {recCase ? (
                        <button
                          onClick={() => onSelectCase(recCase.id)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-[10px]"
                        >
                          [ VIEW CASE ]
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-[10px]">—</span>
                      )}
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
