'use client'

import { Plus, Trash2 } from 'lucide-react'
import type { MetricsData, BaselineEntry } from '@/lib/types'

interface Props {
  metrics: MetricsData
  onUpdate: (field: string, value: unknown) => void
  onUpdateObjective: (i: number, v: string) => void
  onAddObjective: () => void
  onDeleteObjective: (i: number) => void
  onUpdateSecondary: (i: number, v: string) => void
  onAddSecondary: () => void
  onDeleteSecondary: (i: number) => void
  onUpdateBaseline: (id: string, field: keyof BaselineEntry, value: string) => void
  onAddBaseline: () => void
  onDeleteBaseline: (id: string) => void
}

export default function Step2({
  metrics, onUpdate,
  onUpdateObjective, onAddObjective, onDeleteObjective,
  onUpdateSecondary, onAddSecondary, onDeleteSecondary,
  onUpdateBaseline, onAddBaseline, onDeleteBaseline,
}: Props) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Success Metrics</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Define what success looks like in concrete, measurable terms — and identify the baselines any solution must beat.
        </p>
      </div>

      <Card title="Objectives">
        <p className="text-xs text-slate-400 mb-3">
          Each objective should be concrete and measurable. Use the format &ldquo;Reduce X from A to B&rdquo; or &ldquo;Achieve X% Y.&rdquo;
        </p>
        <div className="space-y-2">
          {metrics.objectives.map((obj, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">{i + 1}.</span>
              <input type="text" value={obj} onChange={e => onUpdateObjective(i, e.target.value)}
                placeholder="e.g. Reduce ICU deterioration events by 30% within 6 months of deployment"
                className={inputCls} />
              {metrics.objectives.length > 1 && (
                <button onClick={() => onDeleteObjective(i)} className="text-slate-300 hover:text-rose-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={onAddObjective} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">
            <Plus className="w-3.5 h-3.5" /> Add objective
          </button>
        </div>
      </Card>

      <Card title="Primary Success Metric (KPI)">
        <p className="text-xs text-slate-400 mb-3">
          The single most important metric you would use to judge whether the solution worked.
        </p>
        <input type="text" value={metrics.primaryMetric}
          onChange={e => onUpdate('primaryMetric', e.target.value)}
          placeholder="e.g. 30-day ICU deterioration event rate (target: ≤5%)"
          className={inputCls} />
      </Card>

      <Card title="Secondary Metrics">
        <p className="text-xs text-slate-400 mb-3">
          Supporting metrics that matter but are not the primary judge of success.
        </p>
        <div className="space-y-2">
          {metrics.secondaryMetrics.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="text-slate-300 text-sm">•</span>
              <input type="text" value={m} onChange={e => onUpdateSecondary(i, e.target.value)}
                placeholder="e.g. False positive alert rate (target: <20%)"
                className={inputCls} />
              {metrics.secondaryMetrics.length > 1 && (
                <button onClick={() => onDeleteSecondary(i)} className="text-slate-300 hover:text-rose-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={onAddSecondary} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">
            <Plus className="w-3.5 h-3.5" /> Add metric
          </button>
        </div>
      </Card>

      <Card title="Baselines to Beat">
        <p className="text-xs text-slate-400 mb-4">
          What does the current approach achieve? What does any new solution need to improve upon? Include both the current process and any existing automated tools.
        </p>
        <div className="space-y-2">
          <div className="grid grid-cols-[1.2fr_1fr_1fr_2rem] gap-2 px-1">
            {['Approach / System', 'Current Performance', 'Target Improvement'].map(h => (
              <p key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</p>
            ))}
          </div>
          {metrics.baselines.map(b => (
            <div key={b.id} className="grid grid-cols-[1.2fr_1fr_1fr_2rem] gap-2 items-start">
              <input type="text" value={b.approach} onChange={e => onUpdateBaseline(b.id, 'approach', e.target.value)}
                placeholder="Manual nurse observation" className={inputCls} />
              <input type="text" value={b.performance} onChange={e => onUpdateBaseline(b.id, 'performance', e.target.value)}
                placeholder="18% event rate" className={inputCls} />
              <input type="text" value={b.target} onChange={e => onUpdateBaseline(b.id, 'target', e.target.value)}
                placeholder="≤12% event rate" className={inputCls} />
              {metrics.baselines.length > 1 && (
                <button onClick={() => onDeleteBaseline(b.id)} className="text-slate-300 hover:text-rose-400 transition-colors pt-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={onAddBaseline} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">
            <Plus className="w-3.5 h-3.5" /> Add baseline
          </button>
        </div>
      </Card>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition'
