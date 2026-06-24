"use client";

import { useMemo } from "react";
import { FASES, type Fase } from "@/lib/etapas";
import type { Dataset } from "@/lib/types";

export interface FilterState {
  fase: Fase | "Todas";
  responsable: string;
  cumplida: "Todas" | "Cumplidas" | "Pendientes";
  fechaDesde: string; // YYYY-MM-DD (inicio t0), "" = sin límite
  fechaHasta: string; // YYYY-MM-DD (inicio t0), "" = sin límite
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Filters({
  data,
  value,
  onChange,
}: {
  data: Dataset;
  value: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const responsables = useMemo(
    () => Array.from(new Set(data.hu.map((h) => h.responsable))).sort(),
    [data]
  );

  const limpio: FilterState = {
    fase: "Todas",
    responsable: "Todos",
    cumplida: "Todas",
    fechaDesde: "",
    fechaHasta: "",
  };
  const activo =
    value.fase !== "Todas" ||
    value.responsable !== "Todos" ||
    value.cumplida !== "Todas" ||
    value.fechaDesde !== "" ||
    value.fechaHasta !== "";

  const DateInput = ({ label, val, onChange: oc }: { label: string; val: string; onChange: (v: string) => void }) => (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <input
        type="date"
        value={val}
        min={data.minFecha || undefined}
        max={data.maxFecha || undefined}
        onChange={(e) => oc(e.target.value)}
        className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 [color-scheme:dark]"
      />
    </label>
  );

  return (
    <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <Select
        label="Fase"
        value={value.fase}
        onChange={(v) => onChange({ ...value, fase: v as FilterState["fase"] })}
        options={[{ value: "Todas", label: "Todas las fases" }, ...FASES.map((f) => ({ value: f, label: f }))]}
      />
      <Select
        label="Responsable"
        value={value.responsable}
        onChange={(v) => onChange({ ...value, responsable: v })}
        options={[{ value: "Todos", label: "Todos" }, ...responsables.map((r) => ({ value: r, label: r }))]}
      />
      <Select
        label="Estado"
        value={value.cumplida}
        onChange={(v) => onChange({ ...value, cumplida: v as FilterState["cumplida"] })}
        options={[
          { value: "Todas", label: "Todas" },
          { value: "Cumplidas", label: "Cumplidas" },
          { value: "Pendientes", label: "Pendientes" },
        ]}
      />
      <DateInput label="Inicio (t0) desde" val={value.fechaDesde} onChange={(v) => onChange({ ...value, fechaDesde: v })} />
      <DateInput label="hasta" val={value.fechaHasta} onChange={(v) => onChange({ ...value, fechaHasta: v })} />
      {activo && (
        <button
          onClick={() => onChange(limpio)}
          className="ml-auto rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
