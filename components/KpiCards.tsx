import type { Kpis } from "@/lib/metrics";
import { CheckCircle2, Clock, GaugeCircle, Layers, RotateCcw, AlertTriangle } from "lucide-react";

function Kpi({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneRing: Record<string, string> = {
    default: "text-slate-300 bg-slate-800/80",
    good: "text-emerald-300 bg-emerald-500/15",
    warn: "text-amber-300 bg-amber-500/15",
    bad: "text-red-300 bg-red-500/15",
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${toneRing[tone]}`}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

export default function KpiCards({ k }: { k: Kpis }) {
  const pct = (n: number) => `${(n * 100).toFixed(0)}%`;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <Kpi icon={<Layers size={16} />} label="HU totales" value={String(k.totalHU)} hint={`${k.devPoints} SP dev · ${k.qaPoints} QA`} />
      <Kpi
        icon={<GaugeCircle size={16} />}
        label="Avance ponderado"
        value={pct(k.avancePromedio)}
        hint={`simple ${pct(k.avanceSimple)}`}
        tone="default"
      />
      <Kpi
        icon={<CheckCircle2 size={16} />}
        label="Cumplidas"
        value={String(k.cumplidas)}
        hint={pct(k.pctCumplidas)}
        tone="good"
      />
      <Kpi icon={<Clock size={16} />} label="Cycle time prom." value={`${k.cycleTimePromedio.toFixed(1)} d`} hint="total por HU" />
      <Kpi
        icon={<RotateCcw size={16} />}
        label="En devolución"
        value={String(k.enDevolucion)}
        tone={k.enDevolucion ? "warn" : "default"}
        hint="reproceso"
      />
      <Kpi
        icon={<AlertTriangle size={16} />}
        label="Estancadas"
        value={String(k.estancadas)}
        tone={k.estancadas ? "bad" : "default"}
        hint="≥ 7 días en etapa"
      />
    </div>
  );
}
