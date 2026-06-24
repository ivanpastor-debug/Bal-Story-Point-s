"use client";

import { useMemo, useState } from "react";
import { parseWorkbook } from "@/lib/parse";
import type { Dataset, HU } from "@/lib/types";
import FileUpload from "@/components/FileUpload";
import Filters, { type FilterState } from "@/components/Filters";
import Dashboard from "@/components/Dashboard";
import { findEtapa } from "@/lib/etapas";
import { LayoutDashboard } from "lucide-react";

export default function Page() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    fase: "Todas",
    responsable: "Todos",
    cumplida: "Todas",
  });

  async function handleFile(file: File) {
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const ds = parseWorkbook(buf);
      setData(ds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
      setData(null);
    }
  }

  const filtered: HU[] = useMemo(() => {
    if (!data) return [];
    return data.hu.filter((h) => {
      if (filters.responsable !== "Todos" && h.responsable !== filters.responsable) return false;
      if (filters.cumplida === "Cumplidas" && !h.cumplida) return false;
      if (filters.cumplida === "Pendientes" && h.cumplida) return false;
      if (filters.fase !== "Todas") {
        const e = findEtapa(h.etapaActual);
        if (!e || e.fase !== filters.fase) return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/20 text-indigo-300">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-100">Tablero de seguimiento de HU</h1>
            <p className="text-sm text-slate-400">
              Proyecto BALÚ · proceso de desarrollo por etapas
              {data?.fechaCorte ? ` · corte ${data.fechaCorte}` : ""}
            </p>
          </div>
        </div>
        <FileUpload onFile={handleFile} hasData={!!data} />
      </header>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!data ? (
        <EmptyState />
      ) : (
        <>
          <Filters data={data} value={filters} onChange={setFilters} />
          <Dashboard hu={filtered} />
        </>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-20 text-center">
      <div className="max-w-md">
        <h2 className="text-lg font-medium text-slate-200">Sube el archivo maestro para empezar</h2>
        <p className="mt-2 text-sm text-slate-400">
          Carga el <code className="rounded bg-slate-800 px-1.5 py-0.5">archivo_maestro.xlsx</code> con
          el corte del sprint. Todo el procesamiento ocurre en tu navegador; nada se envía a un servidor.
        </p>
      </div>
    </div>
  );
}
