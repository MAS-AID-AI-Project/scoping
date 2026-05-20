import type { TeamState } from './types'

export const PREFILLED_AML: TeamState = {
  problemId: 'finance',
  customTitle: '',
  customContext: '',
  customSituation: '',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'Helvetia Wealth Management\'s Actimize-based AML system generates approximately 400 transaction monitoring alerts per day, of which only ~20 (5%) represent genuine suspicious activity. The 95% false positive rate is causing investigator burnout, declining review quality, and regulatory risk — FINMA expects substantive written analysis behind every alert closure. At current volume, investigators are at capacity and cannot maintain the standard of analysis required. The bank wants to use 2+ years of historical investigator dispositions to intelligently prioritise the alert queue.',
    rootCause:
      'Actimize relies on rigid rule-based scenarios (velocity thresholds, geographic risk flags, amount ceilings) calibrated years ago and not adapted since. There is no mechanism to learn from 2 years of investigator decisions — each alert is scored purely by which rules it triggered, regardless of whether similar patterns have historically always been closed as false positives. Investigators review alerts in a strict first-in, first-out queue, regardless of their risk level.',
    affectedUsers:
      '24 AML investigators (primary users); Head of Financial Crime Compliance (process owner); Chief Compliance Officer (regulatory accountability)',
    currentProcess:
      'Actimize triggers alerts based on rule thresholds → alerts enter a shared queue (FIFO order) → investigator reviews case: reads narrative, checks transaction details, customer risk profile, counterparty information → takes 45–90 minutes per case → 95% are closed with a brief written rationale → ~20/day escalate as Suspicious Activity Reports (SARs).',
    stakeholders: [
      { id: 'sh1', role: 'Head of Financial Crime Compliance', concerns: 'Missing genuine suspicious activity due to investigator fatigue, audit trail quality, FINMA examination readiness', metrics: 'SAR detection rate maintained at ≥ 100% of genuine cases, investigator capacity freed ≥ 30%, review quality score > 4/5 in internal audit' },
      { id: 'sh2', role: 'AML Investigators', concerns: 'Alert fatigue, time spent on obvious false positives, ability to explain prioritisation decisions', metrics: 'Average review time per genuine case (target: < 60 min), false positive alerts reviewed per day (target: < 200)' },
      { id: 'sh3', role: 'Chief Compliance Officer', concerns: 'Regulatory liability, model governance under FINMA, defensibility of any AI-driven prioritisation', metrics: 'Zero missed SARs, all AI prioritisation decisions auditable and documented, FINMA sign-off on methodology' },
      { id: 'sh4', role: 'IT & Data Architecture Team', concerns: 'Integration with Actimize, on-premise processing requirement, data access controls for sensitive compliance data', metrics: 'No alert data processed outside bank network, Actimize webhook integration within 4 weeks, 99.9% scoring uptime' },
    ],
  },

  metrics: {
    objectives: [
      'Route the highest-risk alerts to senior investigators first, so genuine suspicious activity is never missed due to queue overload',
      'Reduce the proportion of obvious false positives reviewed before genuine cases by at least 40%',
      'Maintain or improve the quality of investigator closure notes as measured by internal audit',
      'Provide investigators with clear, auditable reasoning behind each alert\'s priority score',
    ],
    primaryMetric: 'Recall for genuine suspicious activity alerts in the top-priority tier (target: ≥ 95% of true SARs in top 25% of scored queue)',
    secondaryMetrics: [
      'Average position of genuine SAR alerts in the scored queue (target: top 10% on average)',
      'Investigator time savings per day: hours reclaimed from obvious false positives (target: ≥ 2 hours/investigator/day)',
      'Internal audit quality score for alert closure notes (target: maintained ≥ 4/5)',
    ],
    baselines: [
      { id: 'bl1', approach: 'FIFO queue (current state)', performance: 'Genuine alerts distributed randomly across queue; investigators process 95% false positives before reaching genuine cases on average', target: 'Top-priority tier contains ≥ 95% of genuine SARs' },
      { id: 'bl2', approach: 'Actimize built-in risk scoring (rule-based)', performance: 'Static rule scores only; no learning from historical dispositions; false positive rate unchanged at 95%', target: 'ML-based model reduces effective false positive rate in top-priority tier to < 50%' },
    ],
  },

  solutionSpace: {
    inputs: [
      'Actimize alert features — rule(s) triggered, alert type, transaction amount, currency, country of origin/destination',
      'Customer profile — AML risk rating, PEP status, account age, industry, beneficial ownership structure',
      'Transaction context — counterparty type, payment channel, time of day, transaction velocity (7/30/90 day)',
      'Historical alert disposition — prior alerts on this customer: outcome (SAR/false positive), investigator notes',
      'Relationship features — length of banking relationship, prior SARs filed, linked accounts',
    ],
    outputs: [
      'Suspicion score per alert (0–100)',
      'Priority tier — High / Medium / Low',
      'Top 3 risk indicators (for investigator explainability and closure note drafting)',
      'Routing recommendation — Senior investigator / Standard review / Auto-draft closure',
    ],
    constraints:
      'All data must remain on-premise — no alert or client data to external APIs or cloud. Model outputs constitute compliance documentation and must be logged under FINMA record-keeping rules. Investigators must retain full ability to override any score. Scoring must complete within 30 seconds of alert creation in Actimize.',
    approaches: [
      {
        id: 'ap1',
        name: 'Enhanced Actimize rule refinement',
        description: 'Tune existing Actimize scenario thresholds and add customer risk tier and country risk as multipliers. Calibrate manually based on analysis of the last 2 years of false positive patterns. No ML component.',
        inputTypes: 'Actimize rule configuration parameters. Analysis of historical alert data by compliance experts. No training dataset or model needed.',
        outputTypes: 'Revised alert score from Actimize (integer). Same categorical risk tier as today. No per-case explainability beyond which rules fired.',
        pros: 'Fastest to implement; no model governance overhead; familiar to investigators; no regulatory approval needed for rule changes',
        cons: 'Manual calibration is expert-dependent and expensive; risk of also suppressing genuine alerts if thresholds tightened incorrectly; cannot adapt to new money laundering typologies without manual revision',
      },
      {
        id: 'ap2',
        name: 'XGBoost alert prioritisation',
        description: 'Train XGBoost on 2 years of historical alert dispositions. Label: SAR escalated (1) vs closed as false positive (0). Score new alerts on arrival in Actimize via REST webhook.',
        inputTypes: 'Tabular feature vector per alert: ~60 structured features — alert metadata, customer risk profile, transaction context, historical disposition patterns.',
        outputTypes: 'Suspicion probability (0–1) + priority tier (High/Medium/Low) + SHAP values for top 3 risk indicators per alert.',
        pros: 'Strong performance on tabular compliance data; SHAP provides auditable investigator-facing explanations; fast inference (<1 ms per alert); well-understood by compliance and IT teams',
        cons: '5% positive rate (severe class imbalance) requires careful handling; some historical "false positives" may have been genuinely suspicious but closed due to capacity constraints (label noise); model must be re-validated when new money laundering typologies emerge',
      },
      {
        id: 'ap3',
        name: 'Graph-enhanced XGBoost (network features)',
        description: 'Build a transaction network graph (accounts as nodes, transactions as edges). Compute graph centrality and community features per alert. Add to XGBoost feature set to capture complex multi-hop laundering patterns.',
        inputTypes: 'Same tabular features as standard XGBoost, plus: counterparty network centrality, community membership flags, hop distance to known flagged accounts.',
        outputTypes: 'Same as XGBoost — suspicion probability + priority tier + SHAP values (now including network features as explanatory factors).',
        pros: 'Captures complex transaction networks that rule-based systems miss; potentially higher recall for sophisticated layering patterns',
        cons: 'Graph construction from 58M+ transaction edges is computationally intensive; entity resolution (same counterparty across multiple accounts) adds significant engineering complexity; harder to explain network features to investigators unfamiliar with graph concepts',
      },
      {
        id: 'ap4',
        name: 'LLM-based narrative analysis',
        description: 'Use a locally-hosted LLM to analyse the Actimize auto-generated alert narrative text and structured alert fields. Generate a structured suspicion summary and risk score.',
        inputTypes: 'Actimize alert narrative text (~200–500 words per alert) + structured alert features. Input as prompt to on-premise LLM.',
        outputTypes: 'Suspicion summary in plain language + risk score + key risk factors extracted from the narrative text.',
        pros: 'Can surface reasoning from narrative text that structured features miss; output is naturally human-readable for investigator closure notes',
        cons: 'Actimize narratives are auto-generated and formulaic — may not contain genuinely distinguishing information; on-premise LLM requires significant GPU infrastructure; inference at 400 alerts/day feasible but slower (~500 ms/alert); model governance and FINMA approval path unclear',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap2',
    customQuestions: [],
    perApproach: {
      'ap1': {
        dataSources: 'Actimize SAFE scenario configuration files. Historical alert reports for calibration analysis. No ML training dataset required.',
        dataVolume: 'No training dataset needed. Calibration analysis covers ~290,000 historical alerts for threshold optimisation.',
        dataLabels: 'no',
        dataQuality: 'Rule calibration is manual and expert-dependent. Risk: tightening thresholds may suppress genuine alerts. Changes require full regression testing against known SAR cases.',
        dataAccess: 'Actimize configuration is managed by IT FCC team. Changes require FCC Head approval and must be logged in the Actimize change management system for FINMA audit trail.',
        computeBudget: 'Zero additional compute infrastructure. All changes made within the Actimize administration console.',
        modelingStack: 'Actimize SAFE scenario management interface. No ML framework needed.',
        regulations: [
          { id: 'r1a', name: 'FINMA', articles: 'Rule changes to AML screening systems must be documented and auditable. Any change to threshold values must be justified in writing and approved by the Head of FCC. FINMA may inspect rule change logs.' },
          { id: 'r1b', name: 'EU AML Directives', articles: 'Screening systems must be calibrated to detect known typologies. Threshold changes that reduce detection capability must be risk-assessed and documented. No regulatory approval needed for configuration changes.' },
        ],
        sieveAnswers: { 'sq-1': true, 'sq-2': false, 'sq-3': false },
        sieveDecision: 'non-ai',
        sieveBaseline: false,
      },
      'ap2': {
        dataSources: 'Actimize alert history database: 2 years of alert records with investigator disposition (SAR filed vs false positive closed). Transaction data warehouse (T24): counterparty details, amounts, geographies. Customer risk rating system: AML risk tiers, PEP flags, beneficial ownership records.',
        dataVolume: '2 years × ~400 alerts/day × 365 = ~292,000 historical alerts. Each alert: ~60 structured features. Label: binary (SAR escalated = 1, false positive = 0). ~5% positive rate.',
        dataLabels: 'yes',
        dataQuality: 'Severe class imbalance: 95% false positive / 5% genuine — apply SMOTE or class-weighted training. Label noise: some "false positives" were genuinely suspicious but closed due to investigator capacity constraints (estimated 10–15% label noise in negative class). 12% of historical alerts have incomplete customer risk data.',
        dataAccess: 'Highly sensitive compliance data. AML alert records are classified and access restricted to FCC and senior IT. All processing must be on-premise. Model outputs constitute compliance documentation and must be retained under FINMA record-keeping rules (minimum 10 years).',
        computeBudget: 'Lightweight tabular model — CPU-only training on existing compliance server. No GPU required. Inference per alert < 1 ms. At 400 alerts/day, batch scoring adds negligible load.',
        modelingStack: 'Python: scikit-learn, XGBoost, SHAP, imbalanced-learn. Alert scoring integrated into Actimize via REST webhook. Model registry: MLflow. Explainability: SHAP for top 3 risk factors per alert displayed in investigator interface.',
        regulations: [
          { id: 'r2a', name: 'FINMA', articles: 'Governance — any AI-based tool affecting AML alert triage requires documented model governance (validation, testing, approval). Training data — historical dispositions used to train must be auditable. Inference — investigators must retain ability to override any AI score. FINMA may inspect model documentation during examination.' },
          { id: 'r2b', name: 'EU AML Directives (AMLD5/6)', articles: 'Detection capability — the prioritisation system must not reduce the bank\'s ability to detect genuine suspicious activity. Audit trail — AI-generated scores must be logged alongside investigator decisions for regulatory audit. Human oversight — AI scores are advisory only; investigators make the final determination.' },
          { id: 'r2c', name: 'GDPR', articles: 'Data use — customer transaction data and risk profiles are personal data. Processing for AML purposes has a legal basis under GDPR (legal obligation), but data must not be repurposed beyond AML compliance. Model training on historical records must comply with data retention and purpose limitation principles.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      'ap3': {
        dataSources: 'Same Actimize and T24 sources as XGBoost, plus: full transaction network graph built from T24 transaction history. Nodes = bank accounts and counterparties. Edges = individual transactions. Requires a separate graph construction and feature extraction pipeline.',
        dataVolume: 'Alert data: same 292,000 records. Graph data: ~80,000 transactions/day × 2 years = ~58M transaction edges for graph construction. Graph feature extraction is computationally intensive.',
        dataLabels: 'yes',
        dataQuality: 'Graph construction requires entity resolution (same counterparty across multiple accounts). Correspondent banking relationships add network complexity. Graph features add ~30 additional engineered features per alert. Data quality of counterparty identifiers affects graph accuracy.',
        dataAccess: 'Same restrictions as XGBoost. Transaction network data is especially sensitive — revealing client relationships. Separate data access approval from Legal may be needed for graph analysis of counterparty networks.',
        computeBudget: 'Graph construction and feature extraction from 58M edges are memory-intensive — requires dedicated graph processing server or large-RAM instance. XGBoost training itself remains lightweight. Total infrastructure cost significantly higher than plain XGBoost.',
        modelingStack: 'Python: NetworkX or DGL for graph construction, scikit-learn, XGBoost, SHAP. Graph feature extraction pipeline adds 4–6 weeks of additional engineering effort.',
        regulations: [
          { id: 'r3a', name: 'FINMA', articles: 'Same model governance requirements as XGBoost. Graph features add complexity to model documentation — need to explain what network centrality means in a compliance context and how it relates to ML typologies.' },
          { id: 'r3b', name: 'GDPR', articles: 'Network analysis of client relationships and counterparty connections is especially privacy-sensitive. May require a Data Protection Impact Assessment (DPIA) beyond what plain XGBoost needs. Processing of third-party (non-customer) counterparty data needs legal basis review.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      'ap4': {
        dataSources: 'Actimize alert narrative text (auto-generated, ~200–500 words per alert) and structured alert features. Historical investigator closure notes (~50–100 words per case) for fine-tuning. On-premise LLM hosting required.',
        dataVolume: '~292,000 alerts × ~400 words average ≈ 117M tokens of compliance narrative. Fine-tuning an on-premise LLM on financial crime narratives would require significant annotation effort and GPU time.',
        dataLabels: 'partial',
        dataQuality: 'Actimize narratives are auto-generated and formulaic — may not contain genuinely distinguishing information beyond structured features. Investigator closure notes are brief and not consistently structured across teams. NLP quality depends heavily on whether narratives carry real signal.',
        dataAccess: 'Alert narratives contain client names, transaction details, and account numbers — highly confidential compliance data. Using any cloud LLM API would mean sending this data externally — not permissible under FINMA confidentiality rules. On-premise GPU infrastructure required.',
        computeBudget: 'On-premise LLM requires significant GPU infrastructure (A100 or equivalent — significant capital cost). Fine-tuning a 7B parameter model: multiple GPU-days. Inference: ~500 ms per alert. At 400 alerts/day the latency is manageable, but infrastructure cost is high relative to XGBoost.',
        modelingStack: 'Python: HuggingFace Transformers, on-premise LLM (Mistral or LLaMA). Highest engineering complexity of all approaches. No standard compliance validation framework for LLM outputs.',
        regulations: [
          { id: 'r4a', name: 'FINMA', articles: 'Model governance for LLMs is an emerging area — no established FINMA framework yet. Model validation methodology unclear. Risk of LLM "hallucination" in compliance context could create regulatory liability. Hardest approach to get approved.' },
          { id: 'r4b', name: 'GDPR', articles: 'Client names and account identifiers in narratives are personal data — fine-tuning an LLM on this data requires careful legal basis and may require a DPIA. Risk of model memorisation means client details could be reproduced in LLM outputs — must be mitigated.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
    },
  },

  spec: {
    clientName: 'Helvetia Wealth Management',
    timeline: '18 weeks',
    executiveSummary:
      'Helvetia Wealth Management\'s Actimize AML system generates ~400 alerts per day, of which only ~20 (5%) represent genuine suspicious activity. The 95% false positive rate has put 24 investigators at capacity, with declining review quality and growing FINMA examination risk. Two years of historical investigator dispositions provide a labelled training dataset that has never been used.\n\nWe propose an XGBoost-based alert prioritisation model trained on these historical dispositions. New alerts are scored on arrival in Actimize via a REST webhook, with SHAP-generated risk indicators displayed in the investigator interface. The scoring system is advisory only — investigators retain full override capability. An enhanced rule-based Actimize configuration is included as a baseline comparison.',
    expectedDataAvailability:
      'Training data: ~292,000 historical Actimize alerts with investigator disposition labels, accessible from the Actimize reporting database. IT estimates a 3-week data extract timeline, pending FCC Head and Legal sign-off.\nCustomer risk data: AML risk ratings and PEP flags available from the customer risk rating system via internal API. Access requires IT provisioning (~1 week).\nKnown gaps: ~12% of historical alerts missing complete customer risk data (PEP status not populated for older records). Historical closure notes from investigators are inconsistently structured — not usable for training without annotation. Label noise estimated at 10–15% in the negative class (false positives that may have been genuinely suspicious but closed due to capacity).',
    expectedComputeUsage:
      'Training: existing on-premise compliance server (CPU-only — no GPU required for XGBoost). Training time: ~30 minutes per run on 292,000 records. Retraining cadence: monthly or when new money laundering typologies are identified by the FCC team.\nInference: REST webhook triggered on alert creation in Actimize. Scoring time < 1 ms per alert. At 400 alerts/day, total daily scoring load is negligible. Runs on existing server — no additional infrastructure required.\nAudit logging: all model scores and feature attributions must be persisted to the compliance data store alongside investigator decisions. Estimated additional storage: ~2 GB/year.',
    solutionComponents:
      'XGBoost Alert Scoring Model — trained on 292,000 historical dispositions; class-weighted for 5% positive rate; recall target ≥ 95% for genuine SARs in top-priority tier\nActimize Rule Baseline — enhanced rule configuration as regulatory reference and investigator-familiar comparison\nSHAP Explanation Layer — top-3 risk indicators per alert displayed in investigator interface; supports closure note drafting\nActimize REST Webhook Integration — new alerts scored within 30 seconds of creation; score and priority tier written back to Actimize case management UI\nModel Governance Documentation — validation report, data lineage, retraining protocol; submitted to FCC Head and CCO for sign-off\nAudit Log Store — all model scores, feature values, and investigator override decisions persisted for FINMA examination readiness',
  },
}
