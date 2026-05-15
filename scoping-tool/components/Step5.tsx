'use client'

import { FileText, Printer, AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { PROBLEM_TEMPLATES } from '@/lib/problems'
import type { TeamState, ProblemTemplate } from '@/lib/types'

interface Props {
  state: TeamState
  template?: ProblemTemplate
  onUpdateSpec: (field: string, value: unknown) => void
}

export default function Step5({ state, template, onUpdateSpec }: Props) {
  const [showPreview, setShowPreview] = useState(false)
  const { spec, problemDef, metrics, solutionSpace, feasibility } = state

  const chosen = solutionSpace.approaches.find(a => a.id === feasibility.chosenApproachId)
  const chosenFeasibility = chosen ? (feasibility.perApproach[chosen.id] ?? null) : null

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) { alert('Please allow popups for this site.'); return }

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const today = new Date().toISOString().slice(0, 10)
    const orgName = spec.clientName || template?.title || 'Client Organisation'

    const challengeLines = problemDef.problemStatement.split('\n').filter(l => l.trim())
    const objectiveItems = metrics.objectives.filter(o => o.trim())
    const shRows = problemDef.stakeholders.filter(r => r.role.trim())
    const baselineRows = metrics.baselines.filter(b => b.approach.trim())

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Scoping Briefing — ${esc(orgName)}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; color: #1e293b; line-height: 1.6; }
    .date { text-align: right; font-size: 10pt; color: #64748b; margin-bottom: 28px; }
    h1 { font-size: 18pt; font-weight: normal; margin-bottom: 4px; }
    .subtitle { font-style: italic; font-size: 12pt; color: #475569; margin-bottom: 14px; }
    .meta { display: flex; gap: 24px; font-size: 10pt; margin-bottom: 28px; }
    .section { margin-bottom: 22px; }
    .section h2 { font-size: 11pt; font-weight: bold; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 10px; }
    ul.bullets { list-style: none; padding: 0; }
    ul.bullets li { display: flex; gap: 8px; margin-bottom: 5px; font-size: 10.5pt; line-height: 1.55; }
    .bullet { color: #94a3b8; flex-shrink: 0; }
    ol.numbered { list-style: none; padding: 0; }
    ol.numbered li { display: flex; gap: 8px; margin-bottom: 5px; font-size: 10.5pt; line-height: 1.55; }
    .num { font-weight: 600; flex-shrink: 0; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    thead tr { border-bottom: 2px solid #94a3b8; }
    th { text-align: left; padding: 6px 10px 6px 0; font-weight: bold; }
    td { padding: 5px 10px 5px 0; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
    .td-bold { font-weight: 600; }
    .reg-name { font-weight: bold; font-size: 10.5pt; margin-bottom: 2px; }
    .reg-body { font-size: 10pt; color: #475569; line-height: 1.55; margin-bottom: 10px; }
    .pre { white-space: pre-line; font-size: 10.5pt; line-height: 1.65; }
    .baseline-note { background: #fefce8; border: 1px solid #fde68a; border-radius: 4px; padding: 8px 12px; margin-bottom: 12px; font-size: 10pt; color: #92400e; }
    .tag { display: inline-block; font-size: 9pt; font-weight: 600; padding: 1px 7px; border-radius: 999px; background: #e0e7ff; color: #3730a3; margin-bottom: 6px; }
  </style>
</head>
<body>
  <p class="date">${today}</p>
  <h1>AI Scoping Briefing</h1>
  <p class="subtitle">${esc(orgName)}${chosen ? ' — ' + esc(chosen.name) : ''}</p>
  <div class="meta">
    <span><strong>Client:</strong> ${esc(spec.clientName || '—')}</span>
    <span><strong>Timeline:</strong> ${esc(spec.timeline || '—')}</span>
    ${chosenFeasibility?.sieveDecision ? `<span><strong>Approach type:</strong> ${chosenFeasibility.sieveDecision === 'ai' ? 'AI / ML solution' : 'Non-AI solution'}</span>` : ''}
  </div>

  ${spec.executiveSummary ? `
  <div class="section">
    <h2>Executive Summary</h2>
    <p class="pre">${esc(spec.executiveSummary)}</p>
  </div>` : ''}

  <div class="section">
    <h2>Problem Statement</h2>
    <p class="pre">${esc(problemDef.problemStatement || '—')}</p>
    ${problemDef.rootCause ? `<p style="margin-top:8px;font-size:10pt;color:#475569"><strong>Root cause:</strong> ${esc(problemDef.rootCause)}</p>` : ''}
    ${problemDef.currentProcess ? `<p style="margin-top:6px;font-size:10pt;color:#475569"><strong>Current process:</strong> ${esc(problemDef.currentProcess)}</p>` : ''}
  </div>

  <div class="section">
    <h2>Stakeholders & Priorities</h2>
    <table>
      <thead><tr><th>Stakeholder</th><th>Primary Concerns</th><th>Success Metrics</th></tr></thead>
      <tbody>${shRows.map(r => `
        <tr>
          <td class="td-bold">${esc(r.role)}</td>
          <td>${esc(r.concerns)}</td>
          <td>${esc(r.metrics)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Objectives</h2>
    <ol class="numbered">${objectiveItems.map((o, i) => `
      <li><span class="num">${i + 1}.</span> ${esc(o)}</li>`).join('')}
    </ol>
    ${metrics.primaryMetric ? `<p style="margin-top:8px;font-size:10pt"><strong>Primary KPI:</strong> ${esc(metrics.primaryMetric)}</p>` : ''}
    ${metrics.secondaryMetrics.filter(m => m.trim()).length > 0 ? `<p style="margin-top:4px;font-size:10pt"><strong>Secondary:</strong> ${metrics.secondaryMetrics.filter(m=>m.trim()).map(esc).join(' · ')}</p>` : ''}
  </div>

  ${baselineRows.length > 0 ? `
  <div class="section">
    <h2>Baselines to Beat</h2>
    <table>
      <thead><tr><th>Approach</th><th>Current Performance</th><th>Target</th></tr></thead>
      <tbody>${baselineRows.map(b => `
        <tr>
          <td class="td-bold">${esc(b.approach)}</td>
          <td>${esc(b.performance)}</td>
          <td>${esc(b.target)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <div class="section">
    <h2>Abstract System Description</h2>
    ${state.solutionSpace.inputs.filter(s=>s.trim()).length > 0 ? `<ul class="bullets" style="margin-bottom:6px"><li style="font-weight:600;font-size:10pt;margin-bottom:2px">Inputs</li>${state.solutionSpace.inputs.filter(s=>s.trim()).map(s=>`<li><span class="bullet">•</span> ${esc(s)}</li>`).join('')}</ul>` : ''}
    ${state.solutionSpace.outputs.filter(s=>s.trim()).length > 0 ? `<ul class="bullets"><li style="font-weight:600;font-size:10pt;margin-bottom:2px">Outputs</li>${state.solutionSpace.outputs.filter(s=>s.trim()).map(s=>`<li><span class="bullet">•</span> ${esc(s)}</li>`).join('')}</ul>` : ''}
    ${state.solutionSpace.constraints ? `<p style="font-size:10pt"><strong>Constraints:</strong> <span style="color:#475569">${esc(state.solutionSpace.constraints)}</span></p>` : ''}
  </div>

  ${chosenFeasibility?.dataVolume || chosenFeasibility?.modelingStack ? `
  <div class="section">
    <h2>Data & Infrastructure</h2>
    ${chosenFeasibility.dataVolume ? `<p style="font-size:10pt;margin-bottom:6px"><strong>Data:</strong> <span style="color:#475569">${esc(chosenFeasibility.dataVolume)}</span></p>` : ''}
    ${chosenFeasibility.dataLabels ? `<p style="font-size:10pt;margin-bottom:6px"><strong>Labels:</strong> <span style="color:#475569">${chosenFeasibility.dataLabels}</span></p>` : ''}
    ${chosenFeasibility.computeBudget ? `<p style="font-size:10pt;margin-bottom:6px"><strong>Compute:</strong> <span style="color:#475569">${esc(chosenFeasibility.computeBudget)}</span></p>` : ''}
    ${chosenFeasibility.modelingStack ? `<p style="font-size:10pt"><strong>Stack:</strong> <span style="color:#475569">${esc(chosenFeasibility.modelingStack)}</span></p>` : ''}
  </div>` : ''}

  ${(chosenFeasibility?.regulations ?? []).length > 0 ? `
  <div class="section">
    <h2>Regulatory & Compliance Requirements</h2>
    ${(chosenFeasibility?.regulations ?? []).map(r => `
      <p class="reg-name">${esc(r.name)}</p>
      ${r.articles ? `<p class="reg-body">${esc(r.articles).replace(/\n/g,'<br>')}</p>` : ''}`).join('')}
  </div>` : ''}

  ${spec.solutionComponents ? `
  <div class="section">
    <h2>Solution Components</h2>
    ${chosenFeasibility?.sieveBaseline ? `<div class="baseline-note"><strong>Note:</strong> A non-AI baseline comparison has been flagged. Include a reference approach and document how the AI system outperforms it.</div>` : ''}
    <ul class="bullets">${spec.solutionComponents.split('\n').filter(l=>l.trim()).map(l=>`<li><span class="bullet">•</span> ${esc(l.trim())}</li>`).join('')}</ul>
  </div>` : ''}
</body>
</html>`)

    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 400)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-slate-900">Final Specification</h2>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed">
            The fields below are pre-filled from your earlier work. Refine them until they read as a professional briefing document, then export.
          </p>
        </div>
        <button onClick={() => setShowPreview(true)}
          className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          <FileText className="w-4 h-4" /> Preview & Export
        </button>
      </div>

      <div className="grid gap-6 max-w-3xl">
        <Card title="Project Info">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client / Organisation">
              <input type="text" value={spec.clientName} onChange={e => onUpdateSpec('clientName', e.target.value)}
                placeholder={template?.title ?? 'Organisation name'} className={inputCls} />
            </FormField>
            <FormField label="Timeline">
              <input type="text" value={spec.timeline} onChange={e => onUpdateSpec('timeline', e.target.value)}
                placeholder="e.g. 16 weeks" className={inputCls} />
            </FormField>
          </div>
        </Card>

        <Card title="Executive Summary">
          <p className="text-xs text-slate-400 mb-2">
            2–3 sentences: who the client is, what the problem costs them, and what you have been tasked with building.
          </p>
          <textarea rows={5} value={spec.executiveSummary} onChange={e => onUpdateSpec('executiveSummary', e.target.value)}
            placeholder="e.g. Regional Medical Centre faces preventable ICU deterioration events due to a lack of systematic early warning…"
            className={inputCls} />
        </Card>

        <Card title="Solution Components">
          {chosenFeasibility?.sieveBaseline && (
            <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Baseline comparison flagged.</strong> Include a non-AI reference approach and document how the AI solution outperforms it.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-400 mb-2">Describe the pipeline components you plan to build — one line per component.</p>
          <textarea rows={6} value={spec.solutionComponents} onChange={e => onUpdateSpec('solutionComponents', e.target.value)}
            placeholder={`Data preprocessing pipeline\nModel training and evaluation\nReal-time inference API\nMonitoring and drift detection`}
            className={inputCls} />
        </Card>

        {/* Read-only summaries of earlier steps */}
        <ReadOnlyCard title="Problem Statement (from Step 1)">
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {problemDef.problemStatement || <span className="italic text-slate-300">Not filled in yet.</span>}
          </p>
        </ReadOnlyCard>

        <ReadOnlyCard title="Primary KPI (from Step 2)">
          <p className="text-sm text-slate-600">{metrics.primaryMetric || <span className="italic text-slate-300">Not filled in yet.</span>}</p>
        </ReadOnlyCard>

        {chosen && (
          <ReadOnlyCard title="Chosen Solution Approach (from Step 3)">
            <p className="text-sm font-semibold text-slate-800 mb-1">{chosen.name}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{chosen.description}</p>
          </ReadOnlyCard>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-10 px-4">
          <div className="fixed top-4 right-4 flex gap-2 z-50">
            <button onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Save as PDF
            </button>
            <button onClick={() => setShowPreview(false)}
              className="bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors">
              Close
            </button>
          </div>

          <div className="bg-white w-full max-w-[794px] shadow-2xl rounded-sm px-[72px] py-[64px] text-slate-900"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            <p className="text-right text-sm text-slate-400 mb-8">{new Date().toISOString().slice(0, 10)}</p>

            <h1 className="text-2xl font-normal mb-1">AI Scoping Briefing</h1>
            <p className="italic text-slate-600 mb-4">{spec.clientName || template?.title || 'Client Organisation'}{chosen ? ` — ${chosen.name}` : ''}</p>
            <div className="flex gap-6 text-sm mb-6">
              <span><strong>Client:</strong> {spec.clientName || '—'}</span>
              <span><strong>Timeline:</strong> {spec.timeline || '—'}</span>
            </div>

            {spec.executiveSummary && <DocSection title="Executive Summary"><p className="text-sm leading-relaxed whitespace-pre-line">{spec.executiveSummary}</p></DocSection>}

            <DocSection title="Problem Statement">
              <p className="text-sm leading-relaxed whitespace-pre-line">{problemDef.problemStatement || '—'}</p>
            </DocSection>

            <DocSection title="Stakeholders & Priorities">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b-2 border-slate-300">{['Stakeholder','Primary Concerns','Success Metrics'].map(h=><th key={h} className="text-left py-2 pr-4 font-bold">{h}</th>)}</tr></thead>
                <tbody>{problemDef.stakeholders.filter(r=>r.role.trim()).map(r=>(
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-1.5 pr-4 font-semibold align-top">{r.role}</td>
                    <td className="py-1.5 pr-4 align-top">{r.concerns}</td>
                    <td className="py-1.5 align-top">{r.metrics}</td>
                  </tr>
                ))}</tbody>
              </table>
            </DocSection>

            <DocSection title="Objectives">
              <ol className="space-y-1.5">{metrics.objectives.filter(o=>o.trim()).map((o,i)=>(
                <li key={i} className="text-sm flex gap-2"><span className="font-semibold shrink-0">{i+1}.</span><span>{o}</span></li>
              ))}</ol>
              {metrics.primaryMetric && <p className="text-sm mt-2"><strong>Primary KPI:</strong> {metrics.primaryMetric}</p>}
            </DocSection>

            {metrics.baselines.filter(b=>b.approach.trim()).length > 0 && (
              <DocSection title="Baselines to Beat">
                <table className="w-full text-sm border-collapse">
                  <thead><tr className="border-b-2 border-slate-300">{['Approach','Current Performance','Target'].map(h=><th key={h} className="text-left py-2 pr-4 font-bold">{h}</th>)}</tr></thead>
                  <tbody>{metrics.baselines.filter(b=>b.approach.trim()).map(b=>(
                    <tr key={b.id} className="border-b border-slate-100">
                      <td className="py-1.5 pr-4 font-semibold align-top">{b.approach}</td>
                      <td className="py-1.5 pr-4 align-top">{b.performance}</td>
                      <td className="py-1.5 align-top">{b.target}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </DocSection>
            )}

            {(chosenFeasibility?.regulations ?? []).length > 0 && (
              <DocSection title="Regulatory & Compliance Requirements">
                <div className="space-y-3">{(chosenFeasibility?.regulations ?? []).map(r=>(
                  <div key={r.id}><p className="text-sm font-bold">{r.name}</p>{r.articles&&<p className="text-sm text-slate-600 mt-0.5 whitespace-pre-line">{r.articles}</p>}</div>
                ))}</div>
              </DocSection>
            )}

            {spec.solutionComponents && (
              <DocSection title="Solution Components">
                {chosenFeasibility?.sieveBaseline && (
                  <div className="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Baseline comparison required — include a non-AI reference approach.</span>
                  </div>
                )}
                <ul className="space-y-1.5">{spec.solutionComponents.split('\n').filter(l=>l.trim()).map((l,i)=>(
                  <li key={i} className="text-sm flex gap-2"><span className="text-slate-400">•</span><span>{l.trim()}</span></li>
                ))}</ul>
              </DocSection>
            )}
          </div>
        </div>
      )}
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

function ReadOnlyCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{title}</p>
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold mb-2 text-slate-900 border-b border-slate-200 pb-1">{title}</h2>
      {children}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition'
