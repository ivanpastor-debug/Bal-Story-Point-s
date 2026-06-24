"use client";

import { useMemo, useState } from "react";
import type { HU } from "@/lib/types";
import { FASE_COLOR, findEtapa } from "@/lib/etapas";
import { orderByEtapa } from "@/lib/metrics";
import { ArrowUpDown, Search } from "lucide-react";

type SortKey = "etapa" | "pct" | "cycle" | "sp" | "qa";

export default function HuTable({ hu }: { hu: HU[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("etapa");
  const [asc, setAsc] = useState(true);

  const rows = useMemo(() => {
    const ql = q.toLowerCase();
    const f = hu.filter(
      (h) => !ql || h.titulo.toLowerCase().includes(ql) || h.id.includes(ql) || h.responsable.toLowerCase().includes(ql)
    );
    const dir = asc ? 1 : -1;
    return [...f].sort((a, b) => {
      switch (sort) {
        case "pct":
          return (a.pctActual - b.pctActual) * dir;
        case "cycle":
          return ((a.cycleEtapaActualDias ?? 0) - (b.cycleEtapaActualDias ?? 0)) * dir;
        case "sp":
          return ((a.storyPoints ?? 0) - (b.storyPoints ?? 0)) * dir;
        case "qa":
          return ((a.effortQA ?? 0) - (b.effortQA ?? 0)) * dir;
        default:
          return orderByEtapa(a.etapaActual, b.etapaActual) * dir;
      }
    });
  }, [hu, q, sort, asc]);

  function toggleSort(k: SortKey) {
    if (sort === k) setAsc(!asc);
    else {
      setSort(k);
      setAsc(true);
    }
  }

  const Th = ({ k, children, className = "" }: { k: SortKey; children: React.ReactNode; className?: string }) => (
    <th className={`py-2 px-3 font-medium ${className}`}>
      <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-slate-200">
        {children}
        <ArrowUpDown size={12} className={sort === k ? "text-indigo-400" : "text-slate-600"} />
      </button>
    </th>
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
        <Search size={16} className="text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, ID o responsable…"
          className="w-full bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
        />
        <span className="text-xs text-slate-500">{rows.length} HU</span>
      </div>

      <div className="max-h-[560px] overflow-auto rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-900/95 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 px-3 font-medium">ID</th>
              <th className="py-2 px-3 font-medium">Título</th>
              <Th k="etapa">Etapa actual</Th>
              <Th k="pct" className="text-right">Avance</Th>
              <Th k="cycle" className="text-right">Días etapa</Th>
              <Th k="sp" className="text-right">Dev</Th>
              <Th k="qa" className="text-right">QA</Th>
              <th className="py-2 px-3 font-medium">Responsable</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((h) => {
              const e = findEtapa(h.etapaActual);
              const color = e ? (e.devolucion ? "#ef4444" : FASE_COLOR[e.fase]) : "#64748b";
              return (
                <tr key={h.id} className="border-t border-slate-800/70 hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-slate-400">{h.id}</td>
                  <td className="py-2 px-3 text-slate-200">
                    <span className="line-clamp-1 max-w-[360px]" title={h.titulo}>
                      {h.titulo}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="inline-flex items-center gap-1.5 text-slate-300">
                      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                      {h.etapaActual}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-2">
                      <span className="h-1.5 w-16 rounded-full bg-slate-800">
                        <span
                          className="block h-1.5 rounded-full"
                          style={{ width: `${h.pctActual * 100}%`, background: color }}
                        />
                      </span>
                      <span className="w-9 text-right text-slate-300">{(h.pctActual * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-right text-slate-400">
                    {h.cycleEtapaActualDias != null ? h.cycleEtapaActualDias.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 px-3 text-right text-sky-300">{h.storyPoints ?? "—"}</td>
                  <td className="py-2 px-3 text-right text-amber-300">{h.effortQA ?? "—"}</td>
                  <td className="py-2 px-3 text-slate-400">
                    <span className="line-clamp-1 max-w-[160px]" title={h.responsable}>
                      {h.responsable}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
