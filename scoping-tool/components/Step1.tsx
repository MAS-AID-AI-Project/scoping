'use client'

import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ProblemDef, StakeholderRow, ProblemTemplate } from '@/lib/types'

interface Props {
  template?: ProblemTemplate
  problemDef: ProblemDef
  onUpdate: (field: string, value: unknown) => void
  onUpdateStakeholder: (id: string, field: keyof StakeholderRow, value: string) => void
  onAddStakeholder: () => void
  onDeleteStakeholder: (id: string) => void
}

export default function Step1({ template, problemDef, onUpdate, onUpdateStakeholder, onAddStakeholder, onDeleteStakeholder }: Props) {
  const [contextOpen, setContextOpen] = useState(true)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Problem Definition</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Read the context below carefully. Transform the vague situation into a precise problem statement, and identify what each stakeholder cares about.
        </p>
      </div>

      {template && (
        <div className="bg-slate-800 text-slate-100 rounded-2xl overflow-hidden">
          <button
            onClick={() => setContextOpen(o => !o)}
            className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold hover:bg-slate-700 transition-colors"
          >
            <span>Given context — {template.title}</span>
            {contextOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>
          {contextOpen && (
            <div className="px-6 pb-6 space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Organisation & Setting</p>
                <p className="text-sm leading-relaxed text-slate-300">{template.context}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">The Situation</p>
                <p className="text-sm leading-relaxed text-slate-300">{template.situation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">People Involved</p>
                <div className="space-y-3">
                  {template.stakeholders.map(s => (
                    <div key={s.role}>
                      <p className="text-sm font-semibold text-slate-200">{s.role}</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <Card title="Refined Problem Statement">
        <p className="text-xs text-slate-400 mb-3">
          2–3 sentences: what exactly is the problem, for whom, and what is the measurable impact of not solving it?
        </p>
        <textarea rows={4} value={problemDef.problemStatement}
          onChange={e => onUpdate('problemStatement', e.target.value)}
          placeholder="e.g. ICU nurses at Regional Medical Centre lack a systematic way to identify patients trending toward deterioration between physician rounds, resulting in delayed intervention and preventable adverse events."
          className={inputCls} />
      </Card>

      <Card title="Root Cause Analysis">
        <p className="text-xs text-slate-400 mb-3">
          Why does this problem exist? What structural, process, or data gap causes it?
        </p>
        <textarea rows={3} value={problemDef.rootCause}
          onChange={e => onUpdate('rootCause', e.target.value)}
          placeholder="e.g. Clinical data is captured in the EHR but never analysed in real time. Nurses rely on manual observation and individual judgement, which varies across shifts and teams."
          className={inputCls} />
      </Card>

      <Card title="Current Process">
        <p className="text-xs text-slate-400 mb-3">
          How is this handled today? What steps, tools, and people are involved?
        </p>
        <textarea rows={3} value={problemDef.currentProcess}
          onChange={e => onUpdate('currentProcess', e.target.value)}
          placeholder="e.g. Nurses check vitals manually every hour and escalate concerns verbally to the attending physician. No automated alert exists outside scheduled rounds."
          className={inputCls} />
      </Card>

      <Card title="Stakeholders & Their Priorities">
        <p className="text-xs text-slate-400 mb-4">
          For each stakeholder, define what they care about and how they would measure success. Roles are pre-filled from the given context — refine as needed.
        </p>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 px-1">
            {['Stakeholder', 'Primary Concerns', 'Success Metrics'].map(h => (
              <p key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{h}</p>
            ))}
          </div>
          {problemDef.stakeholders.map(row => (
            <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 items-start">
              <input type="text" value={row.role} onChange={e => onUpdateStakeholder(row.id, 'role', e.target.value)}
                placeholder="Role" className={inputCls} />
              <input type="text" value={row.concerns} onChange={e => onUpdateStakeholder(row.id, 'concerns', e.target.value)}
                placeholder="What they care about" className={inputCls} />
              <input type="text" value={row.metrics} onChange={e => onUpdateStakeholder(row.id, 'metrics', e.target.value)}
                placeholder="How they measure success" className={inputCls} />
              {problemDef.stakeholders.length > 1 && (
                <button onClick={() => onDeleteStakeholder(row.id)} className="text-slate-300 hover:text-rose-400 transition-colors pt-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={onAddStakeholder} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1">
            <Plus className="w-3.5 h-3.5" /> Add stakeholder
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
