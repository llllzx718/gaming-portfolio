import { getIcon } from '../lib/icons';

export default function KpiCard({ kpi }) {
  const Icon = getIcon(kpi.icon);
  return (
    <div
      data-elastic-card
      data-elastic-id={kpi.label}
      data-color1="#10142a"
      data-color2="#05060f"
      data-radius="16"
      data-resolution="12"
      className="relative overflow-hidden rounded-2xl"
    >
      <div className="relative z-10 flex flex-col gap-1 p-5">
        <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-slate-400">
          <Icon className="h-4 w-4 text-accent" strokeWidth={1.75} />
          {kpi.label}
        </span>
        <span className="text-2xl font-semibold text-slate-100">{kpi.value}</span>
        {kpi.delta && <span className="text-xs text-cyan-300/80">{kpi.delta}</span>}
      </div>
    </div>
  );
}
