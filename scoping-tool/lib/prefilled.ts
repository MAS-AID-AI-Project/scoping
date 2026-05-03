import { DEFAULT_QUESTIONS } from './types'
import type { Problem, SieveAnswers, FeasibilityEntry, SpecData } from './types'

// Fixed IDs so data is always consistent
const P1 = 'pre-p1'
const P2 = 'pre-p2'
const P3 = 'pre-p3'
const P4 = 'pre-p4'

export const PREFILLED_STATE = {
  step: 1,

  problems: [
    {
      id: P1,
      title: 'Loan Default Risk Prediction',
      challenge:
        'Manual credit assessments take 3–5 business days, causing a 35% drop-off among qualified applicants. Reviewers rely on intuition and fixed scorecards that miss patterns buried in 10 years of historical data. Digital-first competitors approve loans in under 2 hours.',
      endUsers: 'Retail banking customers, loan officers, Chief Risk Officer',
      currentSolution:
        'Loan officers manually review applications against a point-based scorecard, then cross-check with credit bureau data. Borderline cases escalate to a committee — adding 2 more days.',
    },
    {
      id: P2,
      title: 'Auto-Fill Customer Web Forms',
      challenge:
        'Admin staff manually re-enter tenant data from the internal CRM into government portals and utility provider websites. Each submission takes ~20 minutes and frequent copy-paste errors increase compliance risk.',
      endUsers: 'Admin staff, leasing agents',
      currentSolution:
        'Staff open the CRM in one window and the external portal in another, copy-pasting field by field. No validation — errors are caught only after form submission.',
    },
    {
      id: P3,
      title: 'Patient Readmission Risk Monitoring',
      challenge:
        '30-day hospital readmission rates sit at 18%, above the national benchmark. 70% of clinical information lives in unstructured free-text notes that nurses cannot systematically act on. High-risk patients are missed until it is too late for early intervention.',
      endUsers: 'Clinical nurses, Emergency Department director, patients',
      currentSolution:
        'Weekly case-review meetings where senior clinicians manually flag high-risk patients. No proactive alerts between rounds; relies entirely on individual memory and workload.',
    },
    {
      id: P4,
      title: 'Weekly Regulatory Report Generation',
      challenge:
        'The compliance team spends 6 hours every Friday aggregating trade logs from 4 fixed internal systems into a standardised Excel template, then emailing it to the regulator. The process is repetitive and error-prone — a misplaced formula caused a reporting incident last quarter.',
      endUsers: 'Compliance officers',
      currentSolution:
        'Manual copy-paste from four internal dashboards into a shared Excel file. Each column maps to a fixed source field — the mapping never changes.',
    },
  ] as Problem[],

  questions: DEFAULT_QUESTIONS,

  sieve: {
    [P1]: {
      answers: {
        'q-default-1': false,
        'q-default-2': true,
        'q-default-3': false,
      },
      decision: 'keep',
      baseline: true,  // loan scoring has a strong logistic regression baseline worth comparing
    },
    [P2]: {
      answers: {
        'q-default-1': true,   // rules ARE definable — fixed field mapping
        'q-default-2': false,  // no prediction or NLG needed
        'q-default-3': true,   // a script / RPA handles this trivially
      },
      decision: 'discard',
    },
    [P3]: {
      answers: {
        'q-default-1': false,  // clinical risk is not fully rule-based
        'q-default-2': true,   // requires NLP + temporal prediction
        'q-default-3': false,  // no script can read unstructured notes reliably
      },
      decision: 'keep',
    },
    [P4]: {
      answers: {
        'q-default-1': true,   // format is fixed, fields are defined
        'q-default-2': false,  // no intelligence required
        'q-default-3': true,   // a scheduled script does this in seconds
      },
      decision: 'discard',
    },
  } as Record<string, SieveAnswers>,

  feasibility: {
    [P1]: {
      dataVolume:
        '1.2M loan applications spanning 10 years, stored in CSV. Each record includes repayment outcome, quarterly credit bureau snapshots, and external demographic / economic indicators.',
      dataLabels: 'yes' as const,
      syntheticDataNote:
        'SMOTE for class imbalance. CTGAN for privacy-preserving augmentation if demographic data must be anonymised.',
      computeBudget: 'AWS SageMaker GPU instances — CHF 5k training budget approved.',
      modelingStack: 'Scikit-learn (Logistic Regression, XGBoost, ensemble) + SHAP for interpretability',
      regulations: [
        {
          id: 'pre-reg-1a',
          name: 'EU AI Act',
          articles:
            'Credit-worthiness evaluation of natural persons is a high-risk use case (Annex III). Requirements: documented risk management process (Art. 9), data governance ensuring quality and representativeness (Art. 10), technical documentation (Art. 11), human oversight with ability to override (Art. 14), post-market monitoring (Art. 72).',
        },
        {
          id: 'pre-reg-1b',
          name: 'GDPR',
          articles:
            'Art. 22 (Automated decision-making): where fully automated decisions produce significant effects, data subjects have the right to human intervention, to express their view, and to contest the decision. Meaningful information about the logic involved must be provided.',
        },
        {
          id: 'pre-reg-1c',
          name: 'FINMA',
          articles:
            'Outputs must be understandable to decision-makers; limits and uncertainties must be stated to prevent over-reliance. Changes to models (re-training, new data sources) must be documented and reviewed. On request, a natural person must review the automated decision.',
        },
        {
          id: 'pre-reg-1d',
          name: 'revFADP',
          articles:
            'Requires lawful, proportionate processing. Swiss financial supervision expects transparent, non-discriminatory outcomes with documented evidence of fairness measures.',
        },
      ],
    },
    [P3]: {
      dataVolume: '50,000+ patient EHR records (structured CSV + free-text clinical notes in multiple formats).',
      dataLabels: 'partial' as const,
      syntheticDataNote:
        'PHI restrictions make synthetic generation complex — differential privacy techniques required. Limited to in-hospital sandbox environment.',
      computeBudget: 'On-premise GPU server + HIPAA-compliant cloud storage for model artefacts.',
      modelingStack: 'XGBoost (tabular) + LSTM (temporal sequences) + BioBERT (clinical NLP extraction)',
      regulations: [
        {
          id: 'pre-reg-3a',
          name: 'EU AI Act',
          articles:
            'AI is high-risk when used as a safety component of a medical device. Requirements: risk management, data governance, technical documentation, logging, human oversight, post-market monitoring (Art. 9–17, 72).',
        },
        {
          id: 'pre-reg-3b',
          name: 'GDPR / revFADP',
          articles:
            'Health data is special-category (Art. 9 GDPR) — requires explicit consent or public interest legal basis. Art. 22 automated decision safeguards apply where care-eligibility is affected. revFADP mirrors this with a duty to inform and enable human review.',
        },
        {
          id: 'pre-reg-3c',
          name: 'HL7 FHIR',
          articles:
            'eHealth Network recommends FHIR as base standard for cross-border health data exchange. All patient profile data must be stored in FHIR-compatible resource format for interoperability across hospital systems.',
        },
        {
          id: 'pre-reg-3d',
          name: 'SNOMED CT / ICD-10',
          articles:
            'Diagnoses and procedures in patient records must use ICD-10 codes. Clinical entities extracted from notes must be mapped to SNOMED CT for compatibility with other healthcare organisations.',
        },
      ],
    },
  } as Record<string, FeasibilityEntry>,

  selectedId: P1,

  spec: {
    clientName: 'SwissCredit Bank AG',
    timeline: '22 weeks',
    executiveSummary:
      'SwissCredit Bank processes over 50,000 loan applications monthly across Switzerland and the EU. Current assessment processes require 3–5 business days, resulting in a 35% attrition rate among qualified applicants and operational costs exceeding CHF 85 per manual review. Digital-native competitors approve loans within hours, capturing significant market share. At the same time, evolving regulations under the EU AI Act, GDPR, and FINMA require enhanced transparency, fairness, and oversight for AI-driven credit decisions.\n\nWe have been tasked with developing an end-to-end machine learning pipeline to predict loan default risk, balancing accuracy, interpretability, and compliance. Deliverables include a bias-aware risk prediction system, explainable model outputs, and audit-ready documentation suitable for high-risk financial AI applications.',
    businessChallengeRaw:
      'Processing Delays: Manual reviews require 3–5 days, causing 35% drop-off among qualified applicants\nCompetitive Pressure: Digital lenders approve loans in under 2 hours, increasing customer churn\nRegulatory Exposure: Non-compliance with EU AI Act and FINMA guidelines leads to fines of several million CHF for peer institutions\nOperational Costs: Manual assessment costs ~CHF 85 per application',
    objectives: [
      'Reduce decision time from 3–5 days to under 30 minutes for 80% of applications',
      'Maintain portfolio default rates below the current 20% threshold',
      'Ensure full compliance with EU AI Act, Swiss FINMA guidelines, and GDPR',
      'Provide transparent, explainable decisions for all applicants',
    ],
    dataAssetsDetail:
      '~10 years of historical loan data (1.2M applications in CSV format). Each record includes:\n• Eventual repayment outcome (label)\n• Quarterly credit bureau updates\n• External demographic and economic indicators (ethnicity, education, unemployment rate)',
    stakeholders: [
      { id: 'ss1', role: 'CEO / Board', concerns: 'Regulatory compliance, competitive position', metrics: 'Market share, compliance status' },
      { id: 'ss2', role: 'Chief Risk Officer', concerns: 'Model accuracy, portfolio quality', metrics: 'Default rates, loss provisions' },
      { id: 'ss3', role: 'Head of Retail Banking', concerns: 'Customer satisfaction, processing speed', metrics: 'Time-to-decision' },
      { id: 'ss4', role: 'Compliance Officer', concerns: 'Regulatory adherence, audit readiness', metrics: 'Zero violations, clean audits' },
      { id: 'ss5', role: 'IT Director', concerns: 'System reliability, integration complexity', metrics: 'Uptime, API response times' },
      { id: 'ss6', role: 'Loan Officers', concerns: 'Tool usability, customer explanations', metrics: 'Adoption rate, intervention frequency' },
    ],
    solutionComponents:
      'Credit Risk Assessment Pipeline — clean and feature-engineer 1.2M records; compare Logistic Regression, XGBoost, and ensemble methods using AUC-ROC and business metrics\nBias Detection & Mitigation System — compute demographic parity and equalized odds; implement threshold optimisation and fairness-aware training objectives\nModel Interpretability Framework — SHAP global feature importance + local explanations for individual decisions; essential for GDPR Art. 22 and FINMA compliance\nDeployment-Ready API — REST endpoint returning risk score, confidence band, and human-readable decision rationale; includes drift monitoring',
  } as SpecData,
}
