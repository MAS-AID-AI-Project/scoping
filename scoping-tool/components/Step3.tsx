'use client'

import React from 'react'
import { Plus, Trash2, X, Box } from 'lucide-react'
import type { SolutionSpace, SolutionApproach } from '@/lib/types'

interface Props {
  solutionSpace: SolutionSpace
  onUpdate: (field: string, value: unknown) => void
  onUpdateApproach: (id: string, field: keyof SolutionApproach, value: string) => void
  onAddApproach: () => void
  onDeleteApproach: (id: string) => void
}

export default function Step3({ solutionSpace, onUpdate, onUpdateApproach, onAddApproach, onDeleteApproach }: Props) {
  const { inputs, outputs } = solutionSpace

  const addInput    = () => onUpdate('inputs',  [...inputs, ''])
  const addOutput   = () => onUpdate('outputs', [...outputs, ''])
  const updateInput  = (i: number, v: string) => onUpdate('inputs',  inputs.map((x, j) => j === i ? v : x))
  const updateOutput = (i: number, v: string) => onUpdate('outputs', outputs.map((x, j) => j === i ? v : x))
  const deleteInput  = (i: number) => onUpdate('inputs',  inputs.filter((_, j) => j !== i))
  const deleteOutput = (i: number) => onUpdate('outputs', outputs.filter((_, j) => j !== i))

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-1">Solution Space</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Define the system as a black box first — add each possible input and output as a separate item —
          then brainstorm 3–4 distinct approaches. Don&apos;t commit to AI yet.
        </p>
      </div>

      {/* ── Black-box diagram editor ─────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="flex items-stretch min-h-[160px]">

          {/* Input column */}
          <div className="flex-1 flex flex-col justify-center gap-2 p-5 bg-indigo-50/60">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Inputs</p>

            {inputs.map((inp, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {inputs.length > 1 && (
                  <button
                    onClick={() => deleteInput(i)}
                    className="shrink-0 text-indigo-200 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <input
                  value={inp}
                  onChange={e => updateInput(i, e.target.value)}
                  placeholder={`Input ${i + 1}`}
                  className="flex-1 min-w-0 rounded-md border border-indigo-100 bg-white/90 px-2 py-1.5 text-sm text-slate-800 placeholder:text-indigo-200 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition"
                />
                {/* Animated arrow */}
                <div className="flex items-center shrink-0 gap-0">
                  <div className="h-0.5 w-10 arrow-flow-indigo" />
                  <span className="text-indigo-500 text-[10px] leading-none">▶</span>
                </div>
              </div>
            ))}

            <button
              onClick={addInput}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-600 font-medium mt-1 ml-0.5 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add possible input
            </button>
          </div>

          {/* Black box */}
          <div className="w-28 shrink-0 bg-slate-900 flex flex-col items-center justify-center gap-2 py-6 px-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/60 border border-slate-600 flex items-center justify-center">
              <Box className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-white text-[10px] font-semibold text-center leading-tight tracking-wide">
              Black Box<br />System
            </p>
          </div>

          {/* Output column */}
          <div className="flex-1 flex flex-col justify-center gap-2 p-5 bg-emerald-50/60">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-0.5">Outputs</p>

            {outputs.map((out, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {/* Animated arrow */}
                <div className="flex items-center shrink-0 gap-0">
                  <span className="text-emerald-500 text-[10px] leading-none">▶</span>
                  <div className="h-0.5 w-10 arrow-flow-emerald" />
                </div>
                <input
                  value={out}
                  onChange={e => updateOutput(i, e.target.value)}
                  placeholder={`Output ${i + 1}`}
                  className="flex-1 min-w-0 rounded-md border border-emerald-100 bg-white/90 px-2 py-1.5 text-sm text-slate-800 placeholder:text-emerald-200 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                />
                {outputs.length > 1 && (
                  <button
                    onClick={() => deleteOutput(i)}
                    className="shrink-0 text-emerald-200 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={addOutput}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-600 font-medium mt-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> Add possible output
            </button>
          </div>
        </div>

        {/* Constraints */}
        <div className="border-t border-slate-100 px-5 py-3 bg-white flex items-start gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 shrink-0">Constraints</span>
          <input
            type="text"
            value={solutionSpace.constraints}
            onChange={e => onUpdate('constraints', e.target.value)}
            placeholder="e.g. Must run within hospital network. Alert latency ≤ 5 min. No external data storage."
            className="flex-1 text-sm text-slate-700 placeholder:text-slate-300 focus:outline-none py-1.5 bg-transparent"
          />
        </div>
      </div>

      {/* ── Solution approaches ───────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-700">Solution Approaches</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              3–4 distinct approaches. Include both AI and non-AI options — don&apos;t filter yet.
              Not sure what approaches are possible? Ask a TA for guidance.
            </p>
          </div>
          {solutionSpace.approaches.length < 4 && (
            <button
              onClick={onAddApproach}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add approach
            </button>
          )}
        </div>

        <div className="space-y-4">
          {solutionSpace.approaches.map((a, i) => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">Approach {i + 1}</p>
                {solutionSpace.approaches.length > 2 && (
                  <button onClick={() => onDeleteApproach(a.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Name</label>
                  <input type="text" value={a.name} onChange={e => onUpdateApproach(a.id, 'name', e.target.value)}
                    placeholder="e.g. Rule-based threshold alerts" className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Description</label>
                  <textarea rows={2} value={a.description} onChange={e => onUpdateApproach(a.id, 'description', e.target.value)}
                    placeholder="e.g. Hard-coded vital thresholds trigger nurse alerts. No learning from historical data."
                    className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Input type</label>
                    <textarea rows={2} value={a.inputTypes} onChange={e => onUpdateApproach(a.id, 'inputTypes', e.target.value)}
                      placeholder="e.g. Tabular snapshot of current vitals and lab values" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Output type</label>
                    <textarea rows={2} value={a.outputTypes} onChange={e => onUpdateApproach(a.id, 'outputTypes', e.target.value)}
                      placeholder="e.g. Risk tier (Low / Medium / High) + score" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-emerald-600 uppercase tracking-wide block mb-1">Pros</label>
                    <textarea rows={2} value={a.pros} onChange={e => onUpdateApproach(a.id, 'pros', e.target.value)}
                      placeholder="Simple, explainable, no training data required" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-rose-500 uppercase tracking-wide block mb-1">Cons</label>
                    <textarea rows={2} value={a.cons} onChange={e => onUpdateApproach(a.id, 'cons', e.target.value)}
                      placeholder="Misses subtle patterns, high false-positive rate" className={inputCls} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition'
