'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react'
import Stepper from '@/components/Stepper'
import Step1 from '@/components/Step1'
import Step2 from '@/components/Step2'
import Step3 from '@/components/Step3'
import Step4 from '@/components/Step4'
import {
  uid,
  DEFAULT_QUESTIONS,
  type Problem,
  type SieveAnswers,
  type SieveQuestion,
  type FeasibilityEntry,
  type SpecData,
  type StakeholderRow,
} from '@/lib/types'

// ── factories ────────────────────────────────────────────────────────────────

const emptyProblem = (): Problem => ({
  id: uid(), title: '', challenge: '', endUsers: '', currentSolution: '',
})

const emptySieve = (): SieveAnswers => ({ answers: {}, decision: null })

const emptyFeasibility = (): FeasibilityEntry => ({
  dataVolume: '', dataLabels: '', syntheticDataNote: '',
  computeBudget: '', modelingStack: '', regulations: [],
})

const emptySpec = (): SpecData => ({
  clientName: '', timeline: '', executiveSummary: '',
  businessChallengeRaw: '', objectives: [''], dataAssetsDetail: '',
  stakeholders: [{ id: uid(), role: '', concerns: '', metrics: '' }],
  solutionComponents: '',
})

const STORAGE_KEY = 'ai-scoping-tool-v2'

// ── validation ───────────────────────────────────────────────────────────────

function canAdvanceFrom(
  step: number,
  problems: Problem[],
  sieve: Record<string, SieveAnswers>,
  selectedId: string | null,
): { ok: boolean; reason: string } {
  if (step === 1) {
    if (!problems.some(p => p.title.trim()))
      return { ok: false, reason: 'Add at least one problem to continue.' }
    return { ok: true, reason: '' }
  }
  if (step === 2) {
    const undecided = problems.filter(p => !sieve[p.id]?.decision).length
    if (undecided > 0)
      return { ok: false, reason: `${undecided} problem(s) still need a Keep / Discard decision.` }
    if (!problems.some(p => sieve[p.id]?.decision === 'keep'))
      return { ok: false, reason: 'Keep at least one AI-suited problem to continue.' }
    return { ok: true, reason: '' }
  }
  if (step === 3) {
    if (!selectedId) return { ok: false, reason: 'Select the most feasible problem to continue.' }
    return { ok: true, reason: '' }
  }
  return { ok: true, reason: '' }
}

// ── props ────────────────────────────────────────────────────────────────────

interface InitialState {
  step?: number
  problems?: Problem[]
  questions?: SieveQuestion[]
  sieve?: Record<string, SieveAnswers>
  feasibility?: Record<string, FeasibilityEntry>
  selectedId?: string | null
  spec?: SpecData
}

interface Props {
  /** When provided, seeds the initial state. Takes precedence over localStorage. */
  initialState?: InitialState
  /** When false, never reads or writes localStorage (used for /prefilled). */
  persist?: boolean
}

// ── component ────────────────────────────────────────────────────────────────

export default function ScopingApp({ initialState, persist = true }: Props) {
  const [step, setStep] = useState(initialState?.step ?? 1)
  const [problems, setProblems] = useState<Problem[]>(initialState?.problems ?? [emptyProblem()])
  const [questions, setQuestions] = useState<SieveQuestion[]>(initialState?.questions ?? DEFAULT_QUESTIONS)
  const [sieve, setSieve] = useState<Record<string, SieveAnswers>>(initialState?.sieve ?? {})
  const [feasibility, setFeasibility] = useState<Record<string, FeasibilityEntry>>(initialState?.feasibility ?? {})
  const [selectedId, setSelectedId] = useState<string | null>(initialState?.selectedId ?? null)
  const [spec, setSpec] = useState<SpecData>(initialState?.spec ?? emptySpec())

  // Skip the first save cycle so we don't overwrite localStorage before the load runs
  const skipFirstSave = useRef(persist)

  // ── load from localStorage ────────────────────────────────────────────────
  useEffect(() => {
    if (!persist) return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.problems)    setProblems(s.problems)
        if (s.questions)   setQuestions(s.questions)
        if (s.sieve)       setSieve(s.sieve)
        if (s.feasibility) setFeasibility(s.feasibility)
        if (s.selectedId !== undefined) setSelectedId(s.selectedId)
        if (s.spec)        setSpec(s.spec)
        if (s.step)        setStep(s.step)
      }
    } catch {}
    skipFirstSave.current = false
  }, [persist])

  // ── save to localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    if (!persist || skipFirstSave.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        { step, problems, questions, sieve, feasibility, selectedId, spec }
      ))
    } catch {}
  }, [persist, step, problems, questions, sieve, feasibility, selectedId, spec])

  // ── handlers ──────────────────────────────────────────────────────────────

  const addProblem = () => {
    if (problems.length >= 5) return
    setProblems(ps => [...ps, emptyProblem()])
  }
  const deleteProblem = (id: string) => {
    setProblems(ps => ps.filter(p => p.id !== id))
    setSieve(s => { const n = { ...s }; delete n[id]; return n })
    setFeasibility(f => { const n = { ...f }; delete n[id]; return n })
    if (selectedId === id) setSelectedId(null)
  }
  const changeProblem = (id: string, field: keyof Problem, value: string) =>
    setProblems(ps => ps.map(p => p.id === id ? { ...p, [field]: value } : p))

  const addQuestion = (q: SieveQuestion) => setQuestions(qs => [...qs, q])
  const deleteQuestion = (qid: string) => setQuestions(qs => qs.filter(q => q.id !== qid))

  const updateAnswer = (pid: string, qid: string, value: boolean) =>
    setSieve(s => ({
      ...s,
      [pid]: { ...(s[pid] ?? emptySieve()), answers: { ...(s[pid]?.answers ?? {}), [qid]: value } },
    }))
  const updateDecision = (pid: string, decision: 'keep' | 'discard') =>
    setSieve(s => ({ ...s, [pid]: { ...(s[pid] ?? emptySieve()), decision } }))
  const updateBaseline = (pid: string, value: boolean) =>
    setSieve(s => ({ ...s, [pid]: { ...(s[pid] ?? emptySieve()), baseline: value } }))

  const updateFeasibility = (id: string, field: keyof FeasibilityEntry, value: unknown) =>
    setFeasibility(f => ({ ...f, [id]: { ...(f[id] ?? emptyFeasibility()), [field]: value } }))

  const updateSpec = (field: keyof SpecData, value: unknown) =>
    setSpec(s => ({ ...s, [field]: value }))
  const updateStakeholder = (id: string, field: keyof StakeholderRow, value: string) =>
    setSpec(s => ({ ...s, stakeholders: s.stakeholders.map(r => r.id === id ? { ...r, [field]: value } : r) }))
  const addStakeholder = () =>
    setSpec(s => ({ ...s, stakeholders: [...s.stakeholders, { id: uid(), role: '', concerns: '', metrics: '' }] }))
  const deleteStakeholder = (id: string) =>
    setSpec(s => ({ ...s, stakeholders: s.stakeholders.filter(r => r.id !== id) }))
  const updateObjective = (index: number, value: string) =>
    setSpec(s => { const o = [...s.objectives]; o[index] = value; return { ...s, objectives: o } })
  const addObjective = () =>
    setSpec(s => ({ ...s, objectives: [...s.objectives, ''] }))
  const deleteObjective = (index: number) =>
    setSpec(s => ({ ...s, objectives: s.objectives.filter((_, i) => i !== index) }))

  // ── navigation ────────────────────────────────────────────────────────────

  const keptProblems = problems.filter(p => sieve[p.id]?.decision === 'keep')

  const handleNext = () => {
    const { ok, reason } = canAdvanceFrom(step, problems, sieve, selectedId)
    if (!ok) { alert(reason); return }

    if (step === 3 && selectedId) {
      const p = problems.find(pr => pr.id === selectedId)!
      const fe = feasibility[selectedId] ?? emptyFeasibility()
      setSpec(prev => ({
        ...prev,
        executiveSummary: prev.executiveSummary ||
          `${p.challenge}\n\nWe have been tasked with designing an end-to-end AI solution to address this challenge, balancing accuracy, feasibility, and compliance.`,
        businessChallengeRaw: prev.businessChallengeRaw || p.challenge,
        dataAssetsDetail: prev.dataAssetsDetail ||
          [
            fe.dataVolume        && `Volume: ${fe.dataVolume}`,
            fe.dataLabels        && `Labelled data: ${fe.dataLabels}`,
            fe.syntheticDataNote && `Synthetic data: ${fe.syntheticDataNote}`,
          ].filter(Boolean).join('\n'),
      }))
    }
    setStep(s => Math.min(s + 1, 4))
  }

  const handleBack = () => setStep(s => Math.max(s - 1, 1))

  const handleReset = () => {
    if (!confirm('Reset everything and start over?')) return
    if (persist) localStorage.removeItem(STORAGE_KEY)
    // Reset to initialState if provided, otherwise to blank defaults
    setStep(initialState?.step ?? 1)
    setProblems(initialState?.problems ?? [emptyProblem()])
    setQuestions(initialState?.questions ?? DEFAULT_QUESTIONS)
    setSieve(initialState?.sieve ?? {})
    setFeasibility(initialState?.feasibility ?? {})
    setSelectedId(initialState?.selectedId ?? null)
    setSpec(initialState?.spec ?? emptySpec())
  }

  const { ok: canNext, reason: blockReason } = canAdvanceFrom(step, problems, sieve, selectedId)
  const selectedProblem = problems.find(p => p.id === selectedId)

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-base font-semibold text-slate-900">AI Scoping Tool</span>
              <span className="hidden sm:inline text-slate-400 text-sm ml-2">— MSAID</span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {initialState ? 'Reset to example' : 'Reset'}
            </button>
          </div>
          <Stepper current={step} />
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
        {step === 1 && (
          <Step1 problems={problems} onAdd={addProblem} onDelete={deleteProblem} onChange={changeProblem} />
        )}
        {step === 2 && (
          <Step2
            problems={problems} sieve={sieve} questions={questions}
            onUpdateAnswer={updateAnswer} onUpdateDecision={updateDecision}
            onUpdateBaseline={updateBaseline} onAddQuestion={addQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        )}
        {step === 3 && (
          <Step3
            keptProblems={keptProblems} feasibility={feasibility}
            selectedId={selectedId} onUpdate={updateFeasibility} onSelect={setSelectedId}
          />
        )}
        {step === 4 && selectedProblem && (
          <Step4
            problem={selectedProblem}
            feasibility={feasibility[selectedId!] ?? emptyFeasibility()}
            baseline={sieve[selectedId!]?.baseline}
            spec={spec}
            onUpdateSpec={updateSpec}
            onUpdateStakeholder={updateStakeholder}
            onAddStakeholder={addStakeholder}
            onDeleteStakeholder={deleteStakeholder}
            onUpdateObjective={updateObjective}
            onAddObjective={addObjective}
            onDeleteObjective={deleteObjective}
          />
        )}
      </main>

      <footer className="sticky bottom-0 bg-white border-t border-slate-100 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {!canNext && blockReason && (
            <p className="text-xs text-amber-600 text-center flex-1">{blockReason}</p>
          )}

          {step < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all"
            >
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
