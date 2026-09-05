"use client";

import { AuditEvent } from "@/types";
import { shortCaseId } from "@/lib/api";

interface AuditViewProps {
  events: AuditEvent[];
  selectedCaseId?: string;
  onFilterCase?: (caseId: string) => void;
}

export default function AuditView({ events, selectedCaseId }: AuditViewProps) {
  const displayEvents = selectedCaseId
    ? events.filter((e) => e.recoveryCaseId === selectedCaseId)
    : events;

  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
            AUDIT TRAIL LEDGER ({displayEvents.length})
          </span>
          {selectedCaseId && (
            <span className="text-[10px] text-zinc-500 ml-2">
              [FILTERED BY: {shortCaseId(selectedCaseId)}]
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500">POSTGRESQL AUDIT EVENTS</span>
      </div>

      <div className="p-4">
        {displayEvents.length === 0 ? (
          <div className="py-8 text-center text-zinc-600">
            NO AUDIT EVENTS RECORDED
          </div>
        ) : (
          <div className="divide-y divide-zinc-900">
            {displayEvents.map((evt) => {
              const dateObj = new Date(evt.createdAt);
              const timeStr = dateObj.toLocaleTimeString();
              const dateStr = dateObj.toLocaleDateString();

              let payloadFormatted = "";
              try {
                const parsed = JSON.parse(evt.payload);
                payloadFormatted = Object.entries(parsed)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(" ");
              } catch {
                payloadFormatted = evt.payload;
              }

              return (
                <div
                  key={evt.id}
                  className="py-2.5 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-4 font-mono text-xs hover:bg-zinc-900/30 px-2"
                >
                  <div className="flex items-center gap-3 shrink-0 text-zinc-500 text-[11px]">
                    <span>{timeStr}</span>
                    <span className="text-zinc-600">{dateStr}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-zinc-200 font-bold">{evt.eventType}</span>
                    <span className="text-[10px] text-zinc-500">[{evt.actorType}]</span>
                  </div>

                  <div className="text-zinc-400 text-[11px] truncate flex-1">
                    {payloadFormatted}
                  </div>

                  <div className="text-[10px] text-zinc-600 shrink-0">
                    {shortCaseId(evt.recoveryCaseId)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
