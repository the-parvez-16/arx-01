"use client";

import { RecoveryMetrics } from "@/types";

interface PipelineBannerProps {
  metrics: RecoveryMetrics;
}

export default function PipelineBanner({ metrics }: PipelineBannerProps) {
  const total = metrics.totalCount;
  const processed = metrics.processedCount;
  const fraction = total > 0 ? processed / total : 0;
  const totalBlocks = 24;
  const solidBlocks = Math.min(totalBlocks, Math.round(fraction * totalBlocks));
  const emptyBlocks = Math.max(0, totalBlocks - solidBlocks);

  const blockString = "█".repeat(solidBlocks) + "░".repeat(emptyBlocks);

  return (
    <div className="border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-900 pb-2">
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          RECOVERY PIPELINE
        </span>
        <div className="flex items-center gap-3 text-zinc-400 text-xs">
          <span className="text-zinc-200 tracking-wider select-all">{blockString}</span>
          <span className="text-zinc-500">
            {processed} / {total} processed
          </span>
        </div>
      </div>

      {/* Terminal status workflow */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 py-1 overflow-x-auto">
        <span className="text-rose-400/90 font-medium">FAILED</span>
        <span className="text-zinc-600">───</span>
        <span className="text-zinc-300">AI DECISION</span>
        <span className="text-zinc-600">───</span>
        <span className="text-zinc-300">POLICY</span>
        <span className="text-zinc-600">───</span>
        <span className="text-zinc-300">EXECUTION</span>
        <span className="text-zinc-600">───</span>
        <span className="text-emerald-400/90 font-medium">RECOVERED</span>
      </div>
    </div>
  );
}
