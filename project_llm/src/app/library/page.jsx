'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '../../../components/Navbar'
import Footer from '../../../components/Footer'
import { FileText, Search, Upload, Download, BarChart2, Clock } from 'lucide-react'

export default function LibraryPage() {
  const [uploads, setUploads] = useState([])
  const [search,  setSearch]  = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/library/list')
      .then(r => r.json())
      .then(d => setUploads(d.uploads ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = uploads.filter(u =>
    u.filename?.toLowerCase().includes(search.toLowerCase()) ||
    u.company_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950/10 to-[#020817]">
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-12">

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-black">Librairie de rapports</h1>
            <p className="text-sm text-gray-400">Documents partagés par la communauté Quantara</p>
          </div>
          <Link href="/#upload" className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-300">
            <Upload size={16} /> Ajouter un rapport
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <Search className="text-gray-500" size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom d'entreprise ou fichier…"
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <FileText size={40} className="mx-auto mb-4 opacity-30" />
            <p>Aucun document trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(u => (
              <div key={u.id} className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-emerald-500/30">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileText className="text-emerald-400" size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{u.company_name || u.filename}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{u.uploaded_at ? new Date(u.uploaded_at).toLocaleDateString('fr-FR') : '—'}</span>
                    {u.fiscal_year && <span>{u.fiscal_year}</span>}
                    <span>{u.size_mb ? `${u.size_mb} MB` : ''}</span>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={`/api/library/download/${u.id}`}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-gray-400 transition hover:border-white/20 hover:text-white"
                  >
                    <Download size={13} /> PDF
                  </a>
                  <Link
                    href={`/results?upload_id=${u.id}`}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/25"
                  >
                    <BarChart2 size={13} /> Analyser
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </main>
  )
}
