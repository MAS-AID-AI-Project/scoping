import type { TeamState } from './types'

export const PREFILLED_SERVICES: TeamState = {
  problemId: 'services',
  customTitle: '',
  customContext: '',
  customSituation: '',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'Claros Analytics\' annual client churn rate has risen from 8% to 12% over two years, representing approximately CHF 5M in lost ARR annually (~384 churned enterprise clients at an average contract value of CHF 13,100). Post-cancellation interviews consistently show that warning signs of disengagement were visible in product usage data 6–8 weeks before renewal — but the Customer Success team, managing ~110 accounts per person, had no systematic way to identify which accounts were at risk in time to intervene.',
    rootCause:
      'There is no data-driven model to predict client churn. CS managers prioritise accounts based on personal relationships, incoming support tickets, and periodic NPS surveys — none of which systematically surface quietly disengaging clients. By the time a client signals disengagement explicitly (cancels a renewal call, stops responding), the decision to churn is typically already made.',
    affectedUsers:
      'Claros Analytics CS team (28 people); account executives (35 people, responsible for renewals); 3,200 enterprise clients (indirectly)',
    currentProcess:
      'Quarterly NPS surveys sent to clients → CS managers review responses and flag low scores → account executives flag relationships they perceive as at risk → CS conducts reactive outreach only after a concern surfaces. No proactive signal exists between survey cycles. Post-cancellation interviews reveal that 70%+ of churned clients had declining login frequency and feature usage for 6–8 weeks before renewal — data that sat unused in Snowflake.',
    stakeholders: [
      { id: 'sh1', role: 'VP of Customer Success', concerns: 'Net revenue retention, CS team capacity, false positive outreach diluting CS relationships', metrics: 'Churn rate reduced from 12% to ≤ 8%, CS time saved on manual account reviews ≥ 25%, at-risk account identification ≥ 6 weeks before renewal' },
      { id: 'sh2', role: 'Account Executives', concerns: 'Accurate risk signals so they can prioritise renewal conversations, avoiding unnecessary outreach to healthy accounts', metrics: 'Precision of high-risk flag ≥ 60%, renewal conversion rate for flagged accounts ≥ 50%' },
      { id: 'sh3', role: 'Head of Product', concerns: 'Understanding which feature gaps or usage patterns predict churn, to inform roadmap prioritisation', metrics: 'Top 5 churn-predictive feature gaps identified per model run, actionable product insights delivered quarterly' },
      { id: 'sh4', role: 'Data Engineering Team', concerns: 'Pipeline reliability, Snowflake compute costs, data freshness for scoring', metrics: 'Churn scores refreshed weekly with < 4-hour data lag; Snowflake compute cost increase < CHF 500/month' },
    ],
  },

  metrics: {
    objectives: [
      'Identify at-risk enterprise accounts at least 6 weeks before their renewal date, giving CS enough time to intervene',
      'Prioritise CS outreach to the highest-risk accounts — not all 3,200, but the right 200–300',
      'Achieve precision ≥ 60% in the high-risk tier (majority of flagged accounts genuinely at risk)',
      'Reduce annual churn rate from 12% back to ≤ 8%',
    ],
    primaryMetric: 'Recall for churned clients in the top-20% risk score tier at 6-week pre-renewal (target: ≥ 75% of eventual churners flagged)',
    secondaryMetrics: [
      'Precision in the high-risk tier (target: ≥ 60% of flagged accounts genuinely churn within 90 days)',
      'Average days from first high-risk flag to renewal date (target: ≥ 42 days / 6 weeks)',
      'Churn rate 6 months post-deployment (target: ≤ 8%)',
    ],
    baselines: [
      { id: 'bl1', approach: 'Current process (reactive NPS-based outreach)', performance: 'NPS predicts ~40% of churned accounts; median detection 2–3 weeks before renewal — too late for effective intervention', target: '≥ 75% of churners flagged at ≥ 6 weeks before renewal' },
      { id: 'bl2', approach: 'Login frequency threshold rule (< 2 logins/week = at-risk)', performance: 'Precision ~30% (high false positive rate); recall ~55%; no lead-time optimisation', target: 'Improve precision to ≥ 60% while maintaining recall ≥ 75%' },
    ],
  },

  solutionSpace: {
    inputs: [
      'Login frequency — daily/weekly/monthly active users per account (last 90 days)',
      'Feature adoption breadth — number of distinct dashboard features used per account',
      'Report generation counts — total reports created, exported, and shared in last 30 days',
      'Support ticket volume and severity — number open, median resolution time',
      'NPS score — most recent survey response (where available)',
      'Contract metadata — ARR, contract length, industry vertical, region, days to renewal',
    ],
    outputs: [
      'Churn probability score per account (0–1)',
      'Risk tier — High / Medium / Low',
      'Top 3 engagement risk factors (for CS outreach context)',
      'Recommended CS action — Urgent call / Schedule check-in / Monitor / Healthy',
    ],
    constraints:
      'Scores refreshed weekly (Snowflake batch job). Must integrate with Salesforce CS dashboard via existing API. No client data to be shared externally. Snowflake compute cost increase < CHF 500/month.',
    approaches: [
      {
        id: 'ap1',
        name: 'Engagement threshold rules',
        description: 'Trigger at-risk flag when a client crosses configurable thresholds on two or more signals simultaneously (e.g. login frequency < 2/week AND no new reports in 30 days AND NPS < 7). No ML component.',
        inputTypes: 'Current-state snapshot per account: login frequency (7-day avg), report count (30-day total), NPS score (latest). Static SQL query in Snowflake.',
        outputTypes: 'Binary at-risk flag (1/0). No probability estimate, no ranking within flagged accounts.',
        pros: 'Fully transparent to CS team; zero model governance overhead; immediate to deploy; easy to adjust thresholds based on CS feedback',
        cons: 'Threshold calibration is manual and subjective; no ranking within flagged accounts; cannot capture complex interaction patterns; clients with naturally low usage (executive-only logins) may be chronically flagged',
      },
      {
        id: 'ap2',
        name: 'XGBoost churn propensity model',
        description: 'Train XGBoost on 2 years of client behavioral data, with churn outcome at annual contract renewal as the label. Score all active accounts weekly. Use SHAP for per-account risk factor explanation.',
        inputTypes: 'Tabular feature vector per account per week: ~45 features including rolling 30/60/90-day engagement statistics, NPS trends, support patterns, contract metadata.',
        outputTypes: 'Churn probability (0–1) + risk tier + SHAP values for top 3 risk factors per account per week.',
        pros: 'Strong recall/precision on tabular SaaS churn data; SHAP explanations give CS context for outreach conversations; captures non-linear interactions (e.g. low usage + upcoming renewal date); fast batch inference',
        cons: '12% churn rate means class imbalance — needs careful handling; NPS missing for ~35% of accounts; newer clients have sparse training history; model drift if product changes significantly alter usage patterns',
      },
      {
        id: 'ap3',
        name: 'Survival analysis (Cox Proportional Hazards)',
        description: 'Model time-to-churn rather than binary churn/no-churn. Cox PH estimates the hazard rate — how quickly a client is trending toward churn — enabling earlier and more precisely timed outreach.',
        inputTypes: 'Time-structured data: (account_id, time_since_contract_start, churn_event, covariates). Covariates: same engagement features as XGBoost. Survival time is days to renewal/churn.',
        outputTypes: 'Hazard ratio per account (how much faster this account is approaching churn vs the average). Survival curve: probability of staying through renewal date.',
        pros: 'Models timing of churn, not just probability — enables more precise CS scheduling; coefficients are directly interpretable (like logistic regression); handles right-censoring naturally for active clients',
        cons: 'Less familiar to CS and product teams than a simple churn score; assumes proportional hazards (may not hold for accounts that have recently improved engagement); harder to integrate as a weekly score in Salesforce',
      },
      {
        id: 'ap4',
        name: 'LSTM on weekly usage sequences',
        description: 'Deep learning model on weekly feature-level engagement time series per account. Learns patterns of usage decay or recovery over the full contract lifetime.',
        inputTypes: 'Multivariate time series: shape (accounts × 52 weeks × 25 weekly usage features). Padded for accounts with < 52 weeks of history.',
        outputTypes: 'Churn probability (0–1) per account per week. Attention weights for approximate feature attribution.',
        pros: 'Captures temporal usage decay patterns over the full contract year; no manual feature engineering needed; can detect complex decay trajectories that XGBoost snapshot features miss',
        cons: '3,200 clients is a small dataset for deep learning — high risk of overfitting; GPU required for training; attention weights harder to explain to CS than SHAP; data sparsity for new accounts (<6 months) means poor predictions for a large portion of the portfolio',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap2',
    customQuestions: [],
    perApproach: {
      'ap1': {
        dataSources: 'Snowflake data warehouse — client login events, feature usage logs, report generation events, NPS survey responses. Accessed via SQL query.',
        dataVolume: 'Current-state snapshot for all 3,200 active accounts. No historical training data needed.',
        dataLabels: 'no',
        dataQuality: 'Threshold values must be calibrated manually from historical data analysis. NPS missing for ~35% of accounts — need to handle gracefully (e.g. flag based on usage alone if NPS unavailable). Some clients have naturally low usage due to their product tier.',
        dataAccess: 'Standard internal Snowflake access. Lowest compliance and access overhead. No additional approvals needed — CS team already has read access to these metrics.',
        computeBudget: 'Runs as a scheduled SQL query on existing Snowflake compute. Estimated cost increase < CHF 50/month. No ML infrastructure required.',
        modelingStack: 'SQL + dbt for data transformation. Results piped to Salesforce via existing integration. No Python or ML framework needed.',
        regulations: [
          { id: 'r1a', name: 'GDPR', articles: 'Data access — client behavioural data processed for internal operational purposes (net revenue retention). Legitimate interest basis applies. No automated decision-making affecting clients (internal CS prioritisation only).' },
          { id: 'r1b', name: 'SOC 2', articles: 'Data access — any new data queries on client behavioral data must be logged under existing SOC 2 access controls. No new data processing agreement needed.' },
        ],
        sieveAnswers: { 'sq-1': true, 'sq-2': false, 'sq-3': false },
        sieveDecision: 'non-ai',
        sieveBaseline: false,
      },
      'ap2': {
        dataSources: 'Snowflake: (1) product usage event log — login events, feature interactions, report generations (nightly ETL); (2) support ticketing system — ticket volume, severity, resolution time; (3) NPS survey database — quarterly responses; (4) CRM (Salesforce) — contract ARR, renewal dates, industry, region.',
        dataVolume: '3,200 clients × 24 months = ~76,800 client-month records for training. Feature engineering: rolling 30/60/90-day statistics computed per client per week. ~12% churn rate → ~384 churned clients in the training period.',
        dataLabels: 'yes',
        dataQuality: 'Class imbalance: ~12% churn — apply SMOTE or class-weighted training. NPS missing for ~35% of clients — impute with median or create missingness indicator feature. Clients with < 3 months of data excluded from training (insufficient history). Feature drift risk: product feature set has changed over 2 years — usage metrics for deprecated features need handling.',
        dataAccess: 'Client behavioral data is commercially sensitive. Access restricted to CS, Data Engineering, and Head of Product. Processing within internal infrastructure (Snowflake + internal compute). Client names and usage data are not shared externally. GDPR legitimate interest basis documented.',
        computeBudget: 'Training: standard cloud CPU instance (AWS EC2 t3.medium). Estimated training time < 30 minutes per weekly run. Inference: batch scoring of 3,200 accounts in Snowflake Python UDF takes < 2 minutes. Snowflake compute cost increase estimated < CHF 200/month.',
        modelingStack: 'Python: scikit-learn, XGBoost, SHAP, imbalanced-learn. Batch scoring via Snowflake Python UDF or Airflow DAG. Feature engineering in dbt. Results written to Salesforce CS dashboard via existing API integration.',
        regulations: [
          { id: 'r2a', name: 'GDPR', articles: 'Data processing — client engagement data processed for legitimate interest (customer retention). No automated decisions affecting clients directly. Internal CS prioritisation tool only. Data minimisation: only features relevant to churn prediction retained. Retention policy for model training data must be defined.' },
          { id: 'r2b', name: 'SOC 2', articles: 'Data access — new ML pipeline accessing client behavioral data must be logged and access-controlled per existing SOC 2 requirements. Model training runs must be auditable. Client data must not leave the approved processing environment.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      'ap3': {
        dataSources: 'Same Snowflake sources as XGBoost. Survival analysis requires time-structured data: (account_id, time_since_contract_start_days, churned_boolean, covariates). Right-censoring for active accounts.',
        dataVolume: 'Same 3,200 clients. Survival models work well with smaller datasets but require careful censoring handling for active clients still within their contract term.',
        dataLabels: 'yes',
        dataQuality: 'Right-censoring: active clients who have not yet churned must be handled correctly. Contract lengths vary (1–3 years) — normalising survival time across different contract lengths adds complexity. NPS missingness same as XGBoost.',
        dataAccess: 'Same as XGBoost.',
        computeBudget: 'CPU-only. Python lifelines or scikit-survival libraries. Very lightweight — no ensemble training. Well-suited to Snowflake Python UDF execution.',
        modelingStack: 'Python: lifelines (CoxPHFitter) or scikit-survival. More statistical than ML — coefficients interpretable directly. Harder to surface as a weekly score in Salesforce.',
        regulations: [
          { id: 'r3a', name: 'GDPR', articles: 'Same legitimate interest basis as XGBoost. Survival coefficients are statistically interpretable — arguably lower explainability burden than black-box ensemble.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      'ap4': {
        dataSources: 'Same Snowflake sources, but requires weekly feature-level granularity per client (25 usage features per week per account). More granular than XGBoost snapshot features.',
        dataVolume: '3,200 clients × 52 weeks × 25 features ≈ 4.2M weekly feature records. LSTM input tensors: shape (3,200 × 52 × 25). Total: ~83M data points.',
        dataLabels: 'yes',
        dataQuality: 'Very sparse for newer clients (< 6 months of history requires padding or exclusion). LSTM requires consistent sequence length — variable-length handling adds complexity. 3,200 clients is a small dataset for deep learning generalisation — high risk of overfitting.',
        dataAccess: 'Same as XGBoost. Sequence data is more memory-intensive but same access controls apply.',
        computeBudget: 'GPU recommended for training (T4 or similar on AWS). Batch inference on 3,200 accounts: ~5 seconds on GPU. Higher infrastructure cost than XGBoost for marginal accuracy gain on this dataset size.',
        modelingStack: 'Python: PyTorch or Keras. LSTM with attention. More complex engineering. Attention weights provide approximate but less clean explanation than SHAP for CS use.',
        regulations: [
          { id: 'r4a', name: 'GDPR', articles: 'Same legitimate interest basis as XGBoost. Attention-based explanations less interpretable — harder to document data minimisation and proportionality of processing.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
    },
  },

  spec: {
    clientName: 'Claros Analytics',
    timeline: '16 weeks',
    executiveSummary:
      'Claros Analytics has seen its enterprise client churn rate rise from 8% to 12% over two years, representing ~CHF 5M in lost ARR annually. Post-cancellation interviews consistently reveal that disengagement signals were present in product usage data 6–8 weeks before renewal — but the CS team had no systematic way to identify them across 3,200 accounts. The team cannot proactively outreach to all clients; they need to know which ones are at risk.\n\nWe propose an XGBoost churn propensity model trained on 2 years of Snowflake behavioral data, scored weekly for all active accounts. SHAP-based risk factors are surfaced in the Salesforce CS dashboard so each account manager receives a prioritised list and context for their outreach conversations. A threshold-based rule system is included as the interpretable baseline.',
    expectedDataAvailability:
      'Training data: 2 years of client behavioral data accessible from Snowflake via existing Data Engineering pipelines. Data extract and feature engineering expected within 2 weeks of project start.\nChurn labels: historical renewal outcomes (churned/renewed) available from Salesforce CRM records. ~384 churned clients in the 2-year training window.\nKnown gaps: NPS data missing for ~35% of accounts (not all clients respond to surveys) — handled via missingness indicator feature. Clients with < 3 months of history (~200 accounts) excluded from training due to insufficient signal. Usage metrics for features deprecated in the last 12 months require careful handling.',
    expectedComputeUsage:
      'Training: AWS EC2 t3.medium (CPU-only). Estimated training time < 30 minutes per weekly retraining run. Retraining cadence: weekly, or triggered by significant product changes that alter usage patterns.\nInference: batch scoring of all 3,200 active accounts via Snowflake Python UDF. Runtime < 2 minutes per weekly batch. Marginal Snowflake compute cost increase estimated at < CHF 200/month.\nFeature engineering: dbt models compute rolling 30/60/90-day statistics nightly. Feature pipeline adds ~15 minutes to existing Snowflake nightly ETL runtime.',
    solutionComponents:
      'Feature Engineering Pipeline — rolling 30/60/90-day engagement statistics per account computed nightly in dbt; includes NPS trends, support patterns, contract proximity features\nXGBoost Churn Propensity Model — trained on 2 years of client-month records; class-weighted for 12% churn rate; recall target ≥ 75% for churners at 6-week pre-renewal\nEngagement Threshold Baseline — rule-based at-risk flag as CS-interpretable reference and model comparison benchmark\nSHAP Explanation Layer — top-3 risk factors per account surfaced alongside churn probability in Salesforce dashboard\nSalesforce Integration — weekly churn scores and risk factors written to Salesforce Account object via existing API; CS priority queue automatically re-sorted\nDrift Monitoring — weekly comparison of feature distributions and prediction score distribution vs training baseline; alert to Data Engineering if significant drift detected',
  },
}
