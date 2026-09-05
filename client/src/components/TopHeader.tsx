"use client";

interface TopHeaderProps {
  onRefresh: () => void;
  onSimulate: () => void;
  isRefreshing?: boolean;
  isSimulating?: boolean;
}

export default function TopHeader({
  onRefresh,
  onSimulate,
  isRefreshing,
  isSimulating,
}: TopHeaderProps) {
  return (
    <header className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-black text-xs font-mono shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-zinc-100 text-sm tracking-wider">ARX-01</span>
          <span className="text-zinc-500 hidden sm:inline">/</span>
          <span className="text-zinc-400 hidden sm:inline">Autonomous Revenue Recovery</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="text-emerald-400 text-xs leading-none">●</span>
          <span className="tracking-wider text-[11px]">SYSTEM OPERATIONAL</span>
        </div>

        <div className="h-4 w-px bg-zinc-800" />

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50 text-[11px]"
          title="Refresh Data"
        >
          {isRefreshing ? "[ REFRESHING... ]" : "[ REFRESH ]"}
        </button>

        <button
          onClick={onSimulate}
          disabled={isSimulating}
          className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition-colors disabled:opacity-50 text-[11px]"
          title="Trigger end-to-end failure and AI recovery"
        >
          {isSimulating ? "[ SIMULATING... ]" : "[ + SIMULATE FAILURE ]"}
        </button>
      </div>
    </header>
  );
}
