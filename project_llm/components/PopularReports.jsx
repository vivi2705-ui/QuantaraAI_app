'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Clock, Building2 } from 'lucide-react'

export default function PopularReports() {
  const [reports, setReports] = useState([])

  useEffect(() => {
    fetch('/api/reports/list?limit=6')
      .then(r => r.json())
      .then(d => setReports(d.reports ?? []))
      .catch(() => {})
  }, [])

  if (reports.length === 0) return null

  return (
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-5xl">

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={22} />
            <h2 className="text-2xl font-black">Analyses récentes</h2>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300">
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map(r => {
            const score  = r.alignment_score ?? r.credit_score ?? 0
            const color  = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
            const date   = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'

            return (
              <Link
                key={r.id}
                href={`/results?id=${r.id}`}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/30"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Building2 className="text-emerald-400" size={18} />
                  </div>
                  <span className={`text-2xl font-black ${color}`}>{score}</span>
                </div>
                <p className="mb-1 font-bold leading-tight group-hover:text-emerald-400 transition">
                  {r.company_name || 'Rapport sans titre'}
                </p>
                <p className="text-xs text-gray-500">{r.fiscal_year || ''}</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-gray-600">
                  <Clock size={11} />
                  {date}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
