import type { TeamState } from './types'

export const PREFILLED_TRUTHGUARD: TeamState = {
  problemId: 'custom',
  customTitle: 'AI-Powered Content Integrity Platform',
  customContext: 'Media & Content Moderation',
  customSituation:
    'TruthGuard Media Solutions SA serves news publishers and social platforms across Europe, processing over 10 million content items daily for fact-checking and authenticity verification. Manual moderation takes 48–72 hours, allowing misinformation to reach millions before verification. The EU Digital Services Act and AI Act require transparent, explainable moderation decisions.',
  currentStep: 1,

  problemDef: {
    problemStatement:
      'TruthGuard processes 10M+ content items daily but manual fact-checking takes 48–72 hours, covering only ~0.5% of daily volume. Misinformation reaches millions of readers before any review occurs. Publishers are losing advertiser trust, and the EU Digital Services Act (Art. 17, 27) now mandates transparent, explainable moderation decisions with a human-review appeals path — requirements the current manual-only workflow cannot document at scale.',
    rootCause:
      'Manual review capacity (~50K items/day) is structurally incapable of keeping pace with 10M items/day inflow. Fact-checkers spend equal effort on clearly trustworthy and clearly false content because there is no triage layer. No ML pipeline exists to prioritise, classify, or route content by misinformation risk, so every item enters the same slow queue regardless of urgency.',
    affectedUsers:
      'News publishers and social media platforms using TruthGuard\'s verification API; content creators whose posts are subject to moderation; end readers exposed to unverified content; advertisers whose brand-safety guarantees depend on accurate moderation.',
    currentProcess:
      'Content submitted via client API → queued in manual review backlog → assigned to domain fact-checker (politics / health / finance) → researcher cross-references claims against known databases and primary sources → decision logged with notes → result returned to client. Average end-to-end: 48–72 hours. Effective coverage: ~50K items/day out of 10M received. No automated triage or pre-screening exists.',
    stakeholders: [
      {
        id: 'sh1',
        role: 'Chief Content Officer',
        concerns: 'Platform safety, user trust, brand reputation of publisher clients',
        metrics: 'Harmful content reduction rate ≥ 80%, publisher satisfaction score, zero high-profile misinformation escapes',
      },
      {
        id: 'sh2',
        role: 'Legal & Compliance',
        concerns: 'EU DSA compliance, audit trail for moderation decisions, liability exposure',
        metrics: 'DSA compliance rate 100%, statement-of-reasons issued for all removals, human-review appeals <48h',
      },
      {
        id: 'sh3',
        role: 'Engineering Teams',
        concerns: 'System scalability, API latency, integration with existing review tooling',
        metrics: 'API throughput 10M items/day, classification latency <5 seconds per item, 99.9% uptime',
      },
      {
        id: 'sh4',
        role: 'Content Creators',
        concerns: 'Fair treatment, transparency about why content was flagged, ability to appeal',
        metrics: 'False positive rate <5%, demographic parity across political/ethnic/religious groups, explanation clarity score ≥ 4/5',
      },
      {
        id: 'sh5',
        role: 'Advertisers',
        concerns: 'Brand safety — ads must not appear next to misinformation',
        metrics: 'Brand-safety incident rate < 0.1%, content quality score as reported by advertiser audits',
      },
      {
        id: 'sh6',
        role: 'End Users / Readers',
        concerns: 'Information quality, protection from misinformation, free expression',
        metrics: 'False removal rate <2%, reader trust survey score, correction rate when misinformation does escape',
      },
    ],
  },

  metrics: {
    objectives: [
      'Reduce misinformation identification time from 72 hours to under 1 hour for 80% of content',
      'Achieve ≥ 80% recall on verified false content across politics, health, and finance domains',
      'Maintain false positive rate below 5% to avoid unjust removal of legitimate content',
      'Maintain demographic parity in moderation decisions across political, ethnic, and religious content groups',
      'Provide a DSA-compliant explainable "statement of reasons" for every moderation action',
    ],
    primaryMetric:
      'Recall on verified false content across all domains (target: ≥ 80% at a precision of ≥ 90%)',
    secondaryMetrics: [
      'Mean time to classification for auto-tier items (target: < 5 minutes)',
      'False positive rate on legitimate content (target: < 5%)',
      'Demographic parity gap across content categories (target: < 5 percentage points across groups)',
      'Human-review escalation rate (target: 15–25% — enough oversight without overwhelming reviewers)',
    ],
    baselines: [
      {
        id: 'bl1',
        approach: 'Current manual review process',
        performance:
          '~100% precision on reviewed items but covers only 0.5% of daily volume (50K/10M). Effective misinformation catch rate across full inflow: < 1%. Average latency: 48–72 hours.',
        target: '≥ 80% recall across full 10M daily inflow; < 1 hour for flagged items',
      },
      {
        id: 'bl2',
        approach: 'Keyword / rule-based classifier (existing prototype)',
        performance:
          'Recall: ~40% on verified false content. Precision: ~65% (35% false positive rate). Latency: < 1 second. Covers full volume but too many false positives to act on without human review.',
        target: 'Recall ≥ 80%, Precision ≥ 90% — a step change, not an incremental improvement',
      },
    ],
  },

  solutionSpace: {
    inputs: [
      'Article or post text — headline and full body',
      'Source domain, publisher metadata, and author history',
      'Referenced entities (people, organisations, locations)',
      'Cited URLs and their domain-reputation signals',
      'Publication timestamp and content recency',
      'Cross-domain category label (politics / health / finance / general)',
    ],
    outputs: [
      'Misinformation risk score (0.0–1.0)',
      'Classification label: Credible / Uncertain / Likely False / Verified False',
      'Domain label: politics / health / finance / other',
      'Human-readable explanation — top 3 contributing signals (DSA "statement of reasons")',
      'Human-review flag for uncertain cases (score in 0.35–0.70 range)',
      'Similar fact-checked claims retrieved from knowledge base (for RAG approaches)',
    ],
    constraints:
      'DSA Art. 17/27 requires an explainable statement of reasons for every removal decision. GDPR Art. 22 triggers human-review obligation when content suppression has significant effect on users. Special-category data (political opinions, religious beliefs) requires additional safeguards. All processing must remain within EU jurisdiction. API must respond in < 5 seconds to fit into real-time publishing pipelines. Model must not be trained on or infer protected characteristics for targeting purposes.',
    approaches: [
      {
        id: 'ap1',
        name: 'Fine-tuned RoBERTa multi-domain NLP classifier',
        description:
          'Fine-tune a RoBERTa-base model on FakeNewsNet (PolitiFact + GossipCop) and MultiFC (40K+ multi-domain fact-checked claims) to classify content as Credible / Likely False. Add SHAP token attributions for explanation.',
        inputTypes:
          'Text: headline + body (truncated to 512 tokens). Source reputation embedding as additional feature. Domain label as conditioning input.',
        outputTypes:
          'Classification logits → Credible / Uncertain / Likely False label + confidence score. SHAP token attribution highlights for explanation layer.',
        pros: 'Strong NLP performance on text classification; SHAP provides token-level explanations compatible with DSA; fast inference after fine-tuning; well-understood training pipeline',
        cons: 'Does not verify claims against external knowledge — can only pattern-match training examples; may hallucinate on novel misinformation not seen in training data; requires periodic retraining as misinformation evolves',
      },
      {
        id: 'ap2',
        name: 'RAG-based fact verification pipeline',
        description:
          'Embed all 40K+ fact-checked claims from MultiFC + Wikipedia into a vector database. At inference, retrieve top-k similar claims, then use a cross-encoder to compare the input claim against retrieved evidence and output a verdict.',
        inputTypes:
          'Text: claim or headline extracted from article. Vector similarity search against fact-checked claim database. Retrieved claim-verdict pairs as context.',
        outputTypes:
          'Verdict: Supported / Refuted / Not Enough Information. Retrieved evidence snippets (used as DSA-compliant explanation). Similarity score to best-matching verified claim.',
        pros: 'Grounded in verified facts — decisions are traceable to specific evidence; explanation is the retrieved evidence itself (inherently DSA-compliant); does not require training data labels for new domains — just add claims to the vector DB',
        cons: 'Only effective if a similar claim exists in the knowledge base; struggles with novel misinformation patterns; retrieval quality degrades on vague or highly contextual claims; slower than a classifier (retrieval + cross-encoding latency)',
      },
      {
        id: 'ap3',
        name: 'Hybrid pipeline: RoBERTa triage + RAG verification',
        description:
          'Two-stage system: RoBERTa classifier fast-screens all 10M items and auto-approves clear Credible cases (score > 0.85) and auto-flags clear Verified False cases (score < 0.15). Items in the uncertain band (0.15–0.85) go to the RAG verification stage for evidence retrieval and a human-review queue.',
        inputTypes:
          'Stage 1 (classifier): full text → fast risk score. Stage 2 (RAG): extracted claims from uncertain items → vector retrieval + cross-encoder verdict.',
        outputTypes:
          'Stage 1: auto-Credible / auto-flag / escalate-to-stage-2. Stage 2: RAG verdict + retrieved evidence snippets + human-review package with pre-filled explanation draft.',
        pros: 'Best of both: classifier handles scale (10M/day at <1s), RAG provides grounded evidence for borderline cases; human review focused on genuinely uncertain content; each stage has a well-defined explanation mechanism; DSA-compliant at every tier',
        cons: 'More complex to build, deploy, and monitor; two models to maintain and retrain; classification errors in Stage 1 can route items incorrectly; requires vector DB infrastructure',
      },
      {
        id: 'ap4',
        name: 'LLM zero-shot / few-shot fact-checking (GPT-4 / Claude)',
        description:
          'Prompt an LLM with the claim and a few verified examples. Ask it to assess plausibility, identify red flags, and generate a statement of reasons. No training required.',
        inputTypes:
          'Structured prompt: system instructions + 3–5 few-shot examples + input claim text. Optional: retrieved Wikipedia snippets as grounding context.',
        outputTypes:
          'Natural language verdict and explanation. Structured JSON extraction of label and confidence. Citations to grounding documents if provided.',
        pros: 'Zero training data required; immediately deployable; generates high-quality natural language explanations out of the box; adapts to new misinformation patterns without retraining',
        cons: 'Cost-prohibitive at 10M items/day (API pricing); latency 2–10 seconds per call; outputs are not reproducible — same input may yield different verdict on different calls; harder to audit for DSA compliance; no guarantees on demographic parity without systematic testing',
      },
    ],
  },

  feasibility: {
    chosenApproachId: 'ap3',
    customQuestions: [],
    perApproach: {
      ap1: {
        dataSources:
          'FakeNewsNet: PolitiFact and GossipCop labelled news articles (~25K items). MultiFC corpus: 40K+ fact-checked claims across politics, health, finance from 26 fact-checking sources. M4 dataset: machine-generated text samples from multiple LLMs (for AI-generated misinformation detection). Wikipedia as background knowledge for entity grounding.',
        dataVolume:
          '~65K labelled training examples across all datasets. Class balance varies by source — FakeNewsNet is ~50/50 real/fake; MultiFC has multi-class verdicts. Augmented with M4 dataset for AI-generated content detection. Evaluated on held-out cross-domain test set.',
        dataLabels: 'yes',
        dataQuality:
          'FakeNewsNet labels sourced from PolitiFact fact-checkers — high quality but politically skewed (US politics-heavy). MultiFC labels vary in quality across 26 sources. Cross-domain generalisation is a known challenge: a model trained on political news may underperform on health misinformation. Requires domain-stratified evaluation and potential domain-specific fine-tuning heads.',
        dataAccess:
          'All training datasets are publicly available for research use. Production inference processes client-submitted content — must remain within EU jurisdiction (GDPR). No PII in the training data. Special-category content (political opinions, religious text) in training data requires careful handling per GDPR recital 51 and Art. 9.',
        computeBudget:
          'Fine-tuning RoBERTa-base: 4× A100 GPU, ~6 hours. Estimated cloud cost: €800–1,200 per training run. Inference: CPU-based for most items (< 1 second), GPU for batches. Monthly inference cost for 10M items/day: approximately €2,000–3,500 on EU cloud infrastructure.',
        modelingStack:
          'Python: HuggingFace Transformers (RoBERTa-base), SHAP for token attribution, scikit-learn for evaluation metrics. Training: AWS SageMaker EU-West-1. Inference: FastAPI + ONNX Runtime for optimised CPU inference. Monitoring: Evidently AI for concept drift.',
        regulations: [
          {
            id: 'reg1',
            name: 'EU Digital Services Act',
            articles:
              'Art. 14/17: Systems flagging content for removal must provide a "statement of reasons" to affected users. Art. 27: VLOPs must provide meaningful information about content moderation systems. SHAP token attributions serve as the technical basis for the statement of reasons.',
          },
          {
            id: 'reg2',
            name: 'EU AI Act',
            articles:
              'Art. 52: Limited-risk AI system — must disclose to users that content moderation decisions involve AI. Art. 11: Maintain technical documentation on training data, performance metrics, and known limitations. Annual review of documentation required.',
          },
          {
            id: 'reg3',
            name: 'GDPR',
            articles:
              'Art. 22: When content suppression has significant effect on users (removal, shadowbanning, account suspension), automated decision-making obligations apply — human review must be available on request. Recital 51/Art. 9: Special-category data (political opinions, religious beliefs) in content requires additional safeguards — do not use these as features for profiling.',
          },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      ap2: {
        dataSources:
          'MultiFC corpus: 40K+ fact-checked claims as the primary vector database. Wikipedia: article summaries for entity-level fact grounding. PolitiFact and Snopes structured claim archives. New verified claims can be added to the vector DB without retraining.',
        dataVolume:
          '40K+ indexed fact-checked claims in the vector database. Each claim stored with verdict label, source, and embedding. Vector DB grows over time as new claims are verified. Cross-encoder trained on a smaller claim-pair dataset (~10K pairs).',
        dataLabels: 'partial',
        dataQuality:
          'RAG quality is bounded by the coverage and recency of the knowledge base. Novel misinformation patterns not yet fact-checked will not match any stored claim — system returns "Not Enough Information" rather than a false confident verdict. Knowledge base staleness is the primary quality risk: must be updated continuously as new false claims emerge.',
        dataAccess:
          'Same EU jurisdiction requirements apply. Vector database hosted on EU infrastructure. Fact-checked claim sources are publicly available. No user PII processed in the retrieval pipeline.',
        computeBudget:
          'Vector indexing: one-time cost ~€200. Retrieval inference: CPU-based, < 200ms per query. Cross-encoder: GPU for batch processing, CPU for real-time. Monthly cost for 10M items/day with filtering: approximately €4,000–6,000 (higher than classifier due to retrieval overhead).',
        modelingStack:
          'Sentence-Transformers for embedding. FAISS or Weaviate for vector search (EU-hosted). Cross-encoder: fine-tuned RoBERTa on claim-evidence pairs. FastAPI inference endpoint.',
        regulations: [
          {
            id: 'reg1b',
            name: 'EU Digital Services Act',
            articles:
              'Art. 17: Retrieved evidence snippets constitute a strong foundation for the statement of reasons — the explanation is the evidence itself. Art. 27: Transparent about what claim database the system checks against.',
          },
          {
            id: 'reg2b',
            name: 'GDPR',
            articles:
              'Art. 22 same obligations as classifier approach. Advantage: retrieved evidence makes human review easier since the reviewer can see exactly why a claim was flagged.',
          },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
      ap3: {
        dataSources:
          'Stage 1 (RoBERTa): FakeNewsNet + MultiFC (65K labelled examples). Stage 2 (RAG): MultiFC + Wikipedia + PolitiFact archive as vector knowledge base. Both stages share the same underlying datasets — no additional data collection required.',
        dataVolume:
          'Stage 1 trains on 65K labelled examples — sufficient for RoBERTa fine-tuning. Stage 2 vector DB: 40K+ indexed claims, growing over time. Estimated ~20–30% of daily items fall into the uncertain band requiring Stage 2 (2–3M items/day through RAG).',
        dataLabels: 'yes',
        dataQuality:
          'Stage 1 quality risk: cross-domain generalisation — mitigated by domain-stratified training and evaluation. Stage 2 quality risk: knowledge base staleness — mitigated by a continuous claim-ingestion pipeline. The two stages complement each other: Stage 1 handles pattern-based detection; Stage 2 handles claim-level verification against known facts.',
        dataAccess:
          'All data processing within EU jurisdiction. Training data publicly available. Production content processed under GDPR with appropriate data minimisation — article text processed for classification but not stored beyond the review window.',
        computeBudget:
          'Training Stage 1: ~€1,000–1,500 per run (same as ap1). Stage 2 inference: additional €2,000–3,000/month for the 20–30% of items requiring RAG retrieval. Total monthly operational cost: approximately €4,000–6,000. Significantly cheaper than full-volume LLM prompting.',
        modelingStack:
          'Stage 1: HuggingFace RoBERTa + SHAP, deployed via ONNX Runtime. Stage 2: Sentence-Transformers + Weaviate vector DB + cross-encoder. Orchestration: FastAPI with async routing logic. Monitoring: Evidently AI for drift across both stages.',
        regulations: [
          {
            id: 'reg1c',
            name: 'EU Digital Services Act',
            articles:
              'Art. 14/17: Stage 1 auto-decisions (Credible / Verified False) supported by SHAP token explanation. Stage 2 provides retrieved evidence as the statement of reasons. Art. 27: System documentation covers both stages — classifier + retrieval. Human appeals routed to Stage 2 queue with full evidence package.',
          },
          {
            id: 'reg2c',
            name: 'EU AI Act',
            articles:
              'Art. 52: Limited-risk classification — AI disclosure required for all content moderation actions. Art. 11: Technical documentation maintained for both models. Performance metrics and known limitations documented per model.',
          },
          {
            id: 'reg3c',
            name: 'GDPR',
            articles:
              'Art. 22: Human-review flag (Stage 2 escalation) satisfies the meaningful human involvement requirement for significant moderation actions. Audit trail maintained for each item\'s decision path (Stage 1 score, Stage 2 evidence, human review if triggered). Special-category content processed with additional access controls.',
          },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': true },
        sieveDecision: 'ai',
        sieveBaseline: true,
      },
      ap4: {
        dataSources:
          'No training data required. Optional: retrieved Wikipedia snippets as grounding context in the prompt. Few-shot examples (3–5) drawn from MultiFC. The LLM\'s parametric knowledge serves as an implicit fact base.',
        dataVolume:
          'No training corpus. Context window per call: 4–8K tokens (claim + few-shot examples + optional retrieved snippets). No minimum volume requirement to deploy.',
        dataLabels: 'no',
        dataQuality:
          'LLM outputs are not deterministic — the same claim may yield a different verdict on separate calls. Hallucination risk: the model may confidently state incorrect facts. No systematic bias evaluation without extensive testing across demographic groups. Quality is highly sensitive to prompt engineering, which requires ongoing maintenance.',
        dataAccess:
          'If using a third-party API (OpenAI, Anthropic), all content is sent outside EU jurisdiction — incompatible with GDPR without additional safeguards (e.g., EU data processing agreement, or running an open-weight LLM on EU infrastructure). Open-weight models (Llama, Mistral) on EU infrastructure are feasible but require significant infrastructure investment.',
        computeBudget:
          'API-based (GPT-4): €0.01–0.03 per item × 10M/day = €100,000–300,000/day. Entirely cost-prohibitive at scale. Open-weight model on EU GPU cluster: ~€40,000–80,000/month in infrastructure — still significantly more expensive than classifier approaches.',
        modelingStack:
          'OpenAI API or Anthropic Claude API (with EU data agreement) or self-hosted Llama/Mistral on EU GPU cluster. Prompt engineering framework (e.g., LangChain). Structured output parsing (JSON mode).',
        regulations: [
          {
            id: 'reg1d',
            name: 'EU Digital Services Act',
            articles:
              'Art. 17: LLM-generated explanations are natural language but not reproducible or auditable in the same way as SHAP attributions or retrieved evidence. A regulator cannot verify why the model reached a specific verdict. Compliance risk: high.',
          },
          {
            id: 'reg2d',
            name: 'GDPR',
            articles:
              'Third-party API usage: sending content to OpenAI/Anthropic constitutes a transfer outside the EU — requires data processing agreement and appropriate safeguards. Open-weight model avoids this. Art. 22: Non-deterministic outputs make it difficult to maintain a consistent audit trail for human review.',
          },
        ],
        sieveAnswers: { 'sq-1': false, 'sq-2': true, 'sq-3': false },
        sieveDecision: 'ai',
        sieveBaseline: false,
      },
    },
  },

  spec: {
    clientName: 'TruthGuard Media Solutions SA',
    timeline: '22 weeks',
    executiveSummary:
      'TruthGuard Media Solutions processes 10 million content items daily but manual fact-checking covers only 0.5% of that volume with a 48–72 hour turnaround. Misinformation reaches millions of readers before any verification action is taken. The EU Digital Services Act now requires transparent, auditable, explainable moderation decisions with human-review appeals — requirements the current manual workflow cannot meet at scale.\n\nWe propose a two-stage hybrid content integrity pipeline. Stage 1 uses a fine-tuned RoBERTa classifier to fast-screen all 10M daily items in under 5 seconds each, auto-clearing clearly credible content and auto-flagging clearly false content with SHAP token explanations. Stage 2 routes uncertain items (estimated 20–30% of volume) through a RAG-based verification system that retrieves similar fact-checked claims from a 40K+ claim knowledge base and presents retrieved evidence as the DSA-compliant statement of reasons. A human-review queue receives Stage 2 escalations with a pre-filled evidence package, satisfying GDPR Art. 22 human oversight requirements.',
    expectedDataAvailability:
      'Training data (all publicly available):\n— FakeNewsNet: PolitiFact + GossipCop labelled articles (~25K items). Available immediately.\n— MultiFC corpus: 40K+ fact-checked claims across 26 sources. Available immediately for both training and vector DB indexing.\n— M4 dataset: machine-generated text samples. Available immediately for AI-generated content detection.\n\nProduction data:\n— Client content arrives via existing API. No new data ingestion pipeline needed beyond the classifier endpoint.\n— Known gap: knowledge base staleness. A continuous claim-ingestion pipeline must be built to add newly verified claims to the vector DB. Estimated 2-week build. Fact-checking sources (PolitiFact, AFP Factuel, Snopes) have RSS feeds available for automated ingestion.',
    expectedComputeUsage:
      'Training:\n— RoBERTa fine-tuning: 4× A100 GPU, ~6 hours per run, €1,000–1,500 per training run on EU cloud. Retraining cadence: monthly or when F1 drops > 3 percentage points on evaluation set.\n— Vector DB indexing: one-time cost ~€200. Re-indexing on new claims: automated, minimal cost.\n\nInference (10M items/day):\n— Stage 1 (all items): CPU-based ONNX inference, < 1 second per item. Estimated €1,500–2,000/month.\n— Stage 2 (20–30% of items): GPU-accelerated retrieval + cross-encoder, < 5 seconds per item. Estimated €2,500–4,000/month.\n— Total monthly operational estimate: €4,000–6,000 (EU infrastructure).\n\nMonitoring: Evidently AI for classifier drift and retrieval relevance degradation. Weekly automated report to Chief Content Officer and Legal.',
    solutionComponents:
      'Stage 1 — RoBERTa NLP Classifier: fine-tuned on FakeNewsNet + MultiFC; domain-stratified training (politics / health / finance); SHAP token attribution for explanation layer; ONNX Runtime deployment for CPU inference at scale\nStage 2 — RAG Verification Engine: Sentence-Transformer embeddings of 40K+ fact-checked claims; Weaviate vector DB on EU infrastructure; cross-encoder for claim-evidence matching; retrieved snippets as DSA statement-of-reasons\nClaim Ingestion Pipeline: automated RSS/API ingestion from PolitiFact, AFP Factuel, Snopes; deduplication and embedding pipeline; continuous vector DB update\nBias & Fairness Audit: demographic parity evaluation across political, ethnic, and religious content groups; threshold optimisation per domain; quarterly bias report\nHuman Review Queue: web interface surfacing Stage 2 evidence packages to fact-checkers; DSA-compliant appeal handling; audit trail for every escalated decision\nDrift Monitoring: Evidently AI tracking classifier confidence distribution and retrieval hit-rate; alert on degradation > 3 percentage points',
  },
}
