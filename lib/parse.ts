import * as XLSX from "xlsx";
import { norm } from "./etapas";
import type { HU, Dataset } from "./types";

// Mapa de "etiqueta normalizada de encabezado" -> clave canónica del campo.
const HEADER_MAP: Record<string, keyof HU | "ignore"> = {
  "fecha corte": "fechaCorte",
  "work item id": "id",
  "titulo": "titulo",
  "sprint": "sprint",
  "etapa inicio sprint": "etapaInicio",
  "etapa fin sprint comprometida": "etapaFinComprometida",
  "etapa actual": "etapaActual",
  "% actual": "pctActual",
  "cumplida": "cumplida",
  "responsable": "responsable",
  "story points": "storyPoints",
  "effort (qa)": "effortQA",
  "cycle time total (dias)": "cycleTotalDias",
  "cycle time etapa actual (dias)": "cycleEtapaActualDias",
  "fecha t0 (inicio cycle time)": "fechaInicio",
  "fecha cambio etapa actual": "fechaCambioEtapa",
};

function toNum(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fmtDate(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number") {
    const d = XLSX.SSF ? XLSX.SSF.parse_date_code(v) : null;
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  return v ? String(v).slice(0, 10) : "";
}

export function parseWorkbook(buf: ArrayBuffer): Dataset {
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false });
  if (rows.length < 2) throw new Error("El archivo no contiene filas de datos.");

  const headers = (rows[0] as unknown[]).map((h) => norm(String(h ?? "")));

  // Detecta columnas "Cycle time {Etapa} - días"
  const cycleCols: { idx: number; etapa: string }[] = [];
  headers.forEach((h, idx) => {
    const m = h.match(/^cycle time (.+) - dias$/);
    if (m && m[1] !== "total" && m[1] !== "etapa actual") {
      cycleCols.push({ idx, etapa: m[1] });
    }
  });

  const fieldIdx: Partial<Record<keyof HU, number>> = {};
  headers.forEach((h, idx) => {
    const key = HEADER_MAP[h];
    if (key && key !== "ignore") fieldIdx[key] = idx;
  });

  const hu: HU[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    const idVal = fieldIdx.id !== undefined ? row[fieldIdx.id] : null;
    if (idVal === null || idVal === undefined || idVal === "") continue;

    const get = (k: keyof HU) => (fieldIdx[k] !== undefined ? row[fieldIdx[k]!] : undefined);

    const cyclePorEtapa: Record<string, number> = {};
    for (const { idx, etapa } of cycleCols) {
      const n = toNum(row[idx]);
      if (n && n > 0) cyclePorEtapa[etapa] = n;
    }

    const cumplidaRaw = String(get("cumplida") ?? "").trim().toLowerCase();

    hu.push({
      id: String(idVal),
      titulo: String(get("titulo") ?? ""),
      sprint: String(get("sprint") ?? ""),
      etapaInicio: String(get("etapaInicio") ?? ""),
      etapaFinComprometida: String(get("etapaFinComprometida") ?? ""),
      etapaActual: String(get("etapaActual") ?? ""),
      pctActual: toNum(get("pctActual")) ?? 0,
      cumplida: cumplidaRaw === "si" || cumplidaRaw === "sí" || cumplidaRaw === "yes" || cumplidaRaw === "true",
      responsable: String(get("responsable") ?? "Sin asignar").trim() || "Sin asignar",
      storyPoints: toNum(get("storyPoints")),
      effortQA: toNum(get("effortQA")),
      cycleTotalDias: toNum(get("cycleTotalDias")),
      cycleEtapaActualDias: toNum(get("cycleEtapaActualDias")),
      fechaCorte: fmtDate(get("fechaCorte")),
      fechaInicio: fmtDate(get("fechaInicio")),
      fechaCambioEtapa: fmtDate(get("fechaCambioEtapa")),
      cyclePorEtapa,
    });
  }

  if (!hu.length) throw new Error("No se encontraron HU válidas (revisa la columna 'Work Item ID').");

  const sprints = Array.from(new Set(hu.map((h) => h.sprint).filter(Boolean))).sort();
  const fechaCorte = hu[0].fechaCorte || "";

  const fechas = hu.map((h) => h.fechaInicio).filter(Boolean).sort();
  const minFecha = fechas[0] ?? "";
  const maxFecha = fechas[fechas.length - 1] ?? "";

  return { fechaCorte, sprints, hu, minFecha, maxFecha };
}
