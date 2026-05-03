'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { uid, type Problem, type SieveAnswers, type SieveQuestion } from '@/lib/types'

interface Props {
  problems: Problem[]
  sieve: Record<string, SieveAnswers>
  questions: SieveQuestion[]
  onUpdateAnswer: (problemId: string, questionId: string, value: boolean) => void
  onUpdateDecision: (problemId: string, decision: 'keep' | 'discard') => void
  onUpdateBaseline: (problemId: string, value: boolean) => void
  onAddQuestion: (q: SieveQuestion) => void
  onDeleteQuestion: (questionId: string) => void
}

export default function Step2({
  problems,
  sieve,
  questions,
  onUpdateAnswer,
  onUpdateDecision,
  onUpdateBaseline,
  onAddQuestion,
  onDeleteQuestion,
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [slideDir, setSlideDir] = useState<'right' | 'left' | null>(null)
  const [slideKey, setSlideKey] = useState(0)
  const [addingQuestion, setAddingQuestion] = useState(false)
  const [newQText, setNewQText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const navigate = (newIdx: number) => {
    if (newIdx === currentIdx || newIdx < 0 || newIdx >= problems.length) return
    setSlideDir(newIdx > currentIdx ? 'right' : 'left')
    setSlideKey(k => k + 1)
    setCurrentIdx(newIdx)
  }

  const handleAddQuestion = () => {
    const text = newQText.trim()
    if (!text) return
    onAddQuestion({ id: uid(), text })
    setNewQText('')
    setAddingQuestion(false)
  }

  const problem = problems[currentIdx]
  const entry = sieve[problem?.id]
  const answers = entry?.answers ?? {}
  const decision = entry?.decision ?? null
  const baseline = entry?.baseline ?? false
  const decidedCount = problems.filter(p => sieve[p.id]?.decision).length
  const keptCount = problems.filter(p => sieve[p.id]?.decision === 'keep').length

  const animClass =
    slideDir === 'right' ? 'slide-from-right' : slideDir === 'left' ? 'slide-from-left' : ''

  return (
    <div className="flex flex-col items-center gap-8">
      {/* ── page header ── */}
      <div className="w-full max-w-xl text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Should each problem use AI?</h2>
        <p className="mt-2 text-slate-500 text-sm leading-relaxed">
          Work through each problem, answer the questions, then decide yourself — Keep or Discard.
        </p>
      </div>

      {/* ── progress dots ── */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 tabular-nums">
          {decidedCount}/{problems.length} decided
        </span>
        <div className="flex items-center gap-2">
          {problems.map((p, i) => {
            const dec = sieve[p.id]?.decision
            const isCurrent = i === currentIdx
            return (
              <button
                key={p.id}
                onClick={() => navigate(i)}
                title={p.title || `Problem ${i + 1}`}
                className={[
                  'rounded-full transition-all duration-200 focus:outline-none',
                  isCurrent ? 'w-6 h-2.5' : 'w-2.5 h-2.5',
                  dec === 'keep'
                    ? isCurrent ? 'bg-emerald-500' : 'bg-emerald-400'
                    : dec === 'discard'
                    ? isCurrent ? 'bg-slate-400' : 'bg-slate-300'
                    : isCurrent ? 'bg-indigo-500' : 'bg-slate-200 hover:bg-slate-300',
                ].join(' ')}
              />
            )
          })}
        </div>
        <span className="text-xs text-emerald-600 font-medium tabular-nums">{keptCount} kept</span>
      </div>

      {/* ── carousel ── */}
      <div className="w-full max-w-xl overflow-hidden">
        <div key={slideKey} className={animClass}>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">

            {/* nav bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <button
                onClick={() => navigate(currentIdx - 1)}
                disabled={currentIdx === 0}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-500" />
              </button>
              <span className="text-sm font-medium text-slate-500">
                Problem <span className="text-slate-900 font-semibold">{currentIdx + 1}</span> of {problems.length}
              </span>
              <button
                onClick={() => navigate(currentIdx + 1)}
                disabled={currentIdx === problems.length - 1}
                className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* problem summary */}
            <div className="px-6 pt-5 pb-4 border-b border-slate-50">
              <p className="text-lg font-semibold text-slate-900">
                {problem?.title || <span className="italic text-slate-400">(Untitled)</span>}
              </p>
              {problem?.challenge && (
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed line-clamp-3">
                  {problem.challenge}
                </p>
              )}
            </div>

            {/* questions */}
            <div className="px-6 py-5 space-y-5">
              {questions.map(q => (
                <QuestionRow
                  key={q.id}
                  question={q}
                  answer={answers[q.id] ?? null}
                  onChange={v => onUpdateAnswer(problem.id, q.id, v)}
                  onDelete={q.isDefault ? undefined : () => onDeleteQuestion(q.id)}
                />
              ))}

              {/* add question */}
              <div className="pt-1">
                {addingQuestion ? (
                  <div className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      autoFocus
                      type="text"
                      value={newQText}
                      onChange={e => setNewQText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleAddQuestion()
                        if (e.key === 'Escape') { setAddingQuestion(false); setNewQText('') }
                      }}
                      placeholder="Type your question, then press Enter…"
                      className="flex-1 rounded-lg border border-indigo-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddQuestion}
                      className="px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingQuestion(false); setNewQText('') }}
                      className="p-2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingQuestion(true)}
                    className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium py-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add question
                  </button>
                )}
              </div>
            </div>

            {/* ── keep / discard ── */}
            <div className="px-6 pb-6">
              <div className="h-px bg-slate-100 mb-5" />
              <div className="flex gap-3">
                <button
                  onClick={() => onUpdateDecision(problem.id, 'keep')}
                  className={[
                    'flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150',
                    decision === 'keep'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-400 hover:text-emerald-700',
                  ].join(' ')}
                >
                  {decision === 'keep' ? '✓ Kept' : 'Keep'}
                </button>
                <button
                  onClick={() => onUpdateDecision(problem.id, 'discard')}
                  className={[
                    'flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-150',
                    decision === 'discard'
                      ? 'bg-slate-500 border-slate-500 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400',
                  ].join(' ')}
                >
                  {decision === 'discard' ? '✓ Discarded' : 'Discard'}
                </button>
              </div>

              {/* ── baseline toggle (only when kept) ── */}
              {decision === 'keep' && (
                <label className="flex items-start gap-3 mt-4 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={baseline}
                      onChange={e => onUpdateBaseline(problem.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={[
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                      baseline
                        ? 'bg-amber-500 border-amber-500'
                        : 'bg-white border-slate-300 group-hover:border-amber-400',
                    ].join(' ')}>
                      {baseline && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-700">
                      Compare against a non-AI baseline
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      If AI is only marginally better, a simpler deterministic approach may be
                      preferable. Checking this adds a baseline comparison to your final specification.
                    </p>
                  </div>
                </label>
              )}

              {/* auto-advance nudge */}
              {decision && currentIdx < problems.length - 1 && (
                <button
                  onClick={() => navigate(currentIdx + 1)}
                  className="mt-4 w-full py-2 text-xs text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1"
                >
                  Next problem <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuestionRow({
  question,
  answer,
  onChange,
  onDelete,
}: {
  question: SieveQuestion
  answer: boolean | null
  onChange: (v: boolean) => void
  onDelete?: () => void
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 leading-snug">{question.text}</p>
          {question.detail && (
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{question.detail}</p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-slate-300 hover:text-rose-400 transition-colors mt-0.5 shrink-0"
            aria-label="Remove question"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex gap-2">
        {([true, false] as const).map(v => (
          <button
            key={String(v)}
            onClick={() => onChange(v)}
            className={[
              'px-5 py-1.5 rounded-lg text-sm font-medium border transition-all duration-100',
              answer === v
                ? v
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-700 text-white border-slate-700'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700',
            ].join(' ')}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  )
}
