import KpiCard from './KpiCard';

export default function KpiGrid({ kpis }) {
  return (
    <div
      data-testid="kpi-grid"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      {kpis.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
