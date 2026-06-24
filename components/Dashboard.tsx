"use client";

import { useMemo } from "react";
import type { HU } from "@/lib/types";
import {
  computeAlertas,
  computeBottlenecks,
  computeFases,
  computeKpis,
  computePipeline,
  computeResponsables,
} from "@/lib/metrics";
import KpiCards from "./KpiCards";
import { Card } from "./Card";
import PipelineChart from "./PipelineChart";
import FaseDonut from "./FaseDonut";
import BottleneckChart from "./BottleneckChart";
import ResponsableTable from "./ResponsableTable";
import HuTable from "./HuTable";
import Alerts from "./Alerts";

export default function Dashboard({ hu }: { hu: HU[] }) {
  const kpis = useMemo(() => computeKpis(hu), [hu]);
  const pipeline = useMemo(() => computePipeline(hu), [hu]);
  const fases = useMemo(() => computeFases(hu), [hu]);
  const bottlenecks = useMemo(() => computeBottlenecks(hu), [hu]);
  const responsables = useMemo(() => computeResponsables(hu), [hu]);
  const alertas = useMemo(() => computeAlertas(hu), [hu]);

  if (!hu.length) {
    return (
      <p className="rounded-2xl border border-slate-800 bg-slate-900/40 px-4 py-16 text-center text-sm text-slate-400">
        No hay HU que coincidan con los filtros seleccionados.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <KpiCards k={kpis} />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Pipeline del proceso" subtitle="HU por etapa (rojo = devolución)" className="lg:col-span-2">
          <PipelineChart data={pipeline} />
        </Card>
        <Card title="Distribución por fase" subtitle="¿dónde está concentrado el sprint?">
          <FaseDonut data={fases} />
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Cuellos de botella" subtitle="cycle time promedio por etapa (días)">
          <BottleneckChart data={bottlenecks} />
        </Card>
        <Card title="Carga por responsable" subtitle="HU, story points y avance">
          <ResponsableTable data={responsables} />
        </Card>
      </div>

      <Card title="Alertas" subtitle="HU en devolución o estancadas (≥ 7 días en su etapa)">
        <Alerts data={alertas} />
      </Card>

      <Card title="Detalle de HU" subtitle="busca, ordena y revisa cada historia">
        <HuTable hu={hu} />
      </Card>
    </div>
  );
}
