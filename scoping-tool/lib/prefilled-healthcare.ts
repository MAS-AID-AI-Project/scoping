import type { TeamState } from './types'

export const PREFILLED_HEALTHCARE: TeamState = {
  problemId: 'healthcare',
  customTitle: '',
  customContext: '',
  customSituation: '',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'Regional Medical Centre\'s ICU nursing staff lack a systematic mechanism to identify patients trending toward clinical deterioration between physician rounds. Approximately 12.5% of ICU patients experience an unexpected deterioration event — sepsis, respiratory failure, or cardiac arrest — that requires emergency intervention. Evidence shows these events are often detectable 4–8 hours in advance from data already captured in Epic, but no automated early warning tool exists. The result is reactive rather than preventive care, avoidable prolonged ICU stays, and higher mortality risk for affected patients.',
    rootCause:
      'Vital signs and lab results are recorded every 15 minutes in Epic but are never aggregated or analysed in real time. Nurses assess patients individually using bedside monitors and personal observation; no system combines multi-parameter trends across a patient\'s full admission history to generate a deterioration risk score. Physicians conduct rounds only twice daily, leaving a large unmonitored window between interventions.',
    affectedUsers:
      'ICU patients (80-bed unit, ~4,200 admissions/year); ICU nurses (team of 20, each covering 2–3 patients per shift); attending intensivists (conducting rounds twice daily)',
    currentProcess:
      'Bedside monitors trigger single-parameter alarms (e.g. SpO₂ < 90%). Nurses assess each patient visually every 2–4 hours during routine checks. Physicians conduct formal rounds twice daily. Between rounds, deterioration is identified only when a nurse notices an acute change. No system aggregates vital trends or computes a patient-level risk score. Average time from first EHR warning signal to clinical detection: ~45 minutes.',
    stakeholders: [
      { id: 'sh1', role: 'ICU Head Nurse', concerns: 'Alert fatigue from false positives, disruption to shift workflow, trust in system recommendations', metrics: 'False positive rate < 15 alerts per 100 patient-hours, nurse alert response time < 10 min, staff adoption > 85%' },
      { id: 'sh2', role: 'Attending Intensivist', concerns: 'Clinical accuracy, explainability of alerts, liability if system misfires or creates over-reliance', metrics: 'Sensitivity ≥ 80% with ≥ 4 h lead time, false negatives < 5% for confirmed deterioration events' },
      { id: 'sh3', role: 'Chief Medical Officer (CMO)', concerns: 'Patient safety outcomes, regulatory compliance (EU AI Act), hospital reputation, cost of adverse events', metrics: 'Reduction in unexpected deterioration events ≥ 20%, zero regulatory violations post-deployment' },
      { id: 'sh4', role: 'IT & Data Engineering Team', concerns: 'System integration with Epic, data governance, infrastructure reliability, PHI security', metrics: '99.5% uptime, no data processed outside hospital network, successful Epic FHIR API integration within 4 weeks' },
    ],
  },

  metrics: {
    objectives: [
      'Automatically detect patient deterioration risk at least 4 hours before an emergency intervention is required',
      'Keep the false positive rate below 15 alerts per 100 patient-hours to prevent alert fatigue',
      'Integrate with Epic EHR without requiring manual data entry from nursing staff',
      'Provide an actionable, explainable rationale for each alert so nurses can act with confidence',
    ],
    primaryMetric: 'Sensitivity (recall) for deterioration events with ≥ 4-hour lead time (target: ≥ 80%)',
    secondaryMetrics: [
      'False positive rate per 100 patient-hours (target: < 15)',
      'Time from alert to documented nurse review (target: median < 10 minutes)',
      'Specificity — proportion of non-deteriorating patients correctly scored low-risk (target: > 90%)',
    ],
    baselines: [
      { id: 'bl1', approach: 'Current bedside monitoring (single-parameter alarms)', performance: '~0% predictive sensitivity at 4-hour lead time; average detection ~45 min after first EHR signal', target: 'Automated early warning with ≥ 80% sensitivity at ≥ 4-hour lead time' },
      { id: 'bl2', approach: 'NEWS2 (National Early Warning Score) — rule-based', performance: 'Sensitivity ~65% at 2-hour lead; high false positive rate for ICU patients at chronically elevated baseline', target: 'Improve to ≥ 80% sensitivity with false positive rate < 15 per 100 patient-hours' },
    ],
  },

  solutionSpace: {
    inputs: [
      'Vital signs time series — HR, BP (systolic/diastolic), SpO₂, respiratory rate, temperature (every 15 min)',
      'Lab results — latest values for WBC, lactate, creatinine, haemoglobin, platelets',
      'Medication orders — current active medications (e.g. vasopressors, antibiotics)',
      'Patient demographics and admission diagnosis',
      'Clinical notes — most recent nurse and physician free-text entries',
    ],
    outputs: [
      'Deterioration risk score per patient (0–100)',
      'Risk trajectory label — Stable / Worsening / Critical',
      'Top 3 contributing clinical features (for nurse explainability)',
      'Alert flag — High / Medium / Low (with nurse-configurable threshold)',
    ],
    constraints:
      'All processing within hospital network — no patient data to external APIs. Alert latency ≤ 2 minutes from data update. Must integrate with Epic via FHIR API. No manual data entry required from nurses.',
    approaches: [
      {
        id: 'ap1',
        name: 'Augmented NEWS2 (rule-based)',
        description: 'Extend the standard National Early Warning Score with ICU-specific parameters (lactate, vasopressor use, trend direction). Deterministic thresholds — no ML component.',
        inputTypes: 'Tabular snapshot: current vital signs + selected lab values. No historical sequence required.',
        outputTypes: 'Categorical risk tier (Low / Medium / High) and total score (integer 0–20+). No probabilistic estimate.',
        pros: 'Fully transparent and auditable; no training data needed; easiest regulatory path; nurses already familiar with NEWS; fast to deploy',
        cons: 'Cannot learn from historical patterns; fixed thresholds poorly suited to ICU patients at chronically elevated baselines; sensitivity ceiling ~65%',
      },
      {
        id: 'ap2',
        name: 'Gradient Boosted Trees on engineered features (XGBoost)',
        description: 'Engineer ~80 statistical features from 48-hour vital sign windows (mean, std, trend slope, time-since-last-abnormal). Train XGBoost on outcome-labelled admissions. Use SHAP for per-alert feature attribution.',
        inputTypes: 'Tabular feature vectors: ~80 engineered features per patient snapshot derived from the 48-hour vital sign history. No raw sequences.',
        outputTypes: 'Risk probability (0–1) for deterioration within the next 4/8/12 hours; SHAP values for the top 3 contributing features per alert.',
        pros: 'Strong performance on tabular clinical data; SHAP provides interpretable explanations; fast inference (~2 ms/patient); well-understood by clinical informatics teams',
        cons: 'Feature engineering is labour-intensive; misses some temporal structure compared to sequence models; requires careful handling of class imbalance (~12.5% event rate)',
      },
      {
        id: 'ap3',
        name: 'LSTM time-series model',
        description: 'End-to-end LSTM trained directly on raw vital sign sequences (48-hour windows at 15-min resolution). Learns temporal patterns without manual feature engineering.',
        inputTypes: 'Multivariate time series: shape (patients × 192 time steps × 6 vital features). Padded and masked for missing values.',
        outputTypes: 'Probability of deterioration within the next 4 hours (scalar). Attention weights used for approximate feature attribution.',
        pros: 'Captures temporal dynamics automatically; no feature engineering required; potentially higher sensitivity than XGBoost',
        cons: 'Higher compute for training and inference; attention weights less interpretable than SHAP; needs more data to generalise; harder to validate and explain to clinical staff',
      },
      {
        id: 'ap4',
        name: 'Multimodal transformer (vitals + clinical notes)',
        description: 'Combine vital sign sequences with free-text clinical notes using a transformer architecture (BioClinicalBERT for text, temporal encoder for vitals), fused for joint deterioration prediction.',
        inputTypes: 'Dual input: (1) time series sequences, (2) tokenised clinical notes (up to 512 tokens per note). Late fusion before classification head.',
        outputTypes: 'Risk score grounded in both numeric and textual clinical evidence; rationale can reference specific note content.',
        pros: 'Leverages the full information content of the EHR including clinical notes; potentially highest accuracy ceiling',
        cons: 'Highest complexity and compute cost; hardest to explain to clinicians; NLP on free-text notes raises additional PHI de-identification requirements; inference latency may exceed 2-minute SLA',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap2',
    customQuestions: [],
    perApproach: {
      'ap1': {
        dataSources: 'Epic EHR — real-time vital signs via FHIR Observation resources, lab results via DiagnosticReport. No historical dataset needed.',
        dataVolume: 'Only the current patient snapshot is required per scoring cycle. No training dataset needed for the rule-based system.',
        dataLabels: 'no',
        dataQuality: 'NEWS2 thresholds are fixed — no data quality issues from training. Risk: ICU patients often sit chronically above normal thresholds, diluting the alert signal and increasing false positives.',
        dataAccess: 'Read-only access to Epic FHIR API. No PHI storage beyond what Epic already holds. Lowest compliance burden of all approaches.',
        computeBudget: 'Runs as a lightweight scoring function on the existing Epic integration server. No GPU or dedicated infrastructure required.',
        modelingStack: 'Python scoring script triggered by FHIR observation events. No ML framework needed.',
        regulations: [
          { id: 'r1a', name: 'EU AI Act', articles: 'Classification — deterministic rule system likely does not trigger high-risk AI classification (verify against Annex I medical device software criteria). Documentation burden minimal.' },
          { id: 'r1b', name: 'GDPR', articles: 'Data access — patient vitals accessed in real time but not stored by the scoring system. Data minimisation principle satisfied. No additional processing agreement likely needed beyond existing Epic data governance.' },
        ],
        sieveAnswers: { 'sq-1': true, 'sq-2': false, 'sq-3': false },
        sieveDecision: 'non-ai',
        sieveBaseline: false,
      },
      'ap2': {
        dataSources: 'Epic EHR via FHIR API: (1) Observation — vitals every 15 min; (2) DiagnosticReport — lab results; (3) MedicationRequest — active orders; (4) Patient and Encounter — demographics and admission data.',
        dataVolume: '5 years × 4,200 admissions/yr = ~21,000 patient stays. Average 5.2-day stay × 96 readings/day ≈ 500 vital snapshots per admission. ~10.5M individual vital measurements after joining.',
        dataLabels: 'yes',
        dataQuality: 'Class imbalance: ~12.5% of stays include a deterioration event — apply SMOTE or class-weighted training. Missing vitals during patient transport (~8% of time steps) — impute with forward-fill + missingness indicator flag. Lactate and platelet values absent for ~18% of admissions.',
        dataAccess: 'PHI — all data must remain within the hospital network. Epic FHIR API access requires IT sign-off and a Data Protection Officer review. IRB exemption likely applicable (retrospective QI data). No data leaves the on-premise server.',
        computeBudget: 'Training: on-premise research server (1 × NVIDIA P100, 16 GB VRAM). Estimated training time 3–5 hours per run. Inference: runs every 15 min across all active ICU patients; ~2 ms per patient at 80-bed capacity. Negligible additional infrastructure cost.',
        modelingStack: 'Python: pandas, scikit-learn, XGBoost, SHAP, imbalanced-learn. Scheduled inference via cron job on Epic integration server. Alerts delivered via Epic SMART-on-FHIR notification API.',
        regulations: [
          { id: 'r2a', name: 'EU AI Act', articles: 'Classification — likely high-risk AI (Annex I: medical device software influencing clinical decisions). Training — risk management and data governance documentation required before deployment. Inference — human oversight mandatory; nurses must be able to override and dismiss alerts. Post-market monitoring must be designed in from the start.' },
          { id: 'r2b', name: 'GDPR', articles: 'Data collection — ICU vitals are special category health data (Art. 9); lawful basis required (legitimate interest for patient safety). Training — retrospective data must be pseudonymised before model development. Inference — alert system is decision support for clinicians, not autonomous decision-making.' },
          { id: 'r2c', name: 'HL7 FHIR', articles: 'Data pipeline — FHIR API calls must include audit logging. Rate limits on Epic FHIR must be respected within the 15-minute polling cycle. Any write-back of alert data to Epic requires approved FHIR write endpoints and IT sign-off.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      'ap3': {
        dataSources: 'Same Epic FHIR sources as XGBoost. Raw vital sign sequences needed in their time-series form — no feature engineering step.',
        dataVolume: 'Same 21,000 stays. Each stay as a padded matrix: 192 time steps × 6 vital features. Total: ~2.4 GB of sequence data after preprocessing.',
        dataLabels: 'yes',
        dataQuality: 'Missing time steps handled via masking. Same class imbalance as XGBoost — use weighted loss function. 21,000 stays is on the smaller side for LSTM generalisation; risk of overfitting on the minority class.',
        dataAccess: 'Same PHI and network constraints as XGBoost. Sequence data is more memory-intensive; larger storage footprint on the on-premise server.',
        computeBudget: 'Training: GPU required (P100 available). ~4–6 hours per run. Inference: ~15 ms per patient — within 2-minute latency requirement but slower than XGBoost.',
        modelingStack: 'Python: PyTorch, PyTorch Lightning. LSTM with attention. Model registry: MLflow. Explainability via attention weights — no SHAP equivalent out of the box.',
        regulations: [
          { id: 'r3a', name: 'EU AI Act', articles: 'Same high-risk classification as XGBoost. Explainability requirement harder to satisfy: attention weights are not as interpretable as SHAP feature attributions. Higher documentation burden.' },
          { id: 'r3b', name: 'GDPR', articles: 'Same data governance requirements as XGBoost. No additional risk from the sequence format beyond a larger data footprint.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      'ap4': {
        dataSources: 'Same vital signs + lab data as XGBoost, PLUS free-text clinical notes from Epic ClinicalImpression and DiagnosticReport resources. Requires a separate NLP preprocessing and de-identification pipeline.',
        dataVolume: 'Vital sequence data: ~2.4 GB. Clinical notes: ~20 notes per admission × 21,000 stays × ~150 words ≈ 63M tokens.',
        dataLabels: 'yes',
        dataQuality: 'Clinical notes vary significantly in structure and quality across departments and shifts. Named entity recognition required. A validated de-identification pipeline is required before any training — substantially increases compliance complexity.',
        dataAccess: 'Free-text clinical notes may contain PHI beyond structured fields. De-identification pipeline must be audited and validated. Largest attack surface for re-identification of all approaches.',
        computeBudget: 'Training: multi-GPU strongly preferred. Fine-tuning BioClinicalBERT alone: ~12 hours per run; joint training significantly longer. Inference: ~80–120 ms per patient — may not meet 2-minute alert latency at peak census.',
        modelingStack: 'Python: PyTorch, HuggingFace Transformers (BioClinicalBERT), custom temporal encoder. Very high engineering complexity.',
        regulations: [
          { id: 'r4a', name: 'EU AI Act', articles: 'Same high-risk classification. Explainability most challenging — transformer attention maps are not clinically interpretable. Highest documentation burden; most likely to face regulatory pushback.' },
          { id: 'r4b', name: 'GDPR', articles: 'Clinical notes contain unstructured PHI; a validated de-identification pipeline must be audited before use. Larger attack surface for re-identification via model memorisation; differential privacy techniques may be required.' },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
    },
  },

  spec: {
    clientName: 'Regional Medical Centre',
    timeline: '20 weeks',
    executiveSummary:
      'Regional Medical Centre operates an 80-bed ICU admitting ~4,200 patients per year. Approximately 12.5% of patients experience an unexpected deterioration event — many of which leave a detectable signal in Epic 4–8 hours before a clinical emergency. Currently no automated early warning tool exists; nurses rely on manual observation and single-parameter bedside alarms that detect crises only after they have already begun.\n\nWe propose an XGBoost-based ICU early warning system that continuously scores each patient\'s deterioration risk from engineered features derived from 48-hour vital sign histories and lab results. Alerts are delivered to nurses via the Epic SMART-on-FHIR notification interface with SHAP-based explanations. A rule-based augmented NEWS2 score is included as a baseline for regulatory comparison.',
    expectedDataAvailability:
      'Retrospective training data: ~21,000 de-identified ICU admissions from 5 years of Epic records, accessible via FHIR API subject to IT and DPO sign-off (estimated 6-week lead time).\nReal-time inference: Epic FHIR Observation and DiagnosticReport streams available once IT provisions API credentials (~2-week lead time). Lab results have a typical reporting lag of 45–90 minutes.\nKnown gaps: Lactate and platelet values absent for ~18% of admissions. Transport-related vital sign gaps (~8% of time steps) will be handled by forward-fill imputation with a missingness indicator. Outcome labels derived from Epic emergency code records — near-miss events not currently documented.',
    expectedComputeUsage:
      'Training: hospital IT research GPU server (1 × NVIDIA P100, 16 GB VRAM). Estimated training time 3–5 hours per XGBoost run. Retraining cadence: quarterly or triggered by drift detection.\nInference: scheduled every 15 minutes across all active ICU patients. At full 80-bed capacity: ~2 ms × 80 patients < 200 ms per scoring cycle. Runs on the existing Epic integration server — no additional hardware required.\nStorage: feature engineering artefacts and model checkpoints: ~50 GB on hospital NAS.',
    solutionComponents:
      'Feature Engineering Pipeline — extract ~80 statistical features (mean, std, trend slope, time-since-last-abnormal) from 48-hour vital sign windows; re-computed every 15 minutes\nXGBoost Risk Scoring Model — trained on 5 years of labelled ICU admissions; class-weighted training; AUC-ROC target ≥ 0.85\nNEWS2 Augmented Baseline — rule-based score extended with ICU-specific parameters; regulatory reference and clinical comparison\nSHAP Explanation Layer — top-3 contributing features per alert; displayed alongside risk score in nurse dashboard\nEpic SMART-on-FHIR Integration — real-time alert delivery to nurse workstations via Epic notification API\nDrift Monitoring — weekly statistical comparison of score distribution vs training baseline; automated report to IT and clinical lead',
  },
}
