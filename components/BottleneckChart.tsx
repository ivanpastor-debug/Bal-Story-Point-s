"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BottleneckItem } from "@/lib/metrics";
import { FASE_COLOR } from "@/lib/etapas";

export default function BottleneckChart({ data }: { data: BottleneckItem[] }) {
  const chartData = [...data]
    .sort((a, b) => b.promedioDias - a.promedioDias)
    .map((d) => ({
      ...d,
      short: d.etapa.length > 26 ? d.etapa.slice(0, 25) + "…" : d.etapa,
    }));

  if (!chartData.length) {
    return <p className="py-10 text-center text-sm text-slate-500">Sin datos de cycle time por etapa.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(280, chartData.length * 30)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 44, top: 4, bottom: 4 }}>
        <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} unit=" d" />
        <YAxis type="category" dataKey="short" width={210} tick={{ fill: "#cbd5e1", fontSize: 12 }} interval={0} />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0" }}
          formatter={(v: number, _n, p) => [
            `${v.toFixed(1)} días prom.`,
            `${p.payload.nHU} HU · ${p.payload.totalDias.toFixed(1)} d acum.`,
          ]}
        />
        <Bar dataKey="promedioDias" radius={[0, 4, 4, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={FASE_COLOR[d.fase]} />
          ))}
          <LabelList dataKey="promedioDias" position="right" fill="#e2e8f0" fontSize={12} formatter={(v: number) => v.toFixed(1)} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
