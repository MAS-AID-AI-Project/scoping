'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'Ideation', sub: 'Define problems' },
  { n: 2, label: 'AI Sieve', sub: 'AI vs. automation' },
  { n: 3, label: 'Feasibility', sub: 'Deep-dive analysis' },
  { n: 4, label: 'Specification', sub: 'Final document' },
]

export default function Stepper({ current }: { current: number }) {
  return (
    <nav aria-label="Progress" className="flex items-center justify-center gap-0 py-6 px-4">
      {STEPS.map((step, idx) => {
        const done = current > step.n
        const active = current === step.n
        return (
          <div key={step.n} className="flex items-center">
            {/* circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
                  done
                    ? 'bg-indigo-600 text-white'
                    : active
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                    : 'bg-white text-slate-400 border-2 border-slate-200',
                ].join(' ')}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={2.5} /> : step.n}
              </div>
              <div className="hidden sm:flex flex-col items-center">
                <span
                  className={`text-xs font-semibold leading-none ${
                    active ? 'text-indigo-600' : done ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{step.sub}</span>
              </div>
            </div>

            {/* connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-1 rounded transition-colors duration-300 ${
                  current > step.n ? 'bg-indigo-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
