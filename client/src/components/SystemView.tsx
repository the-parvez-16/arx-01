"use client";

export default function SystemView() {
  const services = [
    { name: "API Gateway", port: 8080, route: "/api/v1/*", status: "ONLINE", protocol: "HTTP/1.1" },
    { name: "Recovery Service", port: 8081, route: "/api/v1/recovery-cases/**", status: "ONLINE", protocol: "Spring Boot" },
    { name: "Decision Service", port: 8082, route: "Internal (Recovery)", status: "ONLINE", protocol: "Groq LLM" },
    { name: "Payment Service", port: 8083, route: "/api/v1/payments/**", status: "ONLINE", protocol: "Spring Boot" },
    { name: "Audit Service", port: 8084, route: "/api/v1/audit-events/**", status: "ONLINE", protocol: "Spring Boot" },
    { name: "Neon PostgreSQL", port: 5432, route: "neon.tech/neondb", status: "ONLINE", protocol: "PostgreSQL 16" },
  ];

  return (
    <div className="border border-zinc-800 bg-zinc-950 font-mono text-xs divide-y divide-zinc-800">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-black">
        <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
          SYSTEM TOPOLOGY & MICROSERVICES STATUS
        </span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-xs leading-none">●</span>
          <span className="text-[10px] text-zinc-400">ALL CLUSTERS OPERATIONAL</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((s) => (
            <div key={s.name} className="border border-zinc-800/80 bg-black p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-200 font-bold text-xs">{s.name}</span>
                <span className="text-emerald-400 text-[10px] font-bold">● {s.status}</span>
              </div>
              <div className="text-[11px] text-zinc-500 space-y-0.5">
                <div>PORT: <span className="text-zinc-400">:{s.port}</span></div>
                <div>TYPE: <span className="text-zinc-400">{s.protocol}</span></div>
                <div className="truncate">ROUTE: <span className="text-zinc-400">{s.route}</span></div>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-zinc-800 bg-black p-4 space-y-2 text-[11px]">
          <div className="text-zinc-400 font-bold uppercase tracking-wider text-xs border-b border-zinc-900 pb-1">
            CORE CONFIGURATION
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-zinc-400">
            <div>
              <span className="text-zinc-500">GATEWAY ENDPOINT:</span> http://localhost:8080
            </div>
            <div>
              <span className="text-zinc-500">CURRENCY CONTEXT:</span> INR (₹)
            </div>
            <div>
              <span className="text-zinc-500">MAX RECOVERY RETRIES:</span> 3 attempts
            </div>
            <div>
              <span className="text-zinc-500">AUDIT VERIFIABILITY:</span> Foreign-Key Referential Integrity
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
