"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Code2, TestTube2, Sigma } from "lucide-react";
import type { PuntosFuncion, PuntosSplit } from "@/lib/metrics";

// Colores fijos para diferenciar visualmente Desarrollo vs QA.
const DEV_COLOR = "#0ea5e9"; // sky  → Desarrollo
const QA_COLOR = "#f59e0b"; // amber → QA

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </span>
      <div>
        <div className="text-xs font-medium text-slate-400">{label}</div>
        <div className="text-xl font-semibold text-slate-100">{value}</div>
        {sub && <div className="text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  );
}

function SplitBars({ data }: { data: PuntosSplit[] }) {
  const rows = data.map((d) => ({
    ...d,
    short: d.label.length > 22 ? d.label.slice(0, 21) + "…" : d.label,
  }));
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-slate-500">Sin puntos para mostrar.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={Math.max(240, rows.length * 34)}>
      <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 36, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#1e293b" />
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis type="category" dataKey="short" width={150} tick={{ fill: "#cbd5e1", fontSize: 12 }} interval={0} />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0" }}
          formatter={(v: number, n) => [`${v} pts`, n === "devPoints" ? "Desarrollo" : "QA"]}
        />
        <Legend
          formatter={(v) => (v === "devPoints" ? "Desarrollo (SP)" : "QA (Effort)")}
          wrapperStyle={{ fontSize: 12, color: "#cbd5e1" }}
        />
        <Bar dataKey="devPoints" name="devPoints" stackId="p" fill={DEV_COLOR} radius={[0, 0, 0, 0]} />
        <Bar dataKey="qaPoints" name="qaPoints" stackId="p" fill={QA_COLOR} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function PuntosFuncion({ data }: { data: PuntosFuncion }) {
  const { totalDev, totalQA, total } = data;
  const pctDev = total ? (totalDev / total) * 100 : 0;
  const pctQA = total ? (totalQA / total) * 100 : 0;
  const ratio = totalQA ? (totalDev / totalQA).toFixed(1) : "—";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<Code2 size={18} />}
          label="Puntos de Desarrollo"
          value={String(totalDev)}
          sub={`${pctDev.toFixed(0)}% del total`}
          accent={DEV_COLOR}
        />
        <StatCard
          icon={<TestTube2 size={18} />}
          label="Puntos de QA"
          value={String(totalQA)}
          sub={`${pctQA.toFixed(0)}% del total`}
          accent={QA_COLOR}
        />
        <StatCard
          icon={<Sigma size={18} />}
          label="Total / Ratio Dev:QA"
          value={String(total)}
          sub={`${ratio} : 1`}
          accent="#a78bfa"
        />
      </div>

      {/* Barra de proporción Dev vs QA */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-slate-400">
          <span style={{ color: DEV_COLOR }}>Desarrollo {totalDev}</span>
          <span style={{ color: QA_COLOR }}>QA {totalQA}</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-slate-800">
          <div style={{ width: `${pctDev}%`, background: DEV_COLOR }} />
          <div style={{ width: `${pctQA}%`, background: QA_COLOR }} />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Por responsable</h4>
          <SplitBars data={data.porResponsable} />
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Por fase del proceso</h4>
          <SplitBars data={data.porFase} />
        </div>
      </div>
    </div>
  );
}
