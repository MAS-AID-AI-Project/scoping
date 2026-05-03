'use client'

import { Plus, Trash2 } from 'lucide-react'
import { uid, SUGGESTED_REGS, type Problem, type FeasibilityEntry, type RegEntry } from '@/lib/types'

interface Props {
  keptProblems: Problem[]
  feasibility: Record<string, FeasibilityEntry>
  selectedId: string | null
  onUpdate: (id: string, field: keyof FeasibilityEntry, value: unknown) => void
  onSelect: (id: string) => void
}

const emptyFe = (): FeasibilityEntry => ({
  dataVolume: '',
  dataLabels: '',
  syntheticDataNote: '',
  computeBudget: '',
  modelingStack: '',
  regulations: [],
})

export default function Step3({ keptProblems, feasibility, selectedId, onUpdate, onSelect }: Props) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold text-slate-900">Feasibility deep-dive</h2>
        <p className="mt-2 text-slate-500 text-sm leading-relaxed">
          Compare your remaining candidates across three dimensions: data, technical readiness,
          and regulatory constraints. Then{' '}
          <strong className="text-slate-700">select the single most feasible problem</strong> to
          take forward.
        </p>
      </div>

      <div
        className={`grid gap-5 items-start ${
          keptProblems.length === 1
            ? 'max-w-lg'
            : keptProblems.length === 2
            ? 'grid-cols-2'
            : 'grid-cols-3'
        }`}
      >
        {keptProblems.map(p => {
          const fe: FeasibilityEntry = feasibility[p.id] ?? emptyFe()
          const isSelected = selectedId === p.id

          const updateRegs = (regs: RegEntry[]) => onUpdate(p.id, 'regulations', regs)

          const addReg = (name = '') => {
            updateRegs([...fe.regulations, { id: uid(), name, articles: '' }])
          }

          const updateReg = (regId: string, field: keyof RegEntry, value: string) => {
            updateRegs(fe.regulations.map(r => r.id === regId ? { ...r, [field]: value } : r))
          }

          const removeReg = (regId: string) => {
            updateRegs(fe.regulations.filter(r => r.id !== regId))
          }

          return (
            <div
              key={p.id}
              className={[
                'bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200',
                isSelected
                  ? 'border-indigo-400 ring-2 ring-indigo-100'
                  : 'border-slate-100 hover:border-slate-300',
              ].join(' ')}
            >
              {/* column header */}
              <div className={`px-4 py-3 border-b ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-100'}`}>
                <p className={`font-semibold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {p.title || '(Untitled)'}
                </p>
              </div>

              <div className="p-4 space-y-5">

                {/* ── Data Readiness ── */}
                <Section title="Data Readiness">
                  <Field label="Volume / Description">
                    <textarea
                      rows={2}
                      placeholder="e.g. 1.2M records in CSV, 10 years of history"
                      value={fe.dataVolume}
                      onChange={e => onUpdate(p.id, 'dataVolume', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Labelled data available?">
                    <div className="flex gap-2 flex-wrap">
                      {(['yes', 'partial', 'no'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => onUpdate(p.id, 'dataLabels', fe.dataLabels === v ? '' : v)}
                          className={[
                            'px-3 py-1 rounded-lg text-xs font-medium border transition-all capitalize',
                            fe.dataLabels === v
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300',
                          ].join(' ')}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Synthetic data viable?">
                    <textarea
                      rows={2}
                      placeholder="If real data is sparse or restricted, is synthetic generation an option?"
                      value={fe.syntheticDataNote}
                      onChange={e => onUpdate(p.id, 'syntheticDataNote', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </Section>

                {/* ── Technical Readiness ── */}
                <Section title="Technical Readiness">
                  <Field label="Compute budget">
                    <input
                      type="text"
                      placeholder="e.g. GPU cluster, cloud credits, CPU only"
                      value={fe.computeBudget}
                      onChange={e => onUpdate(p.id, 'computeBudget', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Modelling stack / architectures">
                    <input
                      type="text"
                      placeholder="e.g. PyTorch + HuggingFace, Scikit-learn, XGBoost"
                      value={fe.modelingStack}
                      onChange={e => onUpdate(p.id, 'modelingStack', e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </Section>

                {/* ── Regulatory & Compliance ── */}
                <Section title="Regulatory & Compliance">
                  <p className="text-xs text-slate-400 -mt-1 leading-relaxed">
                    Add each applicable regulation and note the specific articles or
                    sub-requirements that constrain your design.
                  </p>

                  {/* regulation entries */}
                  <div className="space-y-3">
                    {fe.regulations.map(reg => (
                      <div
                        key={reg.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2"
                      >
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={reg.name}
                            onChange={e => updateReg(reg.id, 'name', e.target.value)}
                            placeholder="Regulation name (e.g. EU AI Act)"
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                          />
                          <button
                            onClick={() => removeReg(reg.id)}
                            className="text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={reg.articles}
                          onChange={e => updateReg(reg.id, 'articles', e.target.value)}
                          placeholder="Specific articles / sub-requirements that apply to this use case…"
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>

                  {/* add button */}
                  <button
                    onClick={() => addReg()}
                    className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add regulation
                  </button>

                  {/* suggestion chips */}
                  <div className="space-y-1.5">
                    <p className="text-xs text-slate-400">Quick-add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_REGS.filter(
                        name => !fe.regulations.some(r => r.name === name)
                      ).map(name => (
                        <button
                          key={name}
                          onClick={() => addReg(name)}
                          className="px-2.5 py-1 rounded-full text-xs border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                          + {name}
                        </button>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* select button */}
                <button
                  onClick={() => onSelect(p.id)}
                  className={[
                    'w-full py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50',
                  ].join(' ')}
                >
                  {isSelected ? '✓ Selected' : 'Select this problem'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-600">{label}</p>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition bg-white'
