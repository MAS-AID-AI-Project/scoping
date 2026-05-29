export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

export type ProblemId = 'healthcare' | 'finance' | 'services' | 'loan' | 'media' | 'custom'

export interface TemplateStakeholder {
  role: string
  description: string
}

export interface ProblemTemplate {
  id: ProblemId
  domain: string
  color: string
  title: string
  context: string
  situation: string
  stakeholders: TemplateStakeholder[]
}

// ── Step 1: Problem Definition ───────────────────────────────────────────────

export interface StakeholderRow {
  id: string
  role: string
  concerns: string
  metrics: string
}

export interface ProblemDef {
  problemStatement: string
  rootCause: string
  affectedUsers: string
  currentProcess: string
  stakeholders: StakeholderRow[]
}

// ── Step 2: Success Metrics ───────────────────────────────────────────────────

export interface BaselineEntry {
  id: string
  approach: string
  performance: string
  target: string
}

export interface MetricsData {
  objectives: string[]
  primaryMetric: string
  secondaryMetrics: string[]
  baselines: BaselineEntry[]
}

// ── Step 3: Solution Space ────────────────────────────────────────────────────

export interface SolutionApproach {
  id: string
  name: string
  description: string
  inputTypes: string
  outputTypes: string
  pros: string
  cons: string
}

export interface SolutionSpace {
  inputs: string[]
  outputs: string[]
  constraints: string
  approaches: SolutionApproach[]
}

// ── Step 4: Feasibility ───────────────────────────────────────────────────────

export interface RegEntry {
  id: string
  name: string
  articles: string
}

export const SUGGESTED_REGS = [
  'EU AI Act', 'GDPR', 'revFADP', 'FINMA', 'MiFID II',
  'PSD2', 'Basel III', 'HL7 FHIR', 'HIPAA', 'SNOMED CT / ICD-10',
  'eIDAS', 'SOC 2',
]

export interface SieveQuestion {
  id: string
  text: string
  detail?: string
  isDefault?: boolean
}

export const DEFAULT_SIEVE_QUESTIONS: SieveQuestion[] = [
  {
    id: 'sq-1',
    text: 'Can this be fully solved by a deterministic rule-based algorithm or script?',
    detail: 'If yes, AI adds unnecessary complexity and maintenance burden.',
    isDefault: true,
  },
  {
    id: 'sq-2',
    text: 'Does the solution benefit from learning patterns in historical data?',
    detail: 'E.g. prediction, classification, anomaly detection, or natural language understanding.',
    isDefault: true,
  },
  {
    id: 'sq-3',
    text: 'Is there sufficient data available to train and validate a model?',
    detail: 'Supervised ML needs enough quality examples to generalise beyond the training set.',
    isDefault: true,
  },
]

// Per-approach feasibility (one of these per candidate solution)
export interface ApproachFeasibility {
  dataSources: string
  dataVolume: string
  dataLabels: 'yes' | 'partial' | 'no' | ''
  dataQuality: string
  dataAccess: string
  computeBudget: string
  modelingStack: string
  regulations: RegEntry[]
  sieveAnswers: Record<string, boolean>
  sieveDecision: 'ai' | 'non-ai' | null
  sieveBaseline: boolean
}

export interface FeasibilityData {
  perApproach: Record<string, ApproachFeasibility>  // keyed by approach ID
  customQuestions: SieveQuestion[]                   // shared across all approaches
  chosenApproachId: string | null                    // selected at the very end
}

export function emptyApproachFeasibility(): ApproachFeasibility {
  return {
    dataSources: '',
    dataVolume: '',
    dataLabels: '',
    dataQuality: '',
    dataAccess: '',
    computeBudget: '',
    modelingStack: '',
    regulations: [],
    sieveAnswers: {},
    sieveDecision: null,
    sieveBaseline: false,
  }
}

// ── Step 5: Final Specification ───────────────────────────────────────────────

export interface SpecData {
  clientName: string
  timeline: string
  executiveSummary: string
  expectedDataAvailability: string
  expectedComputeUsage: string
  solutionComponents: string
}

// ── Shared room state (synced via WebSocket) ──────────────────────────────────

export interface TeamState {
  problemId: ProblemId | null
  customTitle: string
  customContext: string
  customSituation: string
  currentStep: number
  problemDef: ProblemDef
  metrics: MetricsData
  solutionSpace: SolutionSpace
  feasibility: FeasibilityData
  spec: SpecData
}

// ── Factories ─────────────────────────────────────────────────────────────────

export function emptyProblemDef(): ProblemDef {
  return {
    problemStatement: '',
    rootCause: '',
    affectedUsers: '',
    currentProcess: '',
    stakeholders: [{ id: uid(), role: '', concerns: '', metrics: '' }],
  }
}

export function emptyMetrics(): MetricsData {
  return {
    objectives: [''],
    primaryMetric: '',
    secondaryMetrics: [''],
    baselines: [{ id: uid(), approach: 'Current manual process', performance: '', target: '' }],
  }
}

export function emptySolutionSpace(): SolutionSpace {
  return {
    inputs: [''],
    outputs: [''],
    constraints: '',
    approaches: [
      { id: uid(), name: '', description: '', inputTypes: '', outputTypes: '', pros: '', cons: '' },
      { id: uid(), name: '', description: '', inputTypes: '', outputTypes: '', pros: '', cons: '' },
    ],
  }
}

export function emptyFeasibility(): FeasibilityData {
  return {
    perApproach: {},
    customQuestions: [],
    chosenApproachId: null,
  }
}

export function emptySpec(): SpecData {
  return {
    clientName: '',
    timeline: '',
    executiveSummary: '',
    expectedDataAvailability: '',
    expectedComputeUsage: '',
    solutionComponents: '',
  }
}

export function emptyTeamState(): TeamState {
  return {
    problemId: null,
    customTitle: '',
    customContext: '',
    customSituation: '',
    currentStep: 1,
    problemDef: emptyProblemDef(),
    metrics: emptyMetrics(),
    solutionSpace: emptySolutionSpace(),
    feasibility: emptyFeasibility(),
    spec: emptySpec(),
  }
}
