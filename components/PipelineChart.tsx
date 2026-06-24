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
import type { PipelineItem } from "@/lib/metrics";
import { FASE_COLOR } from "@/lib/etapas";

export default function PipelineChart({ data }: { data: PipelineItem[] }) {
  // Etiquetas cortas para el eje
  const chartData = data.map((d) => ({
    ...d,
    short: d.etapa.length > 26 ? d.etapa.slice(0, 25) + "…" : d.etapa,
    color: d.devolucion ? "#ef4444" : FASE_COLOR[d.fase],
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(360, data.length * 26)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 36, top: 4, bottom: 4 }}>
        <XAxis type="number" allowDecimals={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="short"
          width={210}
          tick={{ fill: "#cbd5e1", fontSize: 12 }}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.08)" }}
          contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0" }}
          formatter={(v: number, _n, p) => [`${v} HU`, `${(p.payload.pct * 100).toFixed(0)}% · ${p.payload.fase}`]}
          labelFormatter={(l) => String(l)}
        />
        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
          {chartData.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
          <LabelList dataKey="count" position="right" fill="#e2e8f0" fontSize={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
