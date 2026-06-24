"use client";

import { useEffect, useMemo, useState } from "react";
import { parseWorkbook } from "@/lib/parse";
import type { Dataset, HU } from "@/lib/types";
import FileUpload from "@/components/FileUpload";
import Filters, { type FilterState } from "@/components/Filters";
import Dashboard from "@/components/Dashboard";
import { findEtapa } from "@/lib/etapas";
import { LayoutDashboard, RefreshCw, Trash2, Clock3 } from "lucide-react";

const STORAGE_KEY = "balu:dataset";
const STORAGE_TS = "balu:updatedAt";

const FILTROS_INICIALES: FilterState = {
  fase: "Todas",
  responsable: "Todos",
  cumplida: "Todas",
  fechaDesde: "",
  fechaHasta: "",
};

export default function Page() {
  const [data, setData] = useState<Dataset | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(FILTROS_INICIALES);

  // Restaura el último corte cargado (acceso para actualizar sin volver a subir el archivo).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw) as Dataset);
        setUpdatedAt(localStorage.getItem(STORAGE_TS));
      }
    } catch {
      /* almacenamiento no disponible o corrupto: se ignora */
    }
  }, []);

  async function handleFile(file: File) {
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const ds = parseWorkbook(buf);
      const ts = new Date().toISOString();
      setData(ds);
      setUpdatedAt(ts);
      setFilters(FILTROS_INICIALES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ds));
        localStorage.setItem(STORAGE_TS, ts);
      } catch {
        /* sin persistencia: el tablero sigue funcionando en memoria */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  }

  function clearData() {
    setData(null);
    setUpdatedAt(null);
    setFilters(FILTROS_INICIALES);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TS);
    } catch {
      /* nada que limpiar */
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
      // Filtro por rango de fecha de inicio (t0). Las HU sin fecha no se descartan.
      if (h.fechaInicio) {
        if (filters.fechaDesde && h.fechaInicio < filters.fechaDesde) return false;
        if (filters.fechaHasta && h.fechaInicio > filters.fechaHasta) return false;
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
        <div className="flex items-center gap-3">
          {data && (
            <button
              onClick={clearData}
              title="Quitar el corte cargado"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
            >
              <Trash2 size={15} />
              Limpiar
            </button>
          )}
          <FileUpload onFile={handleFile} hasData={!!data} />
        </div>
      </header>

      {updatedAt && (
        <p className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 size={13} />
          Última actualización: {new Date(updatedAt).toLocaleString("es-CO")}
        </p>
      )}

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
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-indigo-500/15 text-indigo-300">
          <RefreshCw size={22} />
        </div>
        <h2 className="text-lg font-medium text-slate-200">Sube el archivo maestro para empezar</h2>
        <p className="mt-2 text-sm text-slate-400">
          Carga el <code className="rounded bg-slate-800 px-1.5 py-0.5">archivo_maestro.xlsx</code> con
          el corte del sprint. Todo el procesamiento ocurre en tu navegador; nada se envía a un servidor.
          El último corte queda guardado en este equipo y puedes <strong>actualizarlo</strong> cuando quieras.
        </p>
      </div>
    </div>
  );
}
