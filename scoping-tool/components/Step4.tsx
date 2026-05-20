'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import { DEFAULT_SIEVE_QUESTIONS, SUGGESTED_REGS, uid, emptyApproachFeasibility } from '@/lib/types'
import type { FeasibilityData, ApproachFeasibility, SolutionApproach, RegEntry, SieveQuestion } from '@/lib/types'

interface Props {
  feasibility: FeasibilityData
  approaches: SolutionApproach[]
  onUpdate: (field: string, value: unknown) => void
  onUpdateApproach: (approachId: string, field: keyof ApproachFeasibility, value: unknown) => void
  onAddRegulation: (approachId: string, reg: RegEntry) => void
  onUpdateRegulation: (approachId: string, regId: string, field: keyof RegEntry, value: string) => void
  onDeleteRegulation: (approachId: string, regId: string) => void
  onAddCustomQuestion: (q: SieveQuestion) => void
  onDeleteCustomQuestion: (qid: string) => void
  onUpdateSieveAnswer: (approachId: string, qid: string, val: boolean) => void
}

export default function Step4({
  feasibility, approaches,
  onUpdate, onUpdateApproach,
  onAddRegulation, onUpdateRegulation, onDeleteRegulation,
  onAddCustomQuestion, onDeleteCustomQuestion, onUpdateSieveAnswer,
}: Props) {
  const named = approaches.filter(a => a.name.trim())
  const [activeIdx, setActiveIdx] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'right' | 'left' | ''>('')
  const [sieveIdx, setSieveIdx] = useState(0)
  const [newRegName, setNewRegName] = useState('')
  const [newQText, setNewQText] = useState('')
  const [showAddQ, setShowAddQ] = useState(false)

  const activeApproach = named[activeIdx]
  const af: ApproachFeasibility = activeApproach
    ? (feasibility.perApproach[activeApproach.id] ?? emptyApproachFeasibility())
    : emptyApproachFeasibility()

  const allQuestions = [...DEFAULT_SIEVE_QUESTIONS, ...feasibility.customQuestions]
  const sieveQ = allQuestions[sieveIdx]
  const sieveAnimClass = slideDir === 'right' ? 'slide-from-right' : slideDir === 'left' ? 'slide-from-left' : ''

  const navigateApproach = (newIdx: number) => {
    setSlideDir(newIdx > activeIdx ? 'right' : 'left')
    setSlideKey(k => k + 1)
    setActiveIdx(newIdx)
    setSieveIdx(0)
  }

  const navigateSieve = (newIdx: number) => {
    setSlideDir(newIdx > sieveIdx ? 'right' : 'left')
    setSlideKey(k => k + 1)
    setSieveIdx(newIdx)
  }

  const updateAF = (field: keyof ApproachFeasibility, value: unknown) => {
    if (!activeApproach) return
    onUpdateApproach(activeApproach.id, field, value)
  }

  const addReg = (name: string) => {
    if (!activeApproach) return
    onAddRegulation(activeApproach.id, { id: uid(), name, articles: '' })
    setNewRegName('')
  }

  const addCustomQ = () => {
    if (!newQText.trim()) return
    onAddCustomQuestion({ id: uid(), text: newQText.trim() })
    setNewQText('')
    setShowAddQ(false)
  }

  if (named.length === 0) {
    return (
      <div className="max-w-3xl text-center py-16 text-slate-400">
        <p className="text-sm">Go back to Step 3 and name your solution approaches first.</p>
      </div>
    )
  }

  const allDecided = named.every(a => feasibility.perApproach[a.id]?.sieveDecision)

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Feasibility Assessment</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Assess each candidate solution independently — data needs, compute, regulations, and
          whether AI is justified. You&apos;ll pick the most promising one at the end.
        </p>
      </div>

      {/* ── Approach tabs ──────────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {named.map((a, i) => {
          const done = !!feasibility.perApproach[a.id]?.sieveDecision
          return (
            <button
              key={a.id}
              onClick={() => navigateApproach(i)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all border-2 ${
                i === activeIdx
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : done
                    ? 'bg-white border-emerald-200 text-slate-700 hover:border-emerald-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {done && i !== activeIdx && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
              {a.name}
            </button>
          )
        })}
      </div>

      {/* ── Per-approach content ───────────────────────────────────────────── */}
      {activeApproach && (
        <div key={`${activeApproach.id}-${slideKey}`} className={sieveAnimClass}>

          {/* Approach recap */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-4 border border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Assessing</p>
            <p className="text-sm font-semibold text-slate-800">{activeApproach.name}</p>
            {activeApproach.description && (
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activeApproach.description}</p>
            )}
          </div>

          {/* Data Assets */}
          <Card title="Data Assets">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Data sources</label>
                <textarea rows={2} value={af.dataSources}
                  onChange={e => updateAF('dataSources', e.target.value)}
                  placeholder="e.g. Epic EHR (FHIR API) — vitals every 15 min, lab results, medication orders. Hospital admin system — patient demographics."
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Estimated volume</label>
                <textarea rows={2} value={af.dataVolume}
                  onChange={e => updateAF('dataVolume', e.target.value)}
                  placeholder="e.g. 5 years × 4,200 ICU admissions/yr = ~21,000 stays. ~500 vital readings per stay."
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
                  Label availability
                  <span className="ml-2 text-slate-400 font-normal normal-case tracking-normal">
                    (not required for unsupervised approaches)
                  </span>
                </label>
                <div className="flex gap-3">
                  {(['yes', 'partial', 'no'] as const).map(v => (
                    <label key={v} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all ${
                      af.dataLabels === v ? 'border-indigo-300 bg-indigo-50 text-indigo-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}>
                      <input type="radio" name={`labels-${activeApproach.id}`} value={v}
                        checked={af.dataLabels === v} onChange={() => updateAF('dataLabels', v)}
                        className="accent-indigo-600" />
                      {v === 'yes' ? 'Fully labelled' : v === 'partial' ? 'Partially labelled' : 'No labels / unsupervised'}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Data quality &amp; gaps</label>
                <textarea rows={2} value={af.dataQuality}
                  onChange={e => updateAF('dataQuality', e.target.value)}
                  placeholder="e.g. Class imbalance (~12.5% positive events). Missing vitals during transport. Some lab values absent for ~18% of admissions."
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Privacy &amp; access restrictions</label>
                <textarea rows={2} value={af.dataAccess}
                  onChange={e => updateAF('dataAccess', e.target.value)}
                  placeholder="e.g. PHI — all data must remain within hospital network. Epic FHIR API access requires IT and DPO sign-off. No data sharing with external APIs."
                  className={inputCls} />
              </div>
            </div>
          </Card>

          {/* Compute */}
          <Card title="Compute &amp; Infrastructure">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Available compute / budget</label>
                <textarea rows={2} value={af.computeBudget}
                  onChange={e => updateAF('computeBudget', e.target.value)}
                  placeholder="e.g. On-premise GPU server, no external cloud for patient data."
                  className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Modelling stack / tooling</label>
                <textarea rows={2} value={af.modelingStack}
                  onChange={e => updateAF('modelingStack', e.target.value)}
                  placeholder="e.g. XGBoost, LSTM, BioBERT. Python / PyTorch."
                  className={inputCls} />
              </div>
            </div>
          </Card>

          {/* Regulations */}
          <Card title="Regulatory &amp; Compliance Considerations">
            <p className="text-xs text-slate-400 mb-4">
              For each relevant regulation, identify <strong className="text-slate-500">which parts of your data pipeline and solution</strong> need compliance review — e.g. data collection, training, inference, human oversight, storage. You don&apos;t need to cite specific articles.
            </p>
            {af.regulations.length > 0 && (
              <div className="space-y-4 mb-4">
                {af.regulations.map(reg => (
                  <div key={reg.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input type="text" value={reg.name}
                        onChange={e => onUpdateRegulation(activeApproach.id, reg.id, 'name', e.target.value)}
                        placeholder="Regulation name" className={`${inputCls} font-semibold`} />
                      <button onClick={() => onDeleteRegulation(activeApproach.id, reg.id)}
                        className="text-slate-300 hover:text-rose-400 transition-colors shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea rows={3} value={reg.articles}
                      onChange={e => onUpdateRegulation(activeApproach.id, reg.id, 'articles', e.target.value)}
                      placeholder="e.g. Data collection — patient consent required. Training — PHI must not leave hospital network. Inference — automated decisions must allow human override."
                      className={inputCls} />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" value={newRegName} onChange={e => setNewRegName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && newRegName.trim() && addReg(newRegName.trim())}
                  placeholder="Regulation name" className={inputCls} />
                <button onClick={() => newRegName.trim() && addReg(newRegName.trim())} disabled={!newRegName.trim()}
                  className="flex items-center gap-1 shrink-0 text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg disabled:opacity-30 transition hover:bg-indigo-50">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_REGS.filter(r => !af.regulations.some(e => e.name === r)).map(r => (
                  <button key={r} onClick={() => addReg(r)}
                    className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full transition-colors">
                    + {r}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* AI Sieve */}
          <Card title="AI Sieve">
            <p className="text-xs text-slate-400 mb-5">
              Is AI justified for <strong className="text-slate-600">{activeApproach.name}</strong>?
            </p>

            {sieveQ && (
              <div className="relative">
                <div key={`${activeApproach.id}-sieve-${sieveIdx}`} className={sieveAnimClass !== '' ? sieveAnimClass : ''}>
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Question {sieveIdx + 1} of {allQuestions.length}
                      </p>
                      {!sieveQ.isDefault && (
                        <button onClick={() => { onDeleteCustomQuestion(sieveQ.id); setSieveIdx(Math.max(0, sieveIdx - 1)) }}
                          className="text-slate-300 hover:text-rose-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{sieveQ.text}</p>
                    {sieveQ.detail && <p className="text-xs text-slate-500 mb-4 leading-relaxed">{sieveQ.detail}</p>}
                    <div className="flex gap-3">
                      {[true, false].map(val => (
                        <button key={String(val)}
                          onClick={() => onUpdateSieveAnswer(activeApproach.id, sieveQ.id, val)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                            af.sieveAnswers[sieveQ.id] === val
                              ? val ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-rose-400 bg-rose-50 text-rose-700'
                              : 'border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}>
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <button onClick={() => navigateSieve(sieveIdx - 1)} disabled={sieveIdx === 0}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <div className="flex gap-1.5">
                    {allQuestions.map((_, i) => (
                      <button key={i} onClick={() => navigateSieve(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === sieveIdx ? 'bg-indigo-600' : 'bg-slate-200 hover:bg-slate-300'}`} />
                    ))}
                  </div>
                  <button onClick={() => navigateSieve(sieveIdx + 1)} disabled={sieveIdx === allQuestions.length - 1}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 transition-colors">
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {showAddQ ? (
              <div className="mt-4 flex gap-2">
                <input type="text" value={newQText} onChange={e => setNewQText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomQ()}
                  placeholder="Custom sieve question…" className={`${inputCls} flex-1`} autoFocus />
                <button onClick={addCustomQ} disabled={!newQText.trim()}
                  className="text-xs font-semibold text-indigo-600 border border-indigo-200 px-3 py-2 rounded-lg disabled:opacity-30 hover:bg-indigo-50 transition">
                  Add
                </button>
                <button onClick={() => setShowAddQ(false)} className="text-xs text-slate-400 hover:text-slate-600 px-2">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShowAddQ(true)}
                className="mt-4 flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="w-3.5 h-3.5" /> Add custom question
              </button>
            )}

            {/* Per-approach decision */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700 mb-3">Is AI justified for this approach?</p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { val: 'ai' as const, label: 'Yes — AI is well-suited', cls: 'border-indigo-400 bg-indigo-50 text-indigo-700' },
                  { val: 'non-ai' as const, label: 'No — a non-AI solution is better', cls: 'border-amber-400 bg-amber-50 text-amber-700' },
                ].map(({ val, label, cls }) => (
                  <button key={val}
                    onClick={() => updateAF('sieveDecision', af.sieveDecision === val ? null : val)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                      af.sieveDecision === val ? cls : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
              {af.sieveDecision === 'ai' && (
                <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={af.sieveBaseline}
                    onChange={e => updateAF('sieveBaseline', e.target.checked)}
                    className="accent-indigo-600 w-4 h-4" />
                  Flag for baseline comparison — include a non-AI reference in the final spec
                </label>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ── Final selection (shown after all approaches assessed) ─────────── */}
      <div className={`rounded-2xl border-2 p-6 transition-all ${allDecided ? 'border-indigo-200 bg-indigo-50/50' : 'border-dashed border-slate-200'}`}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${allDecided ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            <CheckCircle2 className={`w-4 h-4 ${allDecided ? 'text-indigo-600' : 'text-slate-300'}`} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Choose the most promising approach to start with</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {allDecided
                ? 'All approaches assessed. Select the one your team is building.'
                : `Complete the sieve for all ${named.length} approaches first.`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {named.map(a => {
            const apf = feasibility.perApproach[a.id]
            const decided = !!apf?.sieveDecision
            return (
              <label key={a.id} className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                feasibility.chosenApproachId === a.id
                  ? 'border-indigo-300 bg-white shadow-sm'
                  : decided ? 'border-slate-200 bg-white hover:border-slate-300' : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
              }`}>
                <input type="radio" name="chosen" disabled={!decided}
                  checked={feasibility.chosenApproachId === a.id}
                  onChange={() => onUpdate('chosenApproachId', a.id)}
                  className="mt-0.5 accent-indigo-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{a.name}</p>
                    {apf?.sieveDecision && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        apf.sieveDecision === 'ai' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apf.sieveDecision === 'ai' ? 'AI-suited' : 'Non-AI'}
                      </span>
                    )}
                    {apf?.sieveBaseline && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        + baseline
                      </span>
                    )}
                  </div>
                  {a.description && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">{a.description}</p>}
                </div>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <p className="text-sm font-semibold text-slate-700">{title}</p>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition'
