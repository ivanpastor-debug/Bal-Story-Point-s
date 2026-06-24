import type { ResponsableItem } from "@/lib/metrics";

export default function ResponsableTable({ data }: { data: ResponsableItem[] }) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="max-h-[420px] overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-slate-900/95 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="py-2 pr-2 font-medium">Responsable</th>
            <th className="py-2 px-2 font-medium">HU</th>
            <th className="py-2 px-2 font-medium" title="Puntos de desarrollo (Story Points)">Dev</th>
            <th className="py-2 px-2 font-medium" title="Puntos de QA (Effort QA)">QA</th>
            <th className="py-2 px-2 font-medium">Cumpl.</th>
            <th className="py-2 pl-2 font-medium">Avance</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.responsable} className="border-t border-slate-800/70">
              <td className="py-2 pr-2 text-slate-200">{d.responsable}</td>
              <td className="py-2 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-slate-300">{d.count}</span>
                  <span className="h-1.5 flex-1 rounded-full bg-slate-800">
                    <span
                      className="block h-1.5 rounded-full bg-sky-500"
                      style={{ width: `${(d.count / maxCount) * 100}%` }}
                    />
                  </span>
                </div>
              </td>
              <td className="py-2 px-2 font-medium text-sky-300">{d.storyPoints}</td>
              <td className="py-2 px-2 font-medium text-amber-300">{d.qaPoints}</td>
              <td className="py-2 px-2 text-slate-400">{d.cumplidas}</td>
              <td className="py-2 pl-2 text-slate-300">{(d.avance * 100).toFixed(0)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
