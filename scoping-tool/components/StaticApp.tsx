'use client'

import { useState, useCallback, useEffect } from 'react'
import { PROBLEM_TEMPLATES } from '@/lib/problems'
import {
  emptyTeamState, emptyProblemDef, emptyApproachFeasibility, uid,
  type TeamState, type ProblemId, type StakeholderRow,
  type BaselineEntry, type SolutionApproach, type RegEntry,
  type SieveQuestion, type ApproachFeasibility,
} from '@/lib/types'
import Stepper from '@/components/Stepper'
import ProblemSelect from '@/components/ProblemSelect'
import Step1 from '@/components/Step1'
import Step2 from '@/components/Step2'
import Step3 from '@/components/Step3'
import Step4 from '@/components/Step4'
import Step5 from '@/components/Step5'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'

const STORAGE_KEY = 'msaid-scoping-state'

function loadState(): TeamState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return emptyTeamState()
}

interface Props {
  initialState?: TeamState
  persist?: boolean
}

function canAdvance(step: number, s: TeamState): { ok: boolean; reason: string } {
  if (step === 1 && !s.problemDef.problemStatement.trim())
    return { ok: false, reason: 'Write a problem statement before continuing.' }
  if (step === 2 && !s.metrics.primaryMetric.trim())
    return { ok: false, reason: 'Define at least a primary success metric.' }
  if (step === 3 && s.solutionSpace.approaches.filter(a => a.name.trim()).length < 2)
    return { ok: false, reason: 'Define at least two solution approaches.' }
  if (step === 4 && !s.feasibility.chosenApproachId)
    return { ok: false, reason: "Complete the sieve for each approach, then select the one you're taking forward." }
  return { ok: true, reason: '' }
}

export default function StaticApp({ initialState, persist = true }: Props) {
  const [state, setState] = useState<TeamState>(initialState ?? emptyTeamState())
  const [ready, setReady] = useState(false)

  // Load from localStorage after hydration to avoid SSR mismatch
  useEffect(() => {
    if (persist && !initialState) {
      setState(loadState())
    }
    setReady(true)
  }, [persist, initialState])

  const update = useCallback((patch: Partial<TeamState> | ((prev: TeamState) => TeamState)) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      if (persist) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch {}
      }
      return next
    })
  }, [persist])

  // ── Problem selection ──────────────────────────────────────────────────────
  const selectProblem = (id: ProblemId) => {
    const template = PROBLEM_TEMPLATES.find(p => p.id === id)
    const stakeholders = template
      ? template.stakeholders.map(s => ({ id: uid(), role: s.role, concerns: '', metrics: '' }))
      : [{ id: uid(), role: '', concerns: '', metrics: '' }]
    update(prev => ({ ...prev, problemId: id, problemDef: { ...emptyProblemDef(), stakeholders } }))
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────
  const updateProblemDef = (field: string, value: unknown) =>
    update(s => ({ ...s, problemDef: { ...s.problemDef, [field]: value } }))
  const updateStakeholder = (id: string, field: keyof StakeholderRow, value: string) =>
    update(s => ({
      ...s,
      problemDef: { ...s.problemDef, stakeholders: s.problemDef.stakeholders.map(r => r.id === id ? { ...r, [field]: value } : r) },
    }))
  const addStakeholder = () =>
    update(s => ({
      ...s,
      problemDef: { ...s.problemDef, stakeholders: [...s.problemDef.stakeholders, { id: uid(), role: '', concerns: '', metrics: '' }] },
    }))
  const deleteStakeholder = (id: string) =>
    update(s => ({ ...s, problemDef: { ...s.problemDef, stakeholders: s.problemDef.stakeholders.filter(r => r.id !== id) } }))

  // ── Step 2 ─────────────────────────────────────────────────────────────────
  const updateMetrics = (field: string, value: unknown) =>
    update(s => ({ ...s, metrics: { ...s.metrics, [field]: value } }))
  const updateObjective = (i: number, v: string) =>
    update(s => { const o = [...s.metrics.objectives]; o[i] = v; return { ...s, metrics: { ...s.metrics, objectives: o } } })
  const addObjective = () =>
    update(s => ({ ...s, metrics: { ...s.metrics, objectives: [...s.metrics.objectives, ''] } }))
  const deleteObjective = (i: number) =>
    update(s => ({ ...s, metrics: { ...s.metrics, objectives: s.metrics.objectives.filter((_, j) => j !== i) } }))
  const updateSecondary = (i: number, v: string) =>
    update(s => { const m = [...s.metrics.secondaryMetrics]; m[i] = v; return { ...s, metrics: { ...s.metrics, secondaryMetrics: m } } })
  const addSecondary = () =>
    update(s => ({ ...s, metrics: { ...s.metrics, secondaryMetrics: [...s.metrics.secondaryMetrics, ''] } }))
  const deleteSecondary = (i: number) =>
    update(s => ({ ...s, metrics: { ...s.metrics, secondaryMetrics: s.metrics.secondaryMetrics.filter((_, j) => j !== i) } }))
  const updateBaseline = (id: string, field: keyof BaselineEntry, value: string) =>
    update(s => ({ ...s, metrics: { ...s.metrics, baselines: s.metrics.baselines.map(b => b.id === id ? { ...b, [field]: value } : b) } }))
  const addBaseline = () =>
    update(s => ({ ...s, metrics: { ...s.metrics, baselines: [...s.metrics.baselines, { id: uid(), approach: '', performance: '', target: '' }] } }))
  const deleteBaseline = (id: string) =>
    update(s => ({ ...s, metrics: { ...s.metrics, baselines: s.metrics.baselines.filter(b => b.id !== id) } }))

  // ── Step 3 ─────────────────────────────────────────────────────────────────
  const updateSolutionSpace = (field: string, value: unknown) =>
    update(s => ({ ...s, solutionSpace: { ...s.solutionSpace, [field]: value } }))
  const updateApproach = (id: string, field: keyof SolutionApproach, value: string) =>
    update(s => ({
      ...s,
      solutionSpace: { ...s.solutionSpace, approaches: s.solutionSpace.approaches.map(a => a.id === id ? { ...a, [field]: value } : a) },
    }))
  const addApproach = () =>
    update(s => ({
      ...s,
      solutionSpace: { ...s.solutionSpace, approaches: [...s.solutionSpace.approaches, { id: uid(), name: '', description: '', inputTypes: '', outputTypes: '', pros: '', cons: '' }] },
    }))
  const deleteApproach = (id: string) =>
    update(s => ({ ...s, solutionSpace: { ...s.solutionSpace, approaches: s.solutionSpace.approaches.filter(a => a.id !== id) } }))

  // ── Step 4 ─────────────────────────────────────────────────────────────────
  const updateFeasibility = (field: string, value: unknown) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, [field]: value } }))
  const getAF = (s: TeamState, approachId: string): ApproachFeasibility =>
    s.feasibility.perApproach[approachId] ?? emptyApproachFeasibility()
  const updateApproachFeasibility = (approachId: string, field: keyof ApproachFeasibility, value: unknown) =>
    update(s => ({
      ...s,
      feasibility: { ...s.feasibility, perApproach: { ...s.feasibility.perApproach, [approachId]: { ...getAF(s, approachId), [field]: value } } },
    }))
  const addRegulation = (approachId: string, reg: RegEntry) =>
    update(s => ({
      ...s,
      feasibility: { ...s.feasibility, perApproach: { ...s.feasibility.perApproach, [approachId]: { ...getAF(s, approachId), regulations: [...getAF(s, approachId).regulations, reg] } } },
    }))
  const updateRegulation = (approachId: string, regId: string, field: keyof RegEntry, value: string) =>
    update(s => ({
      ...s,
      feasibility: { ...s.feasibility, perApproach: { ...s.feasibility.perApproach, [approachId]: { ...getAF(s, approachId), regulations: getAF(s, approachId).regulations.map(r => r.id === regId ? { ...r, [field]: value } : r) } } },
    }))
  const deleteRegulation = (approachId: string, regId: string) =>
    update(s => ({
      ...s,
      feasibility: { ...s.feasibility, perApproach: { ...s.feasibility.perApproach, [approachId]: { ...getAF(s, approachId), regulations: getAF(s, approachId).regulations.filter(r => r.id !== regId) } } },
    }))
  const addCustomQuestion = (q: SieveQuestion) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, customQuestions: [...s.feasibility.customQuestions, q] } }))
  const deleteCustomQuestion = (qid: string) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, customQuestions: s.feasibility.customQuestions.filter(q => q.id !== qid) } }))
  const updateSieveAnswer = (approachId: string, qid: string, val: boolean) =>
    update(s => ({
      ...s,
      feasibility: { ...s.feasibility, perApproach: { ...s.feasibility.perApproach, [approachId]: { ...getAF(s, approachId), sieveAnswers: { ...getAF(s, approachId).sieveAnswers, [qid]: val } } } },
    }))

  // ── Step 5 ─────────────────────────────────────────────────────────────────
  const updateSpec = (field: string, value: unknown) =>
    update(s => ({ ...s, spec: { ...s.spec, [field]: value } }))

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handleNext = () => {
    const { ok, reason } = canAdvance(state.currentStep, state)
    if (!ok) { alert(reason); return }
    if (state.currentStep === 4) {
      const chosen = state.solutionSpace.approaches.find(a => a.id === state.feasibility.chosenApproachId)
      const tmpl = PROBLEM_TEMPLATES.find(p => p.id === state.problemId)
      update(s => ({
        ...s,
        currentStep: 5,
        spec: {
          ...s.spec,
          clientName: s.spec.clientName || tmpl?.title || '',
          executiveSummary: s.spec.executiveSummary || s.problemDef.problemStatement,
          solutionComponents: s.spec.solutionComponents || (chosen ? `${chosen.name}: ${chosen.description}` : ''),
        },
      }))
    } else {
      update(s => ({ ...s, currentStep: Math.min(s.currentStep + 1, 5) }))
    }
  }
  const handleBack = () => update(s => ({ ...s, currentStep: Math.max(s.currentStep - 1, 1) }))
  const handleReset = () => {
    if (!confirm(initialState ? 'Reset to example state?' : 'Start a new session? This will clear all your work.')) return
    const fresh = initialState ?? emptyTeamState()
    setState(fresh)
    if (persist) {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
  }

  const template = PROBLEM_TEMPLATES.find(p => p.id === state.problemId)
  const { ok: canNext, reason: blockReason } = canAdvance(state.currentStep, state)

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-400">Loading…</div>
      </div>
    )
  }

  if (!state.problemId) {
    return (
      <ProblemSelect
        code="OFFLINE"
        onSelect={selectProblem}
        onCustom={() => update({ problemId: 'custom' })}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-slate-900">AI Scoping Tool</span>
              <span className="hidden sm:inline text-slate-400 text-sm">— MSAID</span>
              <span className="font-mono text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-md">
                Offline mode
              </span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {initialState ? 'Reset to example' : 'New session'}
            </button>
          </div>

          {template && (
            <div className="pb-1 flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${domainBadge(template.color)}`}>
                {template.domain}
              </span>
              <span className="text-sm text-slate-600">{template.title}</span>
            </div>
          )}

          <Stepper current={state.currentStep} />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {state.currentStep === 1 && (
          <Step1 template={template} problemDef={state.problemDef}
            onUpdate={updateProblemDef} onUpdateStakeholder={updateStakeholder}
            onAddStakeholder={addStakeholder} onDeleteStakeholder={deleteStakeholder} />
        )}
        {state.currentStep === 2 && (
          <Step2 metrics={state.metrics} onUpdate={updateMetrics}
            onUpdateObjective={updateObjective} onAddObjective={addObjective} onDeleteObjective={deleteObjective}
            onUpdateSecondary={updateSecondary} onAddSecondary={addSecondary} onDeleteSecondary={deleteSecondary}
            onUpdateBaseline={updateBaseline} onAddBaseline={addBaseline} onDeleteBaseline={deleteBaseline} />
        )}
        {state.currentStep === 3 && (
          <Step3 solutionSpace={state.solutionSpace} onUpdate={updateSolutionSpace}
            onUpdateApproach={updateApproach} onAddApproach={addApproach} onDeleteApproach={deleteApproach} />
        )}
        {state.currentStep === 4 && (
          <Step4 feasibility={state.feasibility} approaches={state.solutionSpace.approaches}
            onUpdate={updateFeasibility} onUpdateApproach={updateApproachFeasibility}
            onAddRegulation={addRegulation} onUpdateRegulation={updateRegulation} onDeleteRegulation={deleteRegulation}
            onAddCustomQuestion={addCustomQuestion} onDeleteCustomQuestion={deleteCustomQuestion}
            onUpdateSieveAnswer={updateSieveAnswer} />
        )}
        {state.currentStep === 5 && (
          <Step5 state={state} template={template} onUpdateSpec={updateSpec} />
        )}
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-slate-100 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button onClick={handleBack} disabled={state.currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {!canNext && blockReason && (
            <p className="text-xs text-amber-600 text-center flex-1">{blockReason}</p>
          )}
          {state.currentStep < 5 ? (
            <button onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-32" />
          )}
        </div>
      </footer>
    </div>
  )
}

function domainBadge(color: string) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  return map[color] ?? 'bg-slate-100 text-slate-600'
}
