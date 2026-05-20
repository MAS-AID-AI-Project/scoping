'use client'

import { useState } from 'react'
import RoomApp from '@/components/RoomApp'
import PasswordGate from '@/components/PasswordGate'
import { PREFILLED_LOAN } from '@/lib/prefilled-loan'
import { PREFILLED_HEALTHCARE } from '@/lib/prefilled-healthcare'
import { PREFILLED_AML } from '@/lib/prefilled-aml'
import { PREFILLED_SERVICES } from '@/lib/prefilled-services'
import type { TeamState } from '@/lib/types'
import { ArrowLeft } from 'lucide-react'

const COLOR_MAP: Record<string, { badge: string; bg: string; border: string; hover: string }> = {
  indigo: { badge: 'bg-indigo-50 text-indigo-700', bg: 'bg-indigo-50/50', border: 'border-indigo-200', hover: 'hover:border-indigo-400 hover:shadow-indigo-100' },
  emerald: { badge: 'bg-emerald-50 text-emerald-700', bg: 'bg-emerald-50/50', border: 'border-emerald-200', hover: 'hover:border-emerald-400 hover:shadow-emerald-100' },
  amber: { badge: 'bg-amber-50 text-amber-700', bg: 'bg-amber-50/50', border: 'border-amber-200', hover: 'hover:border-amber-400 hover:shadow-amber-100' },
}

const EXAMPLES = [
  {
    key: 'loan',
    domain: 'Finance',
    color: 'indigo',
    title: 'Loan Default Risk Assessment',
    org: 'SwissCredit Bank AG',
    note: 'Semester project example',
    description: 'XGBoost credit scoring pipeline with SHAP explanations to automate personal loan decisions. Covers EU AI Act compliance, FINMA explainability requirements, and logistic regression baseline.',
    state: PREFILLED_LOAN,
  },
  {
    key: 'healthcare',
    domain: 'Healthcare',
    color: 'emerald',
    title: 'ICU Early Warning System',
    org: 'Regional Medical Centre',
    note: null,
    description: 'XGBoost patient deterioration risk scoring from engineered vital sign features, with SHAP alerts delivered via Epic SMART-on-FHIR. Covers EU AI Act high-risk classification and clinical explainability.',
    state: PREFILLED_HEALTHCARE,
  },
  {
    key: 'aml',
    domain: 'Finance',
    color: 'indigo',
    title: 'AML Alert Triage System',
    org: 'Helvetia Wealth Management',
    note: null,
    description: 'XGBoost model trained on 2 years of investigator dispositions to prioritise the AML alert queue. Covers FINMA governance requirements, on-premise processing constraints, and graph-enhanced alternative.',
    state: PREFILLED_AML,
  },
  {
    key: 'services',
    domain: 'Services Business',
    color: 'amber',
    title: 'Customer Churn Prevention',
    org: 'Claros Analytics',
    note: null,
    description: 'Weekly XGBoost churn propensity scoring on Snowflake behavioral data, with SHAP risk factors surfaced in Salesforce. Covers class imbalance, NPS data gaps, and survival analysis alternative.',
    state: PREFILLED_SERVICES,
  },
]

function ExampleSelector({ onSelect }: { onSelect: (state: TeamState) => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-3">Instructor Portal</p>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">Worked Examples</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Select a problem to view the complete worked solution with all 5 steps filled in.
          </p>
        </div>

        <div className="grid gap-4">
          {EXAMPLES.map(ex => {
            const c = COLOR_MAP[ex.color] ?? COLOR_MAP.indigo
            return (
              <button
                key={ex.key}
                onClick={() => onSelect(ex.state)}
                className={`text-left w-full bg-white rounded-2xl border-2 ${c.border} ${c.hover} shadow-sm hover:shadow-md p-6 transition-all`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{ex.domain}</span>
                      {ex.note && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {ex.note}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 mb-0.5">{ex.title}</h3>
                    <p className="text-xs text-slate-400 mb-2">{ex.org}</p>
                    <p className="text-sm text-slate-500 leading-relaxed">{ex.description}</p>
                  </div>
                  <div className={`shrink-0 w-8 h-8 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mt-1`}>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function PrefilledContent() {
  const [selected, setSelected] = useState<TeamState | null>(null)

  if (selected) {
    return (
      <div className="relative">
        <button
          onClick={() => setSelected(null)}
          className="fixed top-4 left-4 z-50 flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All examples
        </button>
        <RoomApp code="DEMO" initialState={selected} persist={false} />
      </div>
    )
  }

  return <ExampleSelector onSelect={setSelected} />
}

export default function PrefilledPage() {
  return (
    <PasswordGate>
      <PrefilledContent />
    </PasswordGate>
  )
}
