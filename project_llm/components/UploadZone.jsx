'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, CheckCircle, AlertCircle, Loader, X, FileText, Database } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function UploadZone() {
  const router = useRouter()
  const [files,   setFiles]   = useState([])   // array of File objects
  const [status,  setStatus]  = useState('idle') // idle | ready | loading | storing | error
  const [error,   setError]   = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      setError(`${rejected.length} fichier(s) refusé(s) — PDF uniquement, max 20 MB`)
      return
    }
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name))
      const fresh = accepted.filter(f => !names.has(f.name))
      return [...prev, ...fresh]
    })
    setError(null)
    setStatus('ready')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: true,
  })

  const removeFile = (name) => {
    const next = files.filter(f => f.name !== name)
    setFiles(next)
    if (next.length === 0) setStatus('idle')
  }

  // Upload + analyse immediately
  const handleAnalyze = async () => {
    if (!files.length) return
    setStatus('loading')
    setError(null)
    try {
      const ids = await uploadAll(files, '/api/upload')
      // Single → go to results. Multi → go to compare page
      if (ids.length === 1) {
        router.push(`/results?id=${ids[0]}`)
      } else {
        router.push(`/compare?ids=${ids.join(',')}`)
      }
    } catch (err) {
      setError(err.message)
      setStatus('ready')
    }
  }

  // Upload to library only (no analysis)
  const handleStoreOnly = async () => {
    if (!files.length) return
    setStatus('storing')
    setError(null)
    try {
      await uploadAll(files, '/api/library/upload')
      router.push('/library')
    } catch (err) {
      setError(err.message)
      setStatus('ready') 
    } 
  }

  const idle = status === 'idle'
  const ready = status === 'ready'
  const busy  = status === 'loading' || status === 'storing'

  const zoneClass = [
    'flex w-full max-w-3xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 p-12 text-center transition-all duration-200',
    isDragActive ? 'scale-[1.01] border-emerald-400 bg-emerald-500/10' : '',
    idle         ? 'border-dashed border-white/20 bg-white/[0.02] hover:border-emerald-400 hover:bg-emerald-500/5' : '',
    ready        ? 'border-emerald-500/50 bg-emerald-500/5' : '',
    busy         ? 'border-emerald-500/40 bg-emerald-500/5' : '',
    status === 'error' ? 'border-red-500/40 bg-red-500/5' : '',
  ].filter(Boolean).join(' ')

  return (
    <section id="upload" className="flex flex-col items-center gap-5 px-6 pb-24">

      {/* Drop zone */}
      <div {...getRootProps()} className={zoneClass}>
        <input {...getInputProps()} />

        {/* IDLE */}
        {idle && (
          <>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <UploadCloud className="text-emerald-400" size={48} />
            </div>
            <h2 className="mb-2 text-xl font-semibold"> 
              Glissez vos rapports <strong>(PDF)</strong> ou cliquez pour sélectionner
            </h2>
            <p className="text-sm text-gray-400">
              {isDragActive ? 'Relâchez pour uploader…' : 'Un ou plusieurs fichiers • Analyse groupée disponible'}
            </p>
            <p className="mt-2 text-xs text-gray-600">Maximum 20 MB par fichier · PDF uniquement</p>
          </>
        )}

        {/* FILES READY */}
        {ready && (
          <div className="w-full max-w-lg space-y-3" onClick={e => e.stopPropagation()}>
            {files.map(f => (
              <div key={f.name} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <FileText className="shrink-0 text-emerald-400" size={20} />
                <div className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold">{f.name}</p>
                  <p className="text-xs text-gray-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button onClick={() => removeFile(f.name)} className="shrink-0 text-gray-500 transition hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
            ))}
            <p className="pt-1 text-center text-xs text-gray-500">
              + Cliquez pour ajouter d'autres fichiers
            </p>
          </div>
        )}

        {/* LOADING */}
        {busy && (
          <>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
              <Loader className="animate-spin text-emerald-400" size={44} />
            </div>
            <h2 className="mb-2 text-xl font-semibold">
              {status === 'storing' ? 'Enregistrement en cours…' : 'Analyse en cours…'}
            </h2>
            <p className="text-sm text-gray-400">
              {status === 'storing'
                ? 'Vos fichiers sont enregistrés dans la librairie'
                : `Traitement de ${files.length} rapport(s) — ~30s par fichier`}
            </p>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-400">⚠ {error}</p>}

      {/* Action buttons */}
      {ready && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 rounded-2xl bg-emerald-400 px-8 py-4 font-bold text-black shadow-lg shadow-emerald-500/30 transition hover:scale-105 hover:bg-emerald-300 active:scale-100"
          >
            <UploadCloud size={18} />
            {files.length > 1 ? `Analyser ${files.length} rapports` : 'Lancer l\'analyse IA'}
          </button>
          <button
            onClick={handleStoreOnly}
            className="flex items-center gap-2 rounded-2xl border border-white/15 px-8 py-4 font-semibold text-gray-300 transition hover:border-emerald-500/40 hover:text-emerald-400"
          >
            <Database size={18} />
            Enregistrer dans la librairie
          </button>
        </div>
      )}

    </section>
  )
}

// ── Helper : upload files one by one, return array of ids ────────────────────
async function uploadAll(files, endpoint) {
  const ids = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)
    const res  = await fetch(endpoint, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `Erreur upload : ${file.name}`)
    ids.push(data.id)
  }
  return ids
}

