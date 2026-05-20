'use client'

import { PROBLEM_TEMPLATES } from '@/lib/problems'
import type { ProblemId } from '@/lib/types'
import { Plus } from 'lucide-react'

const COLOR_MAP: Record<string, { badge: string; border: string; hover: string }> = {
  emerald: { badge: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200', hover: 'hover:border-emerald-400 hover:shadow-emerald-100' },
  indigo:  { badge: 'bg-indigo-50 text-indigo-700',   border: 'border-indigo-200',  hover: 'hover:border-indigo-400 hover:shadow-indigo-100'  },
  amber:   { badge: 'bg-amber-50 text-amber-700',     border: 'border-amber-200',   hover: 'hover:border-amber-400 hover:shadow-amber-100'   },
}

interface Props {
  code: string
  onSelect: (id: ProblemId) => void
  onCustom: () => void
}

export default function ProblemSelect({ code, onSelect, onCustom }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900">AI Scoping Tool</span>
          <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md">Team: {code}</span>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Choose your problem</h2>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            Pick one of the three real-world problems below, or bring your own. Read the context carefully — your team will define the problem precisely in the next step.
          </p>

          <div className="grid gap-4 mb-6">
            {PROBLEM_TEMPLATES.filter(t => t.id !== 'loan').map(t => {
              const c = COLOR_MAP[t.color] ?? COLOR_MAP.indigo
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t.id)}
                  className={`text-left w-full bg-white rounded-2xl border-2 ${c.border} ${c.hover} shadow-sm hover:shadow-md p-6 transition-all`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{t.domain}</span>
                      </div>
                      <h3 className="text-base font-semibold text-slate-900 mb-2">{t.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-3 line-clamp-2">{t.context}</p>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Stakeholders involved</p>
                        <div className="flex flex-wrap gap-1.5">
                          {t.stakeholders.map(s => (
                            <span key={s.role} className="text-xs bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                              {s.role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Custom problem */}
          <button
            onClick={onCustom}
            className="w-full text-left bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-300 p-6 transition-all flex items-center gap-4 group"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center shrink-0 transition-colors">
              <Plus className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Bring your own problem</p>
              <p className="text-xs text-slate-400 mt-0.5">Define a custom context, situation, and stakeholders from scratch.</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  )
}
