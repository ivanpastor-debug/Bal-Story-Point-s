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
  storyPoints: number | null;
  effortQA: number | null;
  cycleTotalDias: number | null;
  cycleEtapaActualDias: number | null;
  fechaCorte: string;
  // cycle time (días) por nombre de etapa
  cyclePorEtapa: Record<string, number>;
}

export interface Dataset {
  fechaCorte: string;
  sprints: string[];
  hu: HU[];
}
