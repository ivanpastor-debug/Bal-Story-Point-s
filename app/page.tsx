"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { parseWorkbook } from "@/lib/parse";
import type { Dataset, HU } from "@/lib/types";
import FileUpload from "@/components/FileUpload";
import Filters, { type FilterState } from "@/components/Filters";
import Dashboard from "@/components/Dashboard";
import { findEtapa } from "@/lib/etapas";
import { LayoutDashboard, RefreshCw, Database, FolderSync, Loader2 } from "lucide-react";

// Archivo servido desde public/. Reemplázalo y haz push para actualizar el tablero.
const REPO_FILE = "/archivo_maestro.xlsx";
const STORAGE_KEY = "balu:dataset";
const STORAGE_TS = "balu:updatedAt";

type Source = "auto" | "manual";

const FILTROS_INICIALES: FilterState = {
  fase: "Todas",
  responsable: "Todos",
  cumplida: "Todas",
  fechaDesde: "",
  fechaHasta: "",
};

export default function Page() {
  const [data, setData] = useState<Dataset | null>(null);
  const [source, setSource] = useState<Source>("auto");
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(FILTROS_INICIALES);

  // Carga automática del archivo del repositorio (sin subir nada a mano).
  const loadFromRepo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(REPO_FILE, { cache: "no-store" });
      if (!res.ok) throw new Error(`No se encontró el archivo del repositorio (HTTP ${res.status}).`);
      const buf = await res.arrayBuffer();
      const ds = parseWorkbook(buf);
      const lm = res.headers.get("last-modified");
      setData(ds);
      setSource("auto");
      setUpdatedAt(lm ? new Date(lm).toISOString() : new Date().toISOString());
      setFilters(FILTROS_INICIALES);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cargar el archivo del repositorio.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Al abrir: usa un corte manual guardado si existe; si no, carga el del repositorio.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setData(JSON.parse(raw) as Dataset);
        setUpdatedAt(localStorage.getItem(STORAGE_TS));
        setSource("manual");
        setLoading(false);
        return;
      }
    } catch {
      /* almacenamiento no disponible: continúa con la carga automática */
    }
    void loadFromRepo();
  }, [loadFromRepo]);

  // Subida manual opcional (sobrescribe temporalmente los datos del repositorio).
  async function handleFile(file: File) {
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const ds = parseWorkbook(buf);
      const ts = new Date().toISOString();
      setData(ds);
      setSource("manual");
      setUpdatedAt(ts);
      setFilters(FILTROS_INICIALES);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ds));
        localStorage.setItem(STORAGE_TS, ts);
      } catch {
        /* sin persistencia: sigue en memoria */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  }

  // Vuelve a los datos del repositorio (descarta el corte manual guardado).
  function usarRepositorio() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_TS);
    } catch {
      /* nada que limpiar */
    }
    void loadFromRepo();
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
      if (h.fechaInicio) {
        if (filters.fechaDesde && h.fechaInicio < filters.fechaDesde) return false;
        if (filters.fechaHasta && h.fechaInicio > filters.fechaHasta) return false;
      }
      return true;
    });
  }, [data, filters]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      <header className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
        <div className="flex items-center gap-2">
          <button
            onClick={source === "manual" ? usarRepositorio : loadFromRepo}
            disabled={loading}
            title={source === "manual" ? "Volver a los datos del repositorio" : "Recargar el archivo del repositorio"}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
            {source === "manual" ? "Usar datos del repositorio" : "Recargar"}
          </button>
          <FileUpload onFile={handleFile} hasData={!!data} />
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          {source === "auto" ? <Database size={13} /> : <FolderSync size={13} />}
          Fuente: {source === "auto" ? "archivo del repositorio (carga automática)" : "archivo subido manualmente"}
        </span>
        {updatedAt && <span>· Actualizado: {new Date(updatedAt).toLocaleString("es-CO")}</span>}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid place-items-center rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-20 text-center">
          <Loader2 size={28} className="animate-spin text-indigo-300" />
          <p className="mt-3 text-sm text-slate-400">Cargando datos del repositorio…</p>
        </div>
      ) : !data ? (
        <EmptyState onRetry={loadFromRepo} />
      ) : (
        <>
          <Filters data={data} value={filters} onChange={setFilters} />
          <Dashboard hu={filtered} />
        </>
      )}
    </main>
  );
}

function EmptyState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-20 text-center">
      <div className="max-w-md">
        <h2 className="text-lg font-medium text-slate-200">No se pudieron cargar los datos</h2>
        <p className="mt-2 text-sm text-slate-400">
          El tablero carga automáticamente el <code className="rounded bg-slate-800 px-1.5 py-0.5">archivo_maestro.xlsx</code>{" "}
          del repositorio. Si falló, reintenta o sube uno manualmente.
        </p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <RefreshCw size={16} />
          Reintentar carga
        </button>
      </div>
    </div>
  );
}
