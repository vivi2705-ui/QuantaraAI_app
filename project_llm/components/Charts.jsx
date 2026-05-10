'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const DEFAULT_DATA = [
  { year: '2020', alignement: 72, reel: 68 },
  { year: '2021', alignement: 65, reel: 55 },
  { year: '2022', alignement: 78, reel: 60 },
  { year: '2023', alignement: 58, reel: 48 },
  { year: '2024', alignement: 45, reel: 38 },
]

function Tip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f2137] p-3 text-sm">
      <p className="mb-2 text-gray-400">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }} className="font-bold">{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Charts({ data }) {
  const d = data?.length ? data : DEFAULT_DATA
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
      <h2 className="mb-6 text-2xl font-bold">Évolution Alignement</h2>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={d}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} domain={[30, 90]} />
          <Tooltip content={<Tip />} />
          <Line type="monotone" dataKey="alignement" name="Discours" stroke="#34d399" strokeWidth={2.5} dot={{ fill: '#34d399', r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="reel" name="Réalité" stroke="#facc15" strokeWidth={2.5} strokeDasharray="5 4" dot={{ fill: '#facc15', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
