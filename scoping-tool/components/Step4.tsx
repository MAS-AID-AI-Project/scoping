'use client'

import { useState } from 'react'
import { Plus, Trash2, FileText, X, Printer, AlertTriangle } from 'lucide-react'
import { type Problem, type FeasibilityEntry, type SpecData, type StakeholderRow } from '@/lib/types'

interface Props {
  problem: Problem
  feasibility: FeasibilityEntry
  baseline?: boolean
  spec: SpecData
  onUpdateSpec: (field: keyof SpecData, value: unknown) => void
  onUpdateStakeholder: (id: string, field: keyof StakeholderRow, value: string) => void
  onAddStakeholder: () => void
  onDeleteStakeholder: (id: string) => void
  onUpdateObjective: (index: number, value: string) => void
  onAddObjective: () => void
  onDeleteObjective: (index: number) => void
}

export default function Step4({
  problem,
  feasibility,
  baseline,
  spec,
  onUpdateSpec,
  onUpdateStakeholder,
  onAddStakeholder,
  onDeleteStakeholder,
  onUpdateObjective,
  onAddObjective,
  onDeleteObjective,
}: Props) {
  const [showPreview, setShowPreview] = useState(false)

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) { alert('Please allow popups for this site.'); return }

    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

    const today = new Date().toISOString().slice(0, 10)

    const regHtml = feasibility.regulations.length > 0
      ? feasibility.regulations.map(r => `
          <div class="reg-entry">
            <p class="reg-name">${esc(r.name)}</p>
            ${r.articles ? `<p class="reg-articles">${esc(r.articles).replace(/\n/g, '<br>')}</p>` : ''}
          </div>`).join('')
      : '<p class="empty">No regulations specified.</p>'

    const stakeholderRows = spec.stakeholders.filter(r => r.role.trim()).map(r => `
      <tr>
        <td class="sh-role">${esc(r.role)}</td>
        <td>${esc(r.concerns)}</td>
        <td>${esc(r.metrics)}</td>
      </tr>`).join('')

    const objectivesHtml = spec.objectives.filter(o => o.trim()).map((obj, i) => `
      <li><span class="obj-num">${i + 1}.</span> ${esc(obj)}</li>`).join('')

    const challengeHtml = spec.businessChallengeRaw.split('\n').filter(l => l.trim()).map(line => `
      <li><span class="bullet">•</span> ${esc(line.trim())}</li>`).join('')

    const solutionHtml = spec.solutionComponents
      ? spec.solutionComponents.split('\n').filter(l => l.trim()).map(line => `
          <li><span class="bullet">•</span> ${esc(line.trim())}</li>`).join('')
      : ''

    const baselineNote = baseline ? `
      <div class="baseline-note">
        <strong>Note:</strong> A non-AI baseline comparison has been flagged for this problem.
        Include a reference approach (e.g. rule-based system or heuristic scorecard) and document
        how the AI solution outperforms it.
      </div>` : ''

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>AI Scoping Briefing — ${esc(problem.title)}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, "Times New Roman", serif; font-size: 11pt; color: #1e293b; line-height: 1.6; }
    .date { text-align: right; font-size: 10pt; color: #64748b; margin-bottom: 32px; }
    h1 { font-size: 18pt; font-weight: normal; margin-bottom: 4px; }
    .subtitle { font-style: italic; font-size: 12pt; color: #475569; margin-bottom: 16px; }
    .meta { display: flex; gap: 24px; font-size: 10pt; margin-bottom: 24px; }
    .exec-summary { font-size: 11pt; line-height: 1.7; margin-bottom: 32px; white-space: pre-line; }
    .section { margin-bottom: 24px; page-break-inside: avoid; }
    .section h2 { font-size: 11pt; font-weight: bold; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 12px; }
    ul.bullets, ol.numbered { list-style: none; padding: 0; }
    ul.bullets li, ol.numbered li { display: flex; gap: 8px; margin-bottom: 6px; font-size: 10.5pt; line-height: 1.6; }
    .bullet { color: #94a3b8; flex-shrink: 0; margin-top: 1px; }
    .obj-num { font-weight: 600; flex-shrink: 0; margin-top: 1px; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    thead tr { border-bottom: 2px solid #94a3b8; }
    th { text-align: left; padding: 6px 12px 6px 0; font-weight: bold; }
    td { padding: 6px 12px 6px 0; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
    .sh-role { font-weight: 600; }
    .reg-entry { margin-bottom: 14px; }
    .reg-name { font-weight: bold; font-size: 10.5pt; margin-bottom: 3px; }
    .reg-articles { font-size: 10pt; color: #475569; line-height: 1.6; }
    .empty { color: #94a3b8; font-style: italic; font-size: 10pt; }
    .baseline-note { background: #fefce8; border: 1px solid #fde68a; border-radius: 4px; padding: 10px 14px; margin-bottom: 14px; font-size: 10pt; color: #92400e; }
    .data-assets { font-size: 10.5pt; line-height: 1.7; white-space: pre-line; }
  </style>
</head>
<body>
  <p class="date">${today}</p>
  <h1>Executive Summary</h1>
  <p class="subtitle">${esc(problem.title)}</p>
  <div class="meta">
    <span><strong>Client:</strong> ${esc(spec.clientName || '—')}</span>
    <span><strong>Timeline:</strong> ${esc(spec.timeline || '—')}</span>
  </div>
  <p class="exec-summary">${esc(spec.executiveSummary)}</p>

  <div class="section">
    <h2>Business Challenge</h2>
    <ul class="bullets">${challengeHtml}</ul>
  </div>

  <div class="section">
    <h2>Objectives</h2>
    <ol class="numbered">${objectivesHtml}</ol>
  </div>

  <div class="section">
    <h2>Data Assets</h2>
    <p class="data-assets">${esc(spec.dataAssetsDetail || '—')}</p>
  </div>

  <div class="section">
    <h2>Regulatory &amp; Compliance Requirements</h2>
    ${regHtml}
  </div>

  <div class="section">
    <h2>Stakeholders and Their Priorities</h2>
    <table>
      <thead><tr><th>Stakeholder</th><th>Primary Concerns</th><th>Success Metrics</th></tr></thead>
      <tbody>${stakeholderRows}</tbody>
    </table>
  </div>

  ${solutionHtml ? `
  <div class="section">
    <h2>Solution Components</h2>
    ${baselineNote}
    <ul class="bullets">${solutionHtml}</ul>
  </div>` : ''}
</body>
</html>`)

    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 400)
  }

  return (
    <div className="space-y-8">
      {/* ── header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-slate-900">Final specification</h2>
          <p className="mt-2 text-slate-500 text-sm leading-relaxed">
            Fields pre-filled from your earlier answers — refine until it reads like a professional
            briefing document. Hit{' '}
            <strong className="text-slate-700">Preview Document</strong> when ready, then print to
            PDF.
          </p>
        </div>
        <button
          onClick={() => setShowPreview(true)}
          className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <FileText className="w-4 h-4" />
          Preview Document
        </button>
      </div>

      {/* ── form ── */}
      <div className="grid gap-6 max-w-3xl">

        {/* Project Info */}
        <Card title="Project Info">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Client / Organisation">
              <input
                type="text"
                value={spec.clientName}
                onChange={e => onUpdateSpec('clientName', e.target.value)}
                placeholder="e.g. SwissCredit Bank AG"
                className={inputCls}
              />
            </FormField>
            <FormField label="Timeline">
              <input
                type="text"
                value={spec.timeline}
                onChange={e => onUpdateSpec('timeline', e.target.value)}
                placeholder="e.g. 22 weeks"
                className={inputCls}
              />
            </FormField>
          </div>
        </Card>

        {/* Executive Summary */}
        <Card title="Executive Summary">
          <p className="text-xs text-slate-400 mb-2">
            2–3 sentences: who the client is, what the problem costs them, what you&apos;ve been
            tasked with building.
          </p>
          <textarea
            rows={5}
            value={spec.executiveSummary}
            onChange={e => onUpdateSpec('executiveSummary', e.target.value)}
            className={inputCls}
          />
        </Card>

        {/* Business Challenge */}
        <Card title="Business Challenge">
          <p className="text-xs text-slate-400 mb-2">
            One bullet per pain point — use a{' '}
            <strong className="text-slate-500">bold label</strong> followed by a quantified impact
            where possible.
          </p>
          <textarea
            rows={5}
            value={spec.businessChallengeRaw}
            onChange={e => onUpdateSpec('businessChallengeRaw', e.target.value)}
            placeholder={`Processing Delays: Manual reviews take 3–5 days, causing 35% applicant drop-off\nCompetitive Pressure: Digital lenders approve in hours\nRegulatory Exposure: Non-compliance fines reach CHF 10M+`}
            className={inputCls}
          />
        </Card>

        {/* Objectives */}
        <Card title="Objectives">
          <p className="text-xs text-slate-400 mb-3">
            Each objective should be concrete and measurable — &ldquo;Reduce X from A to B&rdquo;.
          </p>
          <div className="space-y-2">
            {spec.objectives.map((obj, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={obj}
                  onChange={e => onUpdateObjective(i, e.target.value)}
                  placeholder="e.g. Reduce decision time from 3–5 days to under 30 minutes"
                  className={inputCls}
                />
                {spec.objectives.length > 1 && (
                  <button
                    onClick={() => onDeleteObjective(i)}
                    className="text-slate-300 hover:text-rose-400 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={onAddObjective}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add objective
            </button>
          </div>
        </Card>

        {/* Data Assets */}
        <Card title="Data Assets">
          <p className="text-xs text-slate-400 mb-2">
            Volume, format, label availability, any gaps or privacy constraints.
          </p>
          <textarea
            rows={4}
            value={spec.dataAssetsDetail}
            onChange={e => onUpdateSpec('dataAssetsDetail', e.target.value)}
            placeholder="e.g. ~10 years of historical loan data (1.2M records in CSV). Each record includes repayment outcome, quarterly credit bureau updates, and demographic indicators."
            className={inputCls}
          />
        </Card>

        {/* Regulatory — read from feasibility, not editable here */}
        <Card title="Regulatory & Compliance Requirements">
          {feasibility.regulations.length > 0 ? (
            <div className="space-y-4">
              {feasibility.regulations.map(reg => (
                <div key={reg.id}>
                  <p className="text-sm font-semibold text-slate-800">{reg.name || '(unnamed)'}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed whitespace-pre-wrap">
                    {reg.articles || <span className="italic text-slate-300">No articles noted yet.</span>}
                  </p>
                </div>
              ))}
              <p className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                To edit these, go back to the Feasibility step.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No regulations added yet — go back to the Feasibility step to add them.
            </p>
          )}
        </Card>

        {/* Stakeholders */}
        <Card title="Stakeholders and Their Priorities">
          <p className="text-xs text-slate-400 mb-3">
            Add each stakeholder group, their primary concerns, and the metrics they&apos;d use to
            judge success.
          </p>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 px-1">
              {['Stakeholder', 'Primary Concerns', 'Success Metrics'].map(h => (
                <p key={h} className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {h}
                </p>
              ))}
            </div>
            {spec.stakeholders.map(row => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_1fr_2rem] gap-2 items-center">
                <input
                  type="text"
                  value={row.role}
                  onChange={e => onUpdateStakeholder(row.id, 'role', e.target.value)}
                  placeholder="e.g. Chief Risk Officer"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={row.concerns}
                  onChange={e => onUpdateStakeholder(row.id, 'concerns', e.target.value)}
                  placeholder="e.g. Model accuracy"
                  className={inputCls}
                />
                <input
                  type="text"
                  value={row.metrics}
                  onChange={e => onUpdateStakeholder(row.id, 'metrics', e.target.value)}
                  placeholder="e.g. Default rates"
                  className={inputCls}
                />
                {spec.stakeholders.length > 1 && (
                  <button
                    onClick={() => onDeleteStakeholder(row.id)}
                    className="text-slate-300 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={onAddStakeholder}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium mt-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add stakeholder
            </button>
          </div>
        </Card>

        {/* Solution Components */}
        <Card title="Solution Components">
          {baseline && (
            <div className="flex gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>Baseline comparison flagged.</strong> Include a non-AI reference approach
                in your pipeline (e.g. rule-based system, logistic regression, or heuristic
                scorecard) and document how the AI solution outperforms it.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-400 mb-2">
            Describe the pipeline components you plan to build.
          </p>
          <textarea
            rows={6}
            value={spec.solutionComponents}
            onChange={e => onUpdateSpec('solutionComponents', e.target.value)}
            placeholder={`Data preprocessing pipeline — handle missing values, outliers, feature engineering\nModel training — compare multiple approaches\nEvaluation framework — statistical + business metrics\nDeployment API — REST endpoint with explanations`}
            className={inputCls}
          />
        </Card>
      </div>

      {/* ── Briefing Preview Modal ── */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto py-10 px-4">
          {/* toolbar */}
          <div className="fixed top-4 right-4 flex gap-2 z-50">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
            <button
              onClick={() => setShowPreview(false)}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4" /> Close
            </button>
          </div>

          {/* document */}
          <div
            id="briefing-doc"
            className="bg-white w-full max-w-[794px] min-h-[1123px] shadow-2xl rounded-sm px-[72px] py-[64px] text-slate-900"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            <p className="text-right text-sm text-slate-500 mb-10">
              {new Date().toISOString().slice(0, 10)}
            </p>

            <h1 className="text-2xl font-normal mb-1">Executive Summary</h1>
            <p className="italic text-base mb-4 text-slate-700">{problem.title}</p>
            <div className="flex gap-6 mb-6 text-sm">
              <span><strong>Client:</strong> {spec.clientName || '—'}</span>
              <span><strong>Timeline:</strong> {spec.timeline || '—'}</span>
            </div>
            <p className="text-sm leading-relaxed mb-8 whitespace-pre-line">{spec.executiveSummary}</p>

            <DocSection title="Business Challenge">
              <ul className="space-y-1.5">
                {spec.businessChallengeRaw.split('\n').filter(l => l.trim()).map((line, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-slate-400 mt-0.5 shrink-0">•</span>
                    <span className="leading-relaxed">{line.trim()}</span>
                  </li>
                ))}
              </ul>
            </DocSection>

            <DocSection title="Objectives">
              <ol className="space-y-1.5">
                {spec.objectives.filter(o => o.trim()).map((obj, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="font-semibold shrink-0">{i + 1}.</span>
                    <span className="leading-relaxed">{obj}</span>
                  </li>
                ))}
              </ol>
            </DocSection>

            <DocSection title="Data Assets">
              <p className="text-sm leading-relaxed whitespace-pre-line">{spec.dataAssetsDetail || '—'}</p>
            </DocSection>

            <DocSection title="Regulatory & Compliance Requirements">
              {feasibility.regulations.length > 0 ? (
                <div className="space-y-4">
                  {feasibility.regulations.map(reg => (
                    <div key={reg.id}>
                      <p className="text-sm font-bold">{reg.name}</p>
                      {reg.articles && (
                        <p className="text-sm leading-relaxed mt-0.5 whitespace-pre-line">{reg.articles}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No regulations specified.</p>
              )}
            </DocSection>

            <DocSection title="Stakeholders and Their Priorities">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-300">
                    {['Stakeholder', 'Primary Concerns', 'Success Metrics'].map(h => (
                      <th key={h} className="text-left py-2 pr-4 font-bold text-slate-800">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spec.stakeholders.filter(r => r.role.trim()).map(row => (
                    <tr key={row.id} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-semibold align-top">{row.role}</td>
                      <td className="py-2 pr-4 align-top">{row.concerns}</td>
                      <td className="py-2 align-top">{row.metrics}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DocSection>

            {spec.solutionComponents && (
              <DocSection title="Solution Components">
                <ul className="space-y-1.5">
                  {spec.solutionComponents.split('\n').filter(l => l.trim()).map((line, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-slate-400 mt-0.5 shrink-0">•</span>
                      <span className="leading-relaxed">{line.trim()}</span>
                    </li>
                  ))}
                </ul>
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
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

const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none transition'
