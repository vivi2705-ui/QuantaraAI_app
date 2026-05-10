'use client'

export default function KPIGrid({ kpis }) {
  // Show nothing if no real data — never show placeholder/fictional KPIs
  if (!kpis?.length) return null

  return (
    <div className="mt-6">
      <h2 className="mb-4 text-lg font-bold text-gray-300">Indicateurs financiers clés</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {kpis.map((kpi, i) => {
          const color =
            (kpi.trend === 'up'   && kpi.good_direction === 'up')   ? 'text-emerald-400' :
            (kpi.trend === 'down' && kpi.good_direction === 'down')  ? 'text-emerald-400' :
            kpi.trend === 'neutral'                                   ? 'text-gray-400'    :
                                                                        'text-red-400'
          return (
            <div key={i} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-emerald-500/30">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-500">{kpi.name}</p>
              <p className={`text-3xl font-black ${color}`}>{kpi.value}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
