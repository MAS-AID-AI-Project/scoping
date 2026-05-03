export interface Problem {
  id: string
  title: string
  challenge: string
  endUsers: string
  currentSolution: string
}

export interface SieveQuestion {
  id: string
  text: string
  detail?: string
  isDefault?: boolean
}

export const DEFAULT_QUESTIONS: SieveQuestion[] = [
  {
    id: 'q-default-1',
    text: 'Are the rules 100% definable in advance?',
    detail: 'Could you write an exhaustive if/else rulebook covering every case?',
    isDefault: true,
  },
  {
    id: 'q-default-2',
    text: 'Does this require pattern recognition, prediction, or natural language generation?',
    detail: 'e.g. classifying images, forecasting a value, generating text, detecting anomalies.',
    isDefault: true,
  },
  {
    id: 'q-default-3',
    text: 'Could a traditional script achieve this with lower risk?',
    detail: 'Think regex, SQL queries, deterministic rules — would that be enough?',
    isDefault: true,
  },
]

export interface SieveAnswers {
  answers: Record<string, boolean | null>   // questionId → boolean
  decision: 'keep' | 'discard' | null
  baseline?: boolean   // true → include non-AI baseline comparison in final spec
}

// A single named regulation with free-text sub-requirements
export interface RegEntry {
  id: string
  name: string      // e.g. "EU AI Act"
  articles: string  // e.g. "Art. 9 risk management, Art. 13 transparency…"
}

// Common names offered as quick-add chips in the UI — not enforced
export const SUGGESTED_REGS = [
  'EU AI Act',
  'GDPR',
  'FINMA',
  'MiFID II',
  'HL7 FHIR',
  'HIPAA',
  'revFADP',
  'SNOMED CT / ICD-10',
  'eIDAS',
] as const

export interface FeasibilityEntry {
  dataVolume: string
  dataLabels: 'yes' | 'partial' | 'no' | ''
  syntheticDataNote: string
  computeBudget: string
  modelingStack: string
  regulations: RegEntry[]
}

export interface StakeholderRow {
  id: string
  role: string
  concerns: string
  metrics: string
}

export interface SpecData {
  clientName: string
  timeline: string
  executiveSummary: string
  businessChallengeRaw: string
  objectives: string[]
  dataAssetsDetail: string
  stakeholders: StakeholderRow[]
  solutionComponents: string
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}
