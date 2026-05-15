'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRoomSync, type RemoteCursor } from '@/lib/sync'
import { PROBLEM_TEMPLATES } from '@/lib/problems'
import {
  emptyTeamState, emptyProblemDef, emptyApproachFeasibility, uid,
  type TeamState, type ProblemId, type StakeholderRow,
  type BaselineEntry, type SolutionApproach, type RegEntry,
  type SieveQuestion, type ApproachFeasibility,
} from '@/lib/types'
import Stepper from '@/components/Stepper'
import ProblemSelect from '@/components/ProblemSelect'
import NamePrompt from '@/components/NamePrompt'
import Cursors from '@/components/Cursors'
import Step1 from '@/components/Step1'
import Step2 from '@/components/Step2'
import Step3 from '@/components/Step3'
import Step4 from '@/components/Step4'
import Step5 from '@/components/Step5'
import { ArrowLeft, ArrowRight, RotateCcw, Wifi, WifiOff, Eye } from 'lucide-react'

const STEP_LABELS = ['Problem Definition', 'Success Metrics', 'Solution Space', 'Feasibility', 'Final Document']

interface Props {
  code: string
  initialState?: TeamState
  persist?: boolean
  observe?: boolean
}

function canAdvance(step: number, s: TeamState): { ok: boolean; reason: string } {
  if (step === 1) {
    if (!s.problemDef.problemStatement.trim())
      return { ok: false, reason: 'Write a problem statement before continuing.' }
  }
  if (step === 2) {
    if (!s.metrics.primaryMetric.trim())
      return { ok: false, reason: 'Define at least a primary success metric.' }
  }
  if (step === 3) {
    if (s.solutionSpace.approaches.filter(a => a.name.trim()).length < 2)
      return { ok: false, reason: 'Define at least two solution approaches.' }
  }
  if (step === 4) {
    if (!s.feasibility.chosenApproachId)
      return { ok: false, reason: 'Complete the sieve for each approach, then select the one you\'re taking forward.' }
  }
  return { ok: true, reason: '' }
}

export default function RoomApp({ code, initialState, persist = true, observe = false }: Props) {
  const [state, setState] = useState<TeamState>(initialState ?? emptyTeamState())
  const [connected, setConnected] = useState(false)
  const [myName, setMyName] = useState<string | null>(observe ? 'Instructor' : null)
  const [cursors, setCursors] = useState<Record<string, RemoteCursor>>({})
  // Observer has a local step that overrides the team's synced step
  const [localStep, setLocalStep] = useState(1)

  const pushDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cursorThrottleRef = useRef<number>(0)

  // ── Sync ──────────────────────────────────────────────────────────────────

  const { pushState, pushCursor, announce } = useRoomSync(code, {
    onState: useCallback((remote: TeamState) => {
      setState(remote)
      setConnected(true)
    }, []),
    onCursor: useCallback((id: string, cursor: Omit<RemoteCursor, 'id'> | null) => {
      setCursors(prev => {
        if (!cursor) {
          const next = { ...prev }
          delete next[id]
          return next
        }
        return { ...prev, [id]: { ...cursor, id } }
      })
    }, []),
  })

  useEffect(() => { setConnected(true) }, [])

  const update = useCallback((patch: Partial<TeamState> | ((prev: TeamState) => TeamState)) => {
    if (observe) return  // observers never mutate shared state
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      if (pushDebounceRef.current) clearTimeout(pushDebounceRef.current)
      pushDebounceRef.current = setTimeout(() => pushState(next), 200)
      return next
    })
  }, [pushState, observe])

  // ── Name + cursor tracking ─────────────────────────────────────────────────

  const handleNameConfirm = useCallback((name: string) => {
    setMyName(name)
    announce(name, observe)
  }, [announce, observe])

  // Observers auto-announce immediately
  useEffect(() => {
    if (observe) announce('Instructor', true)
  }, [observe, announce])

  useEffect(() => {
    if (!myName) return
    const onMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - cursorThrottleRef.current < 50) return  // ~20fps
      cursorThrottleRef.current = now
      pushCursor(myName, e.clientX / window.innerWidth, e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [myName, pushCursor])

  // ── Problem selection ─────────────────────────────────────────────────────

  const selectProblem = (id: ProblemId) => {
    const template = PROBLEM_TEMPLATES.find(p => p.id === id)
    const stakeholders = template
      ? template.stakeholders.map(s => ({ id: uid(), role: s.role, concerns: '', metrics: '' }))
      : [{ id: uid(), role: '', concerns: '', metrics: '' }]
    update(prev => ({ ...prev, problemId: id, problemDef: { ...emptyProblemDef(), stakeholders } }))
  }

  // ── Step 1 handlers ───────────────────────────────────────────────────────

  const updateProblemDef = (field: string, value: unknown) =>
    update(s => ({ ...s, problemDef: { ...s.problemDef, [field]: value } }))

  const updateStakeholder = (id: string, field: keyof StakeholderRow, value: string) =>
    update(s => ({
      ...s,
      problemDef: {
        ...s.problemDef,
        stakeholders: s.problemDef.stakeholders.map(r => r.id === id ? { ...r, [field]: value } : r),
      },
    }))
  const addStakeholder = () =>
    update(s => ({
      ...s,
      problemDef: { ...s.problemDef, stakeholders: [...s.problemDef.stakeholders, { id: uid(), role: '', concerns: '', metrics: '' }] },
    }))
  const deleteStakeholder = (id: string) =>
    update(s => ({
      ...s,
      problemDef: { ...s.problemDef, stakeholders: s.problemDef.stakeholders.filter(r => r.id !== id) },
    }))

  // ── Step 2 handlers ───────────────────────────────────────────────────────

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
    update(s => ({
      ...s,
      metrics: { ...s.metrics, baselines: s.metrics.baselines.map(b => b.id === id ? { ...b, [field]: value } : b) },
    }))
  const addBaseline = () =>
    update(s => ({
      ...s,
      metrics: { ...s.metrics, baselines: [...s.metrics.baselines, { id: uid(), approach: '', performance: '', target: '' }] },
    }))
  const deleteBaseline = (id: string) =>
    update(s => ({ ...s, metrics: { ...s.metrics, baselines: s.metrics.baselines.filter(b => b.id !== id) } }))

  // ── Step 3 handlers ───────────────────────────────────────────────────────

  const updateSolutionSpace = (field: string, value: unknown) =>
    update(s => ({ ...s, solutionSpace: { ...s.solutionSpace, [field]: value } }))

  const updateApproach = (id: string, field: keyof SolutionApproach, value: string) =>
    update(s => ({
      ...s,
      solutionSpace: {
        ...s.solutionSpace,
        approaches: s.solutionSpace.approaches.map(a => a.id === id ? { ...a, [field]: value } : a),
      },
    }))
  const addApproach = () =>
    update(s => ({
      ...s,
      solutionSpace: {
        ...s.solutionSpace,
        approaches: [...s.solutionSpace.approaches, { id: uid(), name: '', description: '', pros: '', cons: '' }],
      },
    }))
  const deleteApproach = (id: string) =>
    update(s => ({
      ...s,
      solutionSpace: { ...s.solutionSpace, approaches: s.solutionSpace.approaches.filter(a => a.id !== id) },
    }))

  // ── Step 4 handlers ───────────────────────────────────────────────────────

  const updateFeasibility = (field: string, value: unknown) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, [field]: value } }))

  const getAF = (s: TeamState, approachId: string): ApproachFeasibility =>
    s.feasibility.perApproach[approachId] ?? emptyApproachFeasibility()

  const updateApproachFeasibility = (approachId: string, field: keyof ApproachFeasibility, value: unknown) =>
    update(s => ({
      ...s,
      feasibility: {
        ...s.feasibility,
        perApproach: {
          ...s.feasibility.perApproach,
          [approachId]: { ...getAF(s, approachId), [field]: value },
        },
      },
    }))

  const addRegulation = (approachId: string, reg: RegEntry) =>
    update(s => ({
      ...s,
      feasibility: {
        ...s.feasibility,
        perApproach: {
          ...s.feasibility.perApproach,
          [approachId]: { ...getAF(s, approachId), regulations: [...getAF(s, approachId).regulations, reg] },
        },
      },
    }))

  const updateRegulation = (approachId: string, regId: string, field: keyof RegEntry, value: string) =>
    update(s => ({
      ...s,
      feasibility: {
        ...s.feasibility,
        perApproach: {
          ...s.feasibility.perApproach,
          [approachId]: {
            ...getAF(s, approachId),
            regulations: getAF(s, approachId).regulations.map(r => r.id === regId ? { ...r, [field]: value } : r),
          },
        },
      },
    }))

  const deleteRegulation = (approachId: string, regId: string) =>
    update(s => ({
      ...s,
      feasibility: {
        ...s.feasibility,
        perApproach: {
          ...s.feasibility.perApproach,
          [approachId]: {
            ...getAF(s, approachId),
            regulations: getAF(s, approachId).regulations.filter(r => r.id !== regId),
          },
        },
      },
    }))

  const addCustomQuestion = (q: SieveQuestion) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, customQuestions: [...s.feasibility.customQuestions, q] } }))
  const deleteCustomQuestion = (qid: string) =>
    update(s => ({ ...s, feasibility: { ...s.feasibility, customQuestions: s.feasibility.customQuestions.filter(q => q.id !== qid) } }))

  const updateSieveAnswer = (approachId: string, qid: string, val: boolean) =>
    update(s => ({
      ...s,
      feasibility: {
        ...s.feasibility,
        perApproach: {
          ...s.feasibility.perApproach,
          [approachId]: {
            ...getAF(s, approachId),
            sieveAnswers: { ...getAF(s, approachId).sieveAnswers, [qid]: val },
          },
        },
      },
    }))

  // ── Step 5 handlers ───────────────────────────────────────────────────────

  const updateSpec = (field: string, value: unknown) =>
    update(s => ({ ...s, spec: { ...s.spec, [field]: value } }))

  // ── Navigation ────────────────────────────────────────────────────────────

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
    if (!confirm('Reset all team progress?')) return
    const fresh = initialState ?? emptyTeamState()
    setState(fresh)
    pushState(fresh)
  }

  const template = PROBLEM_TEMPLATES.find(p => p.id === state.problemId)
  const { ok: canNext, reason: blockReason } = canAdvance(state.currentStep, state)
  // Observer uses localStep; participants use the synced currentStep
  const displayStep = observe ? localStep : state.currentStep

  // ── Render ────────────────────────────────────────────────────────────────

  if (!myName && persist && !observe) {
    return <NamePrompt code={code} onConfirm={handleNameConfirm} />
  }

  if (!state.problemId) {
    return (
      <>
        <ProblemSelect
          code={code}
          onSelect={selectProblem}
          onCustom={() => update({ problemId: 'custom' })}
        />
        <Cursors cursors={cursors} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Cursors cursors={cursors} />

      {/* Observer banner */}
      {observe && (
        <div className="bg-amber-500 text-white text-xs font-semibold text-center py-1.5 tracking-wide flex items-center justify-center gap-2">
          <Eye className="w-3.5 h-3.5" /> OBSERVER MODE — read only · navigate freely using the step buttons below
        </div>
      )}

      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold text-slate-900">AI Scoping Tool</span>
              <span className="hidden sm:inline text-slate-400 text-sm">— MSAID</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{code}</span>
            </div>
            <div className="flex items-center gap-3">
              {Object.values(cursors).filter(c => !c.observer).slice(0, 4).map(c => (
                <span key={c.id} title={c.name}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                  style={{ background: colorForId(c.id) }}>
                  {c.name[0]?.toUpperCase()}
                </span>
              ))}
              {myName && <span className="text-xs text-slate-400 font-medium">{myName}</span>}
              {connected ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-slate-300" />}
              {!observe && (
                <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  {initialState ? 'Reset to example' : 'Reset'}
                </button>
              )}
            </div>
          </div>

          {template && (
            <div className="pb-1 flex items-center gap-2">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${domainBadge(template.color)}`}>
                {template.domain}
              </span>
              <span className="text-sm text-slate-600">{template.title}</span>
              {observe && (
                <span className="text-xs text-slate-400 ml-auto">
                  Team is on Step {state.currentStep} — {STEP_LABELS[state.currentStep - 1]}
                </span>
              )}
            </div>
          )}

          {observe ? (
            /* Observer: freely clickable step tabs */
            <div className="flex gap-1 pb-2 overflow-x-auto">
              {STEP_LABELS.map((label, i) => (
                <button
                  key={i}
                  onClick={() => setLocalStep(i + 1)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    localStep === i + 1
                      ? 'bg-amber-500 text-white'
                      : state.currentStep === i + 1
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {i + 1}. {label}
                  {state.currentStep === i + 1 && localStep !== i + 1 && (
                    <span className="text-[9px] bg-indigo-500 text-white px-1 rounded">LIVE</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <Stepper current={state.currentStep} />
          )}
        </div>
      </header>

      {/* pointer-events-none in observer mode blocks all editing clicks; scrolling still works */}
      <main className={`flex-1 max-w-5xl w-full mx-auto px-6 py-10 ${observe ? 'pointer-events-none select-none' : ''}`}>
        {displayStep === 1 && (
          <Step1 template={template} problemDef={state.problemDef}
            onUpdate={updateProblemDef} onUpdateStakeholder={updateStakeholder}
            onAddStakeholder={addStakeholder} onDeleteStakeholder={deleteStakeholder} />
        )}
        {displayStep === 2 && (
          <Step2 metrics={state.metrics} onUpdate={updateMetrics}
            onUpdateObjective={updateObjective} onAddObjective={addObjective} onDeleteObjective={deleteObjective}
            onUpdateSecondary={updateSecondary} onAddSecondary={addSecondary} onDeleteSecondary={deleteSecondary}
            onUpdateBaseline={updateBaseline} onAddBaseline={addBaseline} onDeleteBaseline={deleteBaseline} />
        )}
        {displayStep === 3 && (
          <Step3 solutionSpace={state.solutionSpace} onUpdate={updateSolutionSpace}
            onUpdateApproach={updateApproach} onAddApproach={addApproach} onDeleteApproach={deleteApproach} />
        )}
        {displayStep === 4 && (
          <Step4 feasibility={state.feasibility} approaches={state.solutionSpace.approaches}
            onUpdate={updateFeasibility} onUpdateApproach={updateApproachFeasibility}
            onAddRegulation={addRegulation} onUpdateRegulation={updateRegulation} onDeleteRegulation={deleteRegulation}
            onAddCustomQuestion={addCustomQuestion} onDeleteCustomQuestion={deleteCustomQuestion}
            onUpdateSieveAnswer={updateSieveAnswer} />
        )}
        {displayStep === 5 && (
          <Step5 state={state} template={template} onUpdateSpec={updateSpec} />
        )}
      </main>

      {/* Footer: hidden for observers (they use the step tabs instead) */}
      {!observe && (
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
      )}
    </div>
  )
}

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#14b8a6']
function colorForId(id: string): string {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return COLORS[Math.abs(h) % COLORS.length]
}

function domainBadge(color: string) {
  const map: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return map[color] ?? 'bg-slate-100 text-slate-600'
}
