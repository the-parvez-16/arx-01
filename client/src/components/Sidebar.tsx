"use client";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  caseCount?: number;
}

export default function Sidebar({ currentTab, onSelectTab, caseCount }: SidebarProps) {
  const mainNav = [
    { id: "OVERVIEW", label: "OVERVIEW" },
    { id: "PAYMENTS", label: "PAYMENTS" },
    { id: "RECOVERY", label: "RECOVERY", count: caseCount },
    { id: "DECISIONS", label: "DECISIONS" },
    { id: "AUDIT", label: "AUDIT" },
  ];

  return (
    <aside className="w-full md:w-56 bg-black border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between shrink-0 font-mono text-xs select-none">
      <div>
        {/* Terminal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <span className="text-sm font-bold tracking-widest text-zinc-100">ARX-01</span>
          <span className="text-[10px] text-zinc-500 font-mono">v1.0-PROD</span>
        </div>

        {/* Navigation list */}
        <nav className="py-4 space-y-0.5">
          {mainNav.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full text-left px-5 py-2.5 flex items-center justify-between transition-colors ${
                  isActive
                    ? "text-zinc-100 bg-zinc-900/80 border-l-2 border-zinc-100 pl-[18px]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950"
                }`}
              >
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] text-zinc-500 font-mono">[{item.count}]</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-zinc-800 space-y-2">
        <button
          onClick={() => onSelectTab("SYSTEM")}
          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
            currentTab === "SYSTEM"
              ? "text-zinc-100 bg-zinc-900 border-l-2 border-zinc-100 pl-[10px]"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <span>SYSTEM</span>
          <span className="text-[10px] text-emerald-400 font-mono">●</span>
        </button>
        <div className="text-[10px] text-zinc-600 px-3 pt-1 font-mono">
          OPERATIONS CONSOLE
        </div>
      </div>
    </aside>
  );
}
