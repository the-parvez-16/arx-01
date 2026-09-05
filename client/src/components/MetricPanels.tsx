"use client";

import { RecoveryMetrics } from "@/types";
import { formatINR } from "@/lib/api";

interface MetricPanelsProps {
  metrics: RecoveryMetrics;
}

export default function MetricPanels({ metrics }: MetricPanelsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
      {/* 1. REVENUE AT RISK */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
          {formatINR(metrics.totalAtRisk)}
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>REVENUE AT RISK</span>
          <span className="text-zinc-600">[{metrics.totalCount} cases]</span>
        </div>
      </div>

      {/* 2. RECOVERED REVENUE */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400">
          {formatINR(metrics.totalRecovered)}
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>RECOVERED REVENUE</span>
          <span className="text-emerald-500/70">[{metrics.recoveredCount} salvaged]</span>
        </div>
      </div>

      {/* 3. RECOVERY RATE */}
      <div className="border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
          {metrics.rate}%
        </div>
        <div className="mt-2 text-[11px] text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>RECOVERY RATE</span>
          <span className="text-zinc-600">EFFICIENCY</span>
        </div>
      </div>
    </div>
  );
}
