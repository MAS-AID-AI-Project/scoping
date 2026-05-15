import type { TeamState } from './types'

export const PREFILLED_STATE: TeamState = {
  problemId: 'finance',
  customTitle: '',
  customContext: '',
  customSituation: '',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'SwissCredit Bank AG takes 3–5 business days to assess personal loan applications, causing a 35% drop-off among qualified applicants and losing market share to digital lenders who decide in under 2 hours. The manual scorecard-based process is slow, inconsistent across loan officers, and fails to exploit the predictive signal in 10 years of historical repayment data.',
    rootCause:
      'Loan officers rely on a fixed-field scorecard and individual judgement. Borderline cases escalate to a credit committee, adding 2 further days. There is no systematic mechanism to learn from the 1.2M historical application records already held by the bank.',
    affectedUsers: 'Retail banking customers applying for personal loans; loan officers handling 40–60 applications per week',
    currentProcess:
      'Applicant submits via branch or online portal → loan officer scores against scorecard + credit bureau → borderline cases go to credit committee → decision letter sent. Average end-to-end: 3–5 business days.',
    stakeholders: [
      { id: 'sh1', role: 'Chief Risk Officer', concerns: 'Portfolio default rates, regulatory exposure, model auditability', metrics: 'Default rate ≤ current 4.2%, clean FINMA audit' },
      { id: 'sh2', role: 'Head of Retail Banking', concerns: 'Application throughput, customer experience, competitive position', metrics: 'Time-to-decision < 30 min for 80% of cases, conversion rate +15%' },
      { id: 'sh3', role: 'Compliance & Legal Officer', concerns: 'EU AI Act high-risk classification, GDPR Art. 22, FINMA guidelines', metrics: 'Zero regulatory violations, explainability for 100% of decisions' },
      { id: 'sh4', role: 'Loan Officers', concerns: 'Usability, ability to explain decisions to applicants, workload', metrics: 'Tool adoption > 90%, override rate 5–15%' },
    ],
  },

  metrics: {
    objectives: [
      'Reduce median decision time from 3–5 days to under 30 minutes for 80% of applications',
      'Maintain portfolio default rate at or below the current 4.2% baseline',
      'Achieve full compliance with EU AI Act, FINMA guidelines, and GDPR Art. 22',
      'Provide a human-readable explanation for every credit decision',
    ],
    primaryMetric: 'Time-to-decision for 80th percentile of applications (target: ≤ 30 minutes)',
    secondaryMetrics: [
      '30-day default rate on auto-approved applications (target: ≤ 4.2%)',
      'False rejection rate — qualified applicants incorrectly declined (target: < 5%)',
      'Loan officer override rate (target: 5–15%)',
    ],
    baselines: [
      { id: 'bl1', approach: 'Manual scorecard + credit bureau review', performance: 'Median 3.2 days; default rate 4.2%; 35% applicant drop-off', target: '< 30 min decision; drop-off < 10%' },
      { id: 'bl2', approach: 'Logistic regression on scorecard features', performance: 'AUC-ROC 0.71; still requires manual override step', target: 'AUC-ROC ≥ 0.80; automated for low-risk tier' },
    ],
  },

  solutionSpace: {
    inputs: [
      'Loan application form (income, employment, loan amount, tenure)',
      'Credit bureau snapshot (score, payment history, utilisation)',
      'Bank relationship data (years as customer, existing products)',
      'External economic indicators (unemployment rate, region)',
    ],
    outputs: [
      'Risk tier — Low / Medium / High',
      'Approval recommendation',
      'Confidence score (0–100)',
      'Top 3 contributing factors (GDPR Art. 22)',
      'Human-review flag if confidence < threshold',
    ],
    constraints:
      'Decision latency < 5 seconds for automated tier. All processing within EU jurisdiction. Model must be interpretable to a non-technical loan officer. Must integrate with existing Temenos T24 core banking API.',
    approaches: [
      {
        id: 'ap1',
        name: 'Gradient Boosted Trees (XGBoost) + SHAP explanations',
        description: 'Train XGBoost on 10 years of labelled data. SHAP values produce per-decision feature attributions for regulatory explainability.',
        pros: 'Strong AUC on tabular data; SHAP provides legally-defensible explanations; fast inference; well-understood in financial risk',
        cons: 'Requires careful handling of class imbalance; retraining needed as macroeconomic conditions shift; still needs fairness/bias audit',
      },
      {
        id: 'ap2',
        name: 'Logistic Regression with feature engineering',
        description: 'Engineer features from raw application and bureau data, then train a logistic regression. Coefficients directly interpretable by regulators.',
        pros: 'Fully transparent; easiest regulatory approval path; no black-box concerns',
        cons: 'Lower predictive power; cannot capture non-linear interactions',
      },
      {
        id: 'ap3',
        name: 'Rules-based tiering with ML escalation',
        description: 'Deterministic rules auto-approve clear low-risk and auto-decline clear high-risk cases. ML model only for borderline applicants.',
        pros: 'Very high confidence for auto-decided tiers; reduces ML regulatory surface area',
        cons: 'Rules need manual maintenance; still needs ML for borderline; harder to optimise dynamically',
      },
      {
        id: 'ap4',
        name: 'Neural network with attention-based explanation',
        description: 'Deep learning model on full application history with attention mechanisms highlighting influential features.',
        pros: 'Potentially highest accuracy; captures complex interactions',
        cons: 'Hardest to explain to regulators; over-parameterised for tabular data; likely rejected by FINMA without extensive documentation',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap1',
    customQuestions: [],
    perApproach: {
      'ap1': {
        dataVolume:
          '1.2M historical loan applications spanning 10 years, stored in CSV exports from Temenos T24. Each record: repayment outcome (label), quarterly credit bureau snapshots, application fields, and economic indicators.',
        dataLabels: 'yes',
        syntheticNote:
          'Class imbalance: ~4.2% default rate. Apply SMOTE for training balance. CTGAN for privacy-preserving augmentation if demographic data must be anonymised.',
        computeBudget:
          'AWS SageMaker GPU instances — CHF 5k training budget approved. Inference via containerised REST endpoint on existing AWS infrastructure.',
        modelingStack:
          'Python: scikit-learn, XGBoost, SHAP, imbalanced-learn. Model registry: MLflow. Deployment: FastAPI on AWS ECS. Monitoring: Evidently AI.',
        regulations: [
          { id: 'reg1', name: 'EU AI Act', articles: 'Credit-worthiness evaluation is high-risk (Annex III). Requirements: risk management (Art. 9), data governance (Art. 10), technical documentation (Art. 11), human oversight (Art. 14), post-market monitoring (Art. 72).' },
          { id: 'reg2', name: 'GDPR', articles: 'Art. 22: Data subjects have the right to human intervention, to express their view, and to contest automated decisions. Meaningful information about the logic must be provided.' },
          { id: 'reg3', name: 'FINMA', articles: 'Model outputs must be understandable to decision-makers. Re-training and data source changes must be documented. Human review must be available on request.' },
          { id: 'reg4', name: 'revFADP', articles: 'Lawful, proportionate data processing required. Automated credit decisions must be disclosed. Affected persons have the right to request human review.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      'ap2': {
        dataVolume: 'Same 1.2M historical records, but only uses scorecard features already in T24. No external bureau data needed beyond the existing integration.',
        dataLabels: 'yes',
        syntheticNote: 'Class imbalance applies. Standard oversampling sufficient — no synthetic generation needed.',
        computeBudget: 'Runs on standard CPU server. No GPU required. Negligible infrastructure cost.',
        modelingStack: 'Python: scikit-learn (LogisticRegression). Coefficients exported to Excel for regulator review.',
        regulations: [
          { id: 'reg2b', name: 'GDPR', articles: 'Art. 22 still applies — automated credit decision. Coefficients serve as the explanation mechanism.' },
          { id: 'reg3b', name: 'FINMA', articles: 'Fully transparent coefficient-based model. Easiest approval path — regulators can inspect the exact formula.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      'ap3': {
        dataVolume: 'No historical ML training data needed. Rules defined manually from existing scorecard thresholds.',
        dataLabels: 'no',
        syntheticNote: 'Not applicable — rule-based system.',
        computeBudget: 'Runs in the existing T24 core banking system as a decision table. No separate infrastructure.',
        modelingStack: 'Business rules engine within T24. No external ML tooling.',
        regulations: [
          { id: 'reg3c', name: 'FINMA', articles: 'Fully auditable rule set. Easiest possible regulatory path — the entire logic is a readable decision table.' },
        ],
        sieveAnswers: { 'sq-1': true, 'sq-2': false, 'sq-3': false },
        sieveDecision: 'non-ai',
        sieveBaseline: false,
      },
      'ap4': {
        dataVolume: 'Same 1.2M records required, but neural network benefits from even more data. Feature engineering less critical.',
        dataLabels: 'yes',
        syntheticNote: 'Class imbalance requires oversampling. Larger model means more risk of overfitting on minority class.',
        computeBudget: 'GPU cluster required for training. Inference latency higher than XGBoost — may exceed the 5-second SLA.',
        modelingStack: 'PyTorch, Transformers. Attention-based explanation (not SHAP-compatible out of the box). Extensive documentation needed.',
        regulations: [
          { id: 'reg1d', name: 'EU AI Act', articles: 'High-risk. Neural network attention maps are unlikely to satisfy FINMA explainability requirements without significant additional work. Art. 11 technical documentation burden is highest.' },
          { id: 'reg2d', name: 'GDPR', articles: 'Art. 22 — meaningful explanation required. Attention weights are not human-interpretable in the way SHAP feature attributions are.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
    },
  },

  spec: {
    clientName: 'SwissCredit Bank AG',
    timeline: '22 weeks',
    executiveSummary:
      'SwissCredit Bank AG processes 50,000 personal loan applications monthly. The current 3–5 day manual process causes a 35% applicant drop-off and erodes market share to digital-native lenders. Evolving regulation under the EU AI Act, GDPR, and FINMA requires transparency, fairness, and human oversight for any AI-driven credit decision.\n\nWe propose an XGBoost-based credit risk scoring pipeline trained on 10 years of labelled data, with SHAP explanations for every decision. The system auto-decides straightforward applications in under 30 seconds and routes borderline cases to loan officers with a risk summary.',
    solutionComponents:
      'Credit Risk Scoring Pipeline — feature engineering on 1.2M records; XGBoost with SMOTE; AUC-ROC target ≥ 0.80\nLogistic Regression Baseline — interpretable reference model for regulatory comparison\nSHAP Explanation Layer — per-decision feature attribution satisfying GDPR Art. 22 and FINMA requirements\nFairness & Bias Audit — demographic parity and equalised odds; threshold optimisation per protected attribute\nREST API — FastAPI endpoint returning risk tier, confidence, explanation, and human-review flag; < 5 second latency\nDrift Monitoring — Evidently AI; automatic alert when prediction distribution shifts',
  },
}
