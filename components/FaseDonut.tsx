"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FaseItem } from "@/lib/metrics";
import { FASE_COLOR } from "@/lib/etapas";

export default function FaseDonut({ data }: { data: FaseItem[] }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  const filtered = data.filter((d) => d.count > 0);

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row">
      <ResponsiveContainer width="100%" height={220} className="md:!w-1/2">
        <PieChart>
          <Pie data={filtered} dataKey="count" nameKey="fase" innerRadius={55} outerRadius={85} paddingAngle={2}>
            {filtered.map((d) => (
              <Cell key={d.fase} fill={FASE_COLOR[d.fase]} stroke="#0b1020" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, color: "#e2e8f0" }}
            formatter={(v: number) => [`${v} HU`, ""]}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="w-full space-y-2 md:w-1/2">
        {data.map((d) => (
          <li key={d.fase} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-300">
              <span className="h-3 w-3 rounded-sm" style={{ background: FASE_COLOR[d.fase] }} />
              {d.fase}
            </span>
            <span className="text-slate-400">
              {d.count} HU{total ? ` · ${((d.count / total) * 100).toFixed(0)}%` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
