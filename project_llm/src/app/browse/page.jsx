'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { BarChart2, Search, Building2, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

const VERDICT_STYLE = {
  ALIGNÉ:             { label: 'Aligné',             cls: 'bg-emerald-500/15 text-emerald-400' },
  PRUDENT:            { label: 'Prudent',             cls: 'bg-yellow-500/10 text-yellow-400'  },
  OPTIMISTE_EXCESSIF: { label: 'Optimiste excessif',  cls: 'bg-yellow-500/10 text-yellow-300'  },
  ALARMANT:           { label: 'Alarmant',            cls: 'bg-red-500/10 text-red-400'        },
}

export default function BrowsePage() {
  const [reports, setReports] = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports/list?limit=50')
      .then(r => r.json())
      .then(d => setReports(d.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = reports.filter(r =>
    r.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.fiscal_year?.toLowerCase().includes(search.toLowerCase()) ||
    r.verdict?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950/10 to-[#020817]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-8">
          <h1 className="mb-1 text-3xl font-black">Explorer les analyses</h1>
          <p className="text-sm text-gray-400">Toutes les analyses réalisées par Quantara, triées par date</p>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <Search className="text-gray-500" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par entreprise, exercice, verdict…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <BarChart2 size={40} className="mx-auto mb-4 opacity-30" />
            <p>Aucune analyse enregistrée pour le moment</p>
            <Link href="/" className="mt-4 inline-block text-sm text-emerald-400 hover:underline">Lancer une première analyse →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => {
              const v      = VERDICT_STYLE[r.verdict] ?? { label: r.verdict ?? '—', cls: 'bg-white/5 text-gray-400' }
              const score  = r.alignment_score ?? 0
              const sColor = score >= 70 ? 'text-emerald-400' : score >= 50 ? 'text-yellow-400' : 'text-red-400'
              const date   = r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '—'

              return (
                <Link
                  key={r.id}
                  href={`/results?id=${r.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Building2 className="text-emerald-400" size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{r.company_name || 'Rapport sans titre'}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {r.fiscal_year && <span>{r.fiscal_year}</span>}
                      <span className="flex items-center gap-1"><Clock size={11} />{date}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${v.cls}`}>{v.label}</span>
                    <span className={`text-2xl font-black ${sColor}`}>{score}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
