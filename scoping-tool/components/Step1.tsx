'use client'

import { Plus, Trash2, Lightbulb } from 'lucide-react'
import type { Problem } from '@/lib/types'

interface Props {
  problems: Problem[]
  onAdd: () => void
  onDelete: (id: string) => void
  onChange: (id: string, field: keyof Problem, value: string) => void
}

const FIELD_CONFIG: {
  key: keyof Problem
  label: string
  hint: string
  multiline: boolean
}[] = [
  {
    key: 'title',
    label: 'Problem Title',
    hint: 'e.g. "Manual Loan Application Review"',
    multiline: false,
  },
  {
    key: 'challenge',
    label: 'The Business Challenge',
    hint: 'What is broken right now? Include quantifiable pain where possible. e.g. "Takes 3–5 days, 35% applicant drop-off."',
    multiline: true,
  },
  {
    key: 'endUsers',
    label: 'End Users',
    hint: 'Who suffers from this problem day-to-day?',
    multiline: false,
  },
  {
    key: 'currentSolution',
    label: 'Current Non-AI Solution',
    hint: 'How is this handled today?',
    multiline: true,
  },
]

const ACCENT = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-sky-500',
  'bg-emerald-500',
  'bg-rose-500',
]

export default function Step1({ problems, onAdd, onDelete, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* header */}
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-slate-900">Identify your problems</h2>
        <p className="mt-2 text-slate-500 text-sm leading-relaxed">
          Add up to 5 real problems from your domain. Don&apos;t filter yet — quantity first,
          quality later. Be specific: a good problem statement includes who is affected and
          what the measurable cost is.
        </p>
      </div>

      {/* cards */}
      <div className="grid gap-5">
        {problems.map((p, idx) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* card header strip */}
            <div className={`${ACCENT[idx % ACCENT.length]} px-5 py-3 flex items-center justify-between`}>
              <span className="text-white font-semibold text-sm tracking-wide">
                Problem {idx + 1}
              </span>
              {problems.length > 1 && (
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label="Delete problem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* fields */}
            <div className="px-5 py-5 grid gap-4">
              {FIELD_CONFIG.map(({ key, label, hint, multiline }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    {label}
                  </label>
                  {multiline ? (
                    <textarea
                      rows={3}
                      value={p[key] as string}
                      onChange={e => onChange(p.id, key, e.target.value)}
                      placeholder={hint}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition"
                    />
                  ) : (
                    <input
                      type="text"
                      value={p[key] as string}
                      onChange={e => onChange(p.id, key, e.target.value)}
                      placeholder={hint}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* add button */}
      {problems.length < 5 && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add another problem
          <span className="text-xs text-slate-400">({problems.length}/5)</span>
        </button>
      )}

      {/* tip */}
      <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 max-w-2xl">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Tip:</strong> The best scoping documents come from a real operational pain —
          something you or your organisation actually deals with. Avoid made-up examples.
        </p>
      </div>
    </div>
  )
}
