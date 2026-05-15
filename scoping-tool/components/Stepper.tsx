const STEPS = [
  'Problem Definition',
  'Success Metrics',
  'Solution Space',
  'Feasibility',
  'Final Document',
]

export default function Stepper({ current }: { current: number }) {
  return (
    <nav className="flex items-center overflow-x-auto pb-0.5">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center shrink-0">
            <div className={`flex items-center gap-1.5 px-1 py-2 text-xs font-medium transition-colors ${
              active ? 'text-indigo-600' : done ? 'text-slate-400' : 'text-slate-300'
            }`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                active ? 'bg-indigo-600 text-white' : done ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-300'
              }`}>
                {done ? '✓' : n}
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-px mx-1 shrink-0 ${done ? 'bg-slate-300' : 'bg-slate-100'}`} />
            )}
          </div>
        )
      })}
    </nav>
  )
}
