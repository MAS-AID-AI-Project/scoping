import type { TeamState } from './types'

export const PREFILLED_LOAN: TeamState = {
  problemId: 'loan',
  customTitle: '',
  customContext: '',
  customSituation: '',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'SwissCredit Bank AG takes 3–5 business days to assess personal loan applications, causing a 35% drop-off among qualified applicants and losing market share to digital lenders who decide in under 2 hours. The manual scorecard-based process is slow, inconsistent across loan officers, and fails to exploit the predictive signal in 10 years of historical repayment data.',
    rootCause:
      'Loan officers rely on a fixed-field scorecard and individual judgement. Borderline cases escalate to a credit committee, adding 2 further days. There is no systematic mechanism to learn from the 1.2M historical application records already held by the bank.',
    affectedUsers:
      'Retail banking customers applying for personal loans; loan officers handling 40–60 applications per week',
    currentProcess:
      'Applicant submits via branch or online portal → loan officer scores against scorecard + credit bureau report → borderline cases go to credit committee (adds 2 business days) → decision letter sent. Average end-to-end: 3–5 business days. Current 4.2% 30-day default rate.',
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
      'Top 3 contributing factors (for GDPR Art. 22 compliance)',
      'Human-review flag if confidence < threshold',
    ],
    constraints:
      'Decision latency < 5 seconds for automated tier. All processing within EU jurisdiction. Model must be interpretable to a non-technical loan officer. Must integrate with existing Temenos T24 core banking API.',
    approaches: [
      {
        id: 'ap1',
        name: 'Gradient Boosted Trees (XGBoost) + SHAP explanations',
        description: 'Train XGBoost on 10 years of labelled data. SHAP values produce per-decision feature attributions for regulatory explainability.',
        inputTypes: 'Tabular: ~40 features per application — scorecard fields, credit bureau snapshot, bank relationship data, economic indicators.',
        outputTypes: 'Risk tier (Low/Medium/High) + confidence score (0–100) + SHAP feature attributions for top 3 contributing factors.',
        pros: 'Strong AUC on tabular data; SHAP provides legally-defensible explanations; fast inference; well-understood in financial risk',
        cons: 'Requires careful handling of class imbalance; retraining needed as macroeconomic conditions shift; still needs fairness/bias audit',
      },
      {
        id: 'ap2',
        name: 'Logistic Regression with feature engineering',
        description: 'Engineer features from raw application and bureau data, then train a logistic regression. Coefficients directly interpretable by regulators.',
        inputTypes: 'Tabular: same features as XGBoost but with manual polynomial and interaction terms engineered to capture non-linear effects.',
        outputTypes: 'Default probability (0–1) with linear coefficient explanation. Coefficients exportable to Excel for regulator review.',
        pros: 'Fully transparent; easiest regulatory approval path; no black-box concerns; coefficient interpretation is intuitive for auditors',
        cons: 'Lower predictive power; cannot capture complex non-linear interactions without extensive feature engineering',
      },
      {
        id: 'ap3',
        name: 'Rules-based tiering with ML escalation',
        description: 'Deterministic rules auto-approve clear low-risk and auto-decline clear high-risk cases. ML model only for borderline applicants.',
        inputTypes: 'Stage 1 (rules): key scorecard fields. Stage 2 (ML): full feature set for borderline cases only.',
        outputTypes: 'Stage 1: binary auto-approve / auto-decline / escalate. Stage 2: ML risk score for escalated cases only.',
        pros: 'Very high confidence for auto-decided tiers; reduces ML regulatory surface area; clear audit trail',
        cons: 'Rules need manual maintenance; still needs ML for borderline; harder to optimise dynamically',
      },
      {
        id: 'ap4',
        name: 'Neural network with attention-based explanation',
        description: 'Deep learning model on full application history with attention mechanisms highlighting influential features.',
        inputTypes: 'Tabular + optional sequential history of prior products. Embedding layers for categorical variables.',
        outputTypes: 'Default probability + attention weights highlighting influential input fields.',
        pros: 'Potentially highest accuracy; captures complex interactions and sequential product relationships',
        cons: 'Hardest to explain to regulators; over-parameterised for tabular data; likely rejected by FINMA without extensive documentation',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap1',
    customQuestions: [],
    perApproach: {
      'ap1': {
        dataSources: 'Core banking system (Temenos T24): CSV exports of 10 years of loan applications. Credit bureau: quarterly snapshot files for each application. Bank CRM: relationship duration and product holdings.',
        dataVolume: '1.2M historical loan applications spanning 10 years. Each record: repayment outcome (label), quarterly credit bureau snapshots, application fields, and economic indicators.',
        dataLabels: 'yes',
        dataQuality: 'Class imbalance: ~4.2% default rate. Apply SMOTE for training balance. CTGAN for privacy-preserving augmentation if demographic data must be anonymised. Economic vintage effects: 2015–2017 applications may reflect different macro conditions.',
        dataAccess: 'Internal banking data — processing within EU required. EU AI Act high-risk classification mandates careful data governance documentation. No external cloud processing for PII-containing loan records.',
        computeBudget: 'AWS SageMaker GPU instances — CHF 5k training budget approved. Inference via containerised REST endpoint on existing AWS infrastructure.',
        modelingStack: 'Python: scikit-learn, XGBoost, SHAP, imbalanced-learn. Model registry: MLflow. Deployment: FastAPI on AWS ECS. Monitoring: Evidently AI.',
        regulations: [
          { id: 'reg1', name: 'EU AI Act', articles: 'Classification — credit-worthiness evaluation is high-risk (Annex III). Training and deployment require: risk management system, data governance documentation, technical documentation, human oversight mechanism, post-market monitoring.' },
          { id: 'reg2', name: 'GDPR', articles: 'Inference — applicants have the right to human review, to contest automated decisions, and to receive a meaningful explanation of the logic. SHAP attributions must be presented in plain language.' },
          { id: 'reg3', name: 'FINMA', articles: 'Model outputs must be understandable to decision-makers. Re-training and data source changes must be documented. Human review must be available on request from any applicant.' },
          { id: 'reg4', name: 'revFADP', articles: 'Automated credit decisions must be disclosed. Affected persons have the right to request human review. Lawful, proportionate data processing required.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      'ap2': {
        dataSources: 'Same T24 exports, but only uses scorecard features already in the core banking system. No external bureau data needed beyond the existing integration.',
        dataVolume: 'Same 1.2M historical records, but only ~15 scorecard features used. Feature engineering adds polynomial and interaction terms.',
        dataLabels: 'yes',
        dataQuality: 'Class imbalance applies. Standard oversampling sufficient — no synthetic generation needed. Polynomial feature expansion can create multicollinearity — need regularisation (L1/L2).',
        dataAccess: 'Same constraints as XGBoost. Simpler feature set reduces documentation burden slightly.',
        computeBudget: 'Runs on standard CPU server. No GPU required. Negligible infrastructure cost.',
        modelingStack: 'Python: scikit-learn (LogisticRegression with regularisation). Coefficients exported to Excel for regulator review.',
        regulations: [
          { id: 'reg2b', name: 'GDPR', articles: 'Same Art. 22 obligations as XGBoost — automated credit decision. Coefficients serve as the explanation mechanism and must be presented in plain language.' },
          { id: 'reg3b', name: 'FINMA', articles: 'Fully transparent coefficient-based model. Easiest regulatory approval path — regulators can inspect the exact formula. No black-box concerns.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      'ap3': {
        dataSources: 'Stage 1 (rules): manually defined from existing scorecard thresholds — no new data needed. Stage 2 (ML): same T24 data as XGBoost, but only for the borderline subset.',
        dataVolume: 'Borderline applicants estimated at ~20% of total volume (~240k cases over 10 years). ML training only on this subset.',
        dataLabels: 'no',
        dataQuality: 'Rule thresholds defined by credit experts — no ML training data for Stage 1. Stage 2 ML data quality same as XGBoost but on a filtered subset which may reduce generalisation.',
        dataAccess: 'Stage 1 rules run within T24. Stage 2 ML has same access constraints as XGBoost but on a reduced data scope.',
        computeBudget: 'Stage 1: runs within T24 — zero new infrastructure. Stage 2 ML: same as XGBoost but smaller dataset, lower cost.',
        modelingStack: 'Stage 1: business rules engine within T24. Stage 2: XGBoost or logistic regression for borderline tier.',
        regulations: [
          { id: 'reg3c', name: 'FINMA', articles: 'Stage 1 is fully auditable — the entire rule set is a readable decision table. Stage 2 has a reduced ML regulatory surface area since it only covers borderline cases.' },
          { id: 'reg2c', name: 'GDPR', articles: 'Art. 22 applies to Stage 2 ML decisions. Stage 1 rule decisions are fully explainable by design.' },
        ],
        sieveAnswers: { 'sq-1': true, 'sq-2': false, 'sq-3': false },
        sieveDecision: 'non-ai',
        sieveBaseline: false,
      },
      'ap4': {
        dataSources: 'Same 1.2M T24 records, but neural network benefits from even more data and richer features. Embedding layers require categorical encoding infrastructure.',
        dataVolume: 'Same 1.2M records required. Neural network benefits from larger datasets — may want to add external data sources to increase volume and diversity.',
        dataLabels: 'yes',
        dataQuality: 'Class imbalance requires oversampling. Larger model means more risk of overfitting on minority class. Embedding layers need consistent category vocabularies over time.',
        dataAccess: 'Same constraints as XGBoost. GPU training infrastructure adds complexity.',
        computeBudget: 'GPU cluster required for training. Inference latency higher than XGBoost — may exceed the 5-second SLA for complex models.',
        modelingStack: 'PyTorch, Transformers. Attention-based explanation (not SHAP-compatible out of the box). Extensive documentation needed for regulatory submission.',
        regulations: [
          { id: 'reg1d', name: 'EU AI Act', articles: 'High-risk (same Annex III classification). Neural network attention maps are unlikely to satisfy FINMA explainability requirements without significant additional work. Highest technical documentation burden.' },
          { id: 'reg2d', name: 'GDPR', articles: 'Art. 22 — meaningful explanation required. Attention weights are not human-interpretable in the way SHAP feature attributions are. Plain-language explanation layer would need significant additional engineering.' },
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
    expectedDataAvailability:
      '1.2M historical loan applications available as CSV exports from Temenos T24. Data extract expected within 3 weeks of project start, pending data governance sign-off from Legal.\nCredit bureau snapshot files available via existing API integration — historical snapshots need to be joined to application records by IT.\nKnown gaps: some older records (pre-2016) missing external economic indicator data. Demographic data must be anonymised before use in training per GDPR and FINMA guidance.',
    expectedComputeUsage:
      'Training: AWS SageMaker GPU instances (CHF 5k approved budget). Estimated training time 2–4 hours per XGBoost run. Retraining cadence: quarterly or when macroeconomic conditions shift significantly.\nInference: containerised REST endpoint on existing AWS ECS infrastructure. Target latency < 5 seconds per decision at peak load (50,000 applications/month = ~1,700/day). Inference cost estimated at CHF 200/month.\nMonitoring: Evidently AI for data and prediction drift; weekly automated report to CRO.',
    solutionComponents:
      'Credit Risk Scoring Pipeline — feature engineering on 1.2M records; XGBoost with SMOTE; AUC-ROC target ≥ 0.80\nLogistic Regression Baseline — interpretable reference model for regulatory comparison\nSHAP Explanation Layer — per-decision feature attribution satisfying GDPR Art. 22 and FINMA requirements\nFairness & Bias Audit — demographic parity and equalised odds; threshold optimisation per protected attribute\nREST API — FastAPI endpoint returning risk tier, confidence, explanation, and human-review flag; < 5 second latency\nDrift Monitoring — Evidently AI; automatic alert when prediction distribution shifts',
  },
}
