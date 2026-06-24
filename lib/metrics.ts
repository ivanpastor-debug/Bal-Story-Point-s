import { ETAPAS, FASES, findEtapa, norm, type Fase } from "./etapas";
import type { HU } from "./types";

export interface Kpis {
  totalHU: number;
  cumplidas: number;
  pctCumplidas: number;
  avancePromedio: number; // 0..1, ponderado por story points
  avanceSimple: number; // 0..1, promedio simple
  storyPoints: number;
  cycleTimePromedio: number;
  enDevolucion: number;
  estancadas: number;
}

export interface PipelineItem {
  orden: number;
  etapa: string;
  fase: Fase;
  pct: number;
  count: number;
  devolucion: boolean;
}

export interface FaseItem {
  fase: Fase;
  count: number;
  storyPoints: number;
}

export interface BottleneckItem {
  orden: number;
  etapa: string;
  fase: Fase;
  totalDias: number;
  promedioDias: number;
  nHU: number;
}

export interface ResponsableItem {
  responsable: string;
  count: number;
  storyPoints: number;
  avance: number; // promedio simple 0..1
  cumplidas: number;
}

export interface Alerta {
  id: string;
  titulo: string;
  responsable: string;
  etapaActual: string;
  tipo: "Devolución" | "Estancada";
  detalle: string;
}

// Umbral (días) para considerar una HU "estancada" en su etapa actual.
export const UMBRAL_ESTANCADA = 7;

export function computeKpis(hu: HU[]): Kpis {
  const totalHU = hu.length;
  const cumplidas = hu.filter((h) => h.cumplida).length;
  const sp = hu.reduce((a, h) => a + (h.storyPoints ?? 0), 0);

  const avanceSimple = totalHU ? hu.reduce((a, h) => a + h.pctActual, 0) / totalHU : 0;
  const spTot = hu.reduce((a, h) => a + (h.storyPoints ?? 0), 0);
  const avancePonderado = spTot
    ? hu.reduce((a, h) => a + h.pctActual * (h.storyPoints ?? 0), 0) / spTot
    : avanceSimple;

  const cts = hu.map((h) => h.cycleTotalDias).filter((v): v is number => v !== null);
  const cycleTimePromedio = cts.length ? cts.reduce((a, b) => a + b, 0) / cts.length : 0;

  const enDevolucion = hu.filter((h) => findEtapa(h.etapaActual)?.devolucion).length;
  const estancadas = hu.filter(
    (h) => !h.cumplida && (h.cycleEtapaActualDias ?? 0) >= UMBRAL_ESTANCADA
  ).length;

  return {
    totalHU,
    cumplidas,
    pctCumplidas: totalHU ? cumplidas / totalHU : 0,
    avancePromedio: avancePonderado,
    avanceSimple,
    storyPoints: sp,
    cycleTimePromedio,
    enDevolucion,
    estancadas,
  };
}

export function computePipeline(hu: HU[]): PipelineItem[] {
  const counts = new Map<string, number>();
  for (const h of hu) {
    const e = findEtapa(h.etapaActual);
    if (e) counts.set(e.key, (counts.get(e.key) ?? 0) + 1);
  }
  return ETAPAS.map((e) => ({
    orden: e.orden,
    etapa: e.key,
    fase: e.fase,
    pct: e.pct,
    count: counts.get(e.key) ?? 0,
    devolucion: e.devolucion,
  }));
}

export function computeFases(hu: HU[]): FaseItem[] {
  const acc = new Map<Fase, { count: number; sp: number }>();
  for (const f of FASES) acc.set(f, { count: 0, sp: 0 });
  for (const h of hu) {
    const e = findEtapa(h.etapaActual);
    if (!e) continue;
    const a = acc.get(e.fase)!;
    a.count += 1;
    a.sp += h.storyPoints ?? 0;
  }
  return FASES.map((f) => ({ fase: f, count: acc.get(f)!.count, storyPoints: acc.get(f)!.sp }));
}

export function computeBottlenecks(hu: HU[]): BottleneckItem[] {
  // Acumula cycle time (días) por etapa a partir del desglose por HU.
  const acc = new Map<string, { total: number; n: number }>();
  for (const h of hu) {
    for (const [etapaNorm, dias] of Object.entries(h.cyclePorEtapa)) {
      const cur = acc.get(etapaNorm) ?? { total: 0, n: 0 };
      cur.total += dias;
      cur.n += 1;
      acc.set(etapaNorm, cur);
    }
  }
  return ETAPAS.map((e) => {
    const a = acc.get(norm(e.key)) ?? { total: 0, n: 0 };
    return {
      orden: e.orden,
      etapa: e.key,
      fase: e.fase,
      totalDias: a.total,
      promedioDias: a.n ? a.total / a.n : 0,
      nHU: a.n,
    };
  }).filter((b) => b.totalDias > 0);
}

export function computeResponsables(hu: HU[]): ResponsableItem[] {
  const acc = new Map<string, { count: number; sp: number; avance: number; cumplidas: number }>();
  for (const h of hu) {
    const cur = acc.get(h.responsable) ?? { count: 0, sp: 0, avance: 0, cumplidas: 0 };
    cur.count += 1;
    cur.sp += h.storyPoints ?? 0;
    cur.avance += h.pctActual;
    cur.cumplidas += h.cumplida ? 1 : 0;
    acc.set(h.responsable, cur);
  }
  return Array.from(acc.entries())
    .map(([responsable, a]) => ({
      responsable,
      count: a.count,
      storyPoints: a.sp,
      avance: a.count ? a.avance / a.count : 0,
      cumplidas: a.cumplidas,
    }))
    .sort((a, b) => b.count - a.count);
}

export function computeAlertas(hu: HU[]): Alerta[] {
  const out: Alerta[] = [];
  for (const h of hu) {
    const e = findEtapa(h.etapaActual);
    if (e?.devolucion) {
      out.push({
        id: h.id,
        titulo: h.titulo,
        responsable: h.responsable,
        etapaActual: h.etapaActual,
        tipo: "Devolución",
        detalle: `Reproceso en "${e.key}" (penaliza ${e.discriminado} pts)`,
      });
    } else if (!h.cumplida && (h.cycleEtapaActualDias ?? 0) >= UMBRAL_ESTANCADA) {
      out.push({
        id: h.id,
        titulo: h.titulo,
        responsable: h.responsable,
        etapaActual: h.etapaActual,
        tipo: "Estancada",
        detalle: `${(h.cycleEtapaActualDias ?? 0).toFixed(1)} días en la etapa actual`,
      });
    }
  }
  return out.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === "Devolución" ? -1 : 1));
}

export function orderByEtapa(a: string, b: string): number {
  const ea = findEtapa(a)?.orden ?? 999;
  const eb = findEtapa(b)?.orden ?? 999;
  return ea - eb;
}
