export interface HU {
  id: string;
  titulo: string;
  sprint: string;
  etapaInicio: string;
  etapaFinComprometida: string;
  etapaActual: string;
  pctActual: number; // 0..1
  cumplida: boolean;
  responsable: string;
  storyPoints: number | null; // puntos de desarrollo (Story Points)
  effortQA: number | null; // puntos de QA (Effort QA)
  cycleTotalDias: number | null;
  cycleEtapaActualDias: number | null;
  fechaCorte: string;
  fechaInicio: string; // t0: inicio del cycle time (YYYY-MM-DD), "" si no hay
  fechaCambioEtapa: string; // entrada a la etapa actual (YYYY-MM-DD), "" si no hay
  // cycle time (días) por nombre de etapa
  cyclePorEtapa: Record<string, number>;
}

export interface Dataset {
  fechaCorte: string;
  sprints: string[];
  hu: HU[];
  // rango de fechas de inicio (t0) presente en los datos
  minFecha: string;
  maxFecha: string;
}
