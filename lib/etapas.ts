// Catálogo de etapas del proceso de desarrollo.
// Fuente: "tabla de ponderación de estados.xlsx" (dimensión estable, embebida).

export type Fase = "Requerimiento" | "DEV" | "QA" | "Cliente" | "PMO Gerencia";

export interface Etapa {
  orden: number;
  key: string; // texto exacto usado en el archivo maestro ("Etapa actual")
  fase: Fase;
  pct: number; // % de avance acumulado (0..1)
  discriminado: number; // puntos que aporta/resta la etapa
  devolucion: boolean; // true = reproceso/retroceso
}

export const ETAPAS: Etapa[] = [
  { orden: 0, key: "0. Pendiente Levantamiento", fase: "Requerimiento", pct: 0.04, discriminado: 4, devolucion: false },
  { orden: 1, key: "1. Levantamiento", fase: "Requerimiento", pct: 0.08, discriminado: 4, devolucion: false },
  { orden: 2, key: "2.Elaboración HU", fase: "Requerimiento", pct: 0.12, discriminado: 4, devolucion: false },
  { orden: 3, key: "3. Aprobación de HU y Artefactos", fase: "Requerimiento", pct: 0.16, discriminado: 4, devolucion: false },
  { orden: 4, key: "4. Refinamiento", fase: "Requerimiento", pct: 0.17, discriminado: -3, devolucion: true },
  { orden: 5, key: "5. Backlog General", fase: "DEV", pct: 0.2, discriminado: 4, devolucion: false },
  { orden: 6, key: "6. Desarrollo", fase: "DEV", pct: 0.3, discriminado: 10, devolucion: false },
  { orden: 7, key: "6.1 Esperando Despliegue DEV-QA", fase: "DEV", pct: 0.4, discriminado: 10, devolucion: false },
  { orden: 8, key: "6.2 Ajustes DEV", fase: "DEV", pct: 0.45, discriminado: -5, devolucion: true },
  { orden: 9, key: "7. Backlog QA", fase: "QA", pct: 0.5, discriminado: 10, devolucion: false },
  { orden: 10, key: "7.1 Pruebas QA", fase: "QA", pct: 0.6, discriminado: 10, devolucion: false },
  { orden: 11, key: "7.2 Aprobación por Cliente QA", fase: "QA", pct: 0.7, discriminado: 10, devolucion: false },
  { orden: 12, key: "8. Esperando Despliegue QA-UAT", fase: "Cliente", pct: 0.8, discriminado: 10, devolucion: false },
  { orden: 13, key: "8.1 Pruebas UAT", fase: "Cliente", pct: 0.85, discriminado: 5, devolucion: false },
  { orden: 14, key: "8.2 Aprobación por Cliente UAT", fase: "Cliente", pct: 0.9, discriminado: 5, devolucion: false },
  { orden: 15, key: "9. Esperando Despliegue UAT-PROD", fase: "Cliente", pct: 0.95, discriminado: 5, devolucion: false },
  { orden: 16, key: "10. En producción", fase: "PMO Gerencia", pct: 1.0, discriminado: 5, devolucion: false },
];

export const FASES: Fase[] = ["Requerimiento", "DEV", "QA", "Cliente", "PMO Gerencia"];

export const FASE_COLOR: Record<Fase, string> = {
  Requerimiento: "#6366f1", // indigo
  DEV: "#0ea5e9", // sky
  QA: "#f59e0b", // amber
  Cliente: "#10b981", // emerald
  "PMO Gerencia": "#22c55e", // green
};

// Normaliza texto para emparejar etapas / encabezados (sin acentos, minúsculas).
export function norm(s: string): string {
  return s
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const ETAPA_BY_NORM = new Map(ETAPAS.map((e) => [norm(e.key), e]));

export function findEtapa(raw: string | null | undefined): Etapa | undefined {
  if (!raw) return undefined;
  return ETAPA_BY_NORM.get(norm(raw));
}
