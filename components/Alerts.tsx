import type { Alerta } from "@/lib/metrics";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Alerts({ data }: { data: Alerta[] }) {
  if (!data.length) {
    return (
      <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-6 text-center text-sm text-emerald-300">
        Sin alertas: ninguna HU en devolución ni estancada.
      </p>
    );
  }
  return (
    <ul className="max-h-[420px] space-y-2 overflow-y-auto">
      {data.map((a, i) => {
        const isDev = a.tipo === "Devolución";
        return (
          <li
            key={`${a.id}-${i}`}
            className={`rounded-lg border px-3 py-2.5 ${
              isDev ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5"
            }`}
          >
            <div className="flex items-start gap-2.5">
              <span className={isDev ? "text-amber-400" : "text-red-400"}>
                {isDev ? <RotateCcw size={16} /> : <AlertTriangle size={16} />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-200" title={a.titulo}>
                    {a.titulo}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">#{a.id}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {a.detalle} · {a.responsable}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
