'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, BookOpen, Upload } from 'lucide-react'

const links = [
  { href: '/',         label: 'Analyser',  icon: BarChart2 },
  { href: '/library',  label: 'Librairie', icon: BookOpen  },
  { href: '/browse',   label: 'Explorer',  icon: Upload    },
]

export default function Navbar() {
  const path = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020817]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 shadow-lg shadow-emerald-500/30">
            <span className="text-lg font-black text-black">Q</span>
          </div>
          <div>
            <p className="text-lg font-bold leading-none">
              Quan<span className="text-emerald-400">tara</span>
            </p>
            <p className="text-xs text-gray-400">Discours vs Réalité</p>
          </div>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </div>

      </div>
    </nav>
  )
}
