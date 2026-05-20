import type { ProblemTemplate } from './types'

export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  {
    id: 'healthcare',
    domain: 'Healthcare',
    color: 'emerald',
    title: 'ICU Early Warning System',
    context: `Regional Medical Centre is a 600-bed acute care hospital with an 80-bed ICU staffed by rotating teams of intensivists, residents, and nurses. The hospital runs on the Epic electronic health record (EHR) platform, which logs patient vitals every 15 minutes, lab results, medication orders, and free-text clinical notes. Roughly 4,200 ICU admissions occur annually.

Approximately 12.5% of ICU patients experience at least one unexpected deterioration event during their stay — sepsis, respiratory failure, or cardiac arrest requiring emergency intervention. Research on comparable ICUs suggests that the physiological signals preceding many of these events are already present in EHR data 4–8 hours before a crisis is declared.

Current process: Nurses assess each patient visually every 2–4 hours and rely on bedside monitors that trigger single-parameter alarms (e.g. SpO₂ below 90%). No system aggregates multi-parameter trends or computes a patient-level deterioration risk score between rounds. On average, deterioration is identified approximately 45 minutes after the first warning signal appears in the EHR.`,
    situation: `Clinical staff have raised concerns about unexpected patient deterioration events in the ICU — sudden episodes of sepsis, respiratory failure, and cardiac arrest that require emergency intervention. These events are costly, traumatic for patients and families, and many are believed preventable with earlier clinical action. The hospital wants to explore whether the information already captured in Epic could enable earlier, systematic identification of patients trending toward a crisis — giving nurses and physicians time to intervene proactively rather than reactively.`,
    stakeholders: [
      {
        role: 'ICU Head Nurse',
        description: 'Manages a rotating team of 20 nurses. Each nurse typically covers 2–3 patients per shift. Responsible for escalating concerns to physicians and ensuring care protocols are followed. A key concern is alert fatigue — too many false alarms will cause staff to ignore the system. Limited time during shift handovers to review detailed histories.',
      },
      {
        role: 'Attending Intensivist',
        description: 'Senior physicians responsible for final clinical decisions in the ICU. Often cover multiple wards simultaneously. Conduct formal rounds twice daily; rely on nurses to flag deterioration between rounds. Need to trust and be able to explain any AI-generated alert.',
      },
      {
        role: 'Chief Medical Officer (CMO)',
        description: 'Oversees clinical quality, patient safety programmes, and regulatory compliance. Reports monthly mortality and adverse event rates to the hospital board and the national health authority. Accountable for any regulatory issues arising from AI-assisted clinical tools.',
      },
      {
        role: 'IT & Data Engineering Team',
        description: 'Maintains the Epic EHR system and internal data warehouse. Responsible for system integrations, data pipelines, and ensuring patient data governance policies are upheld. All data must remain within the hospital network.',
      },
    ],
  },
  {
    id: 'finance',
    domain: 'Finance',
    color: 'indigo',
    title: 'AML Alert Triage System',
    context: `Helvetia Wealth Management is a Swiss private bank with CHF 28B AUM, operating in Zurich, Geneva, and Lugano. Their Financial Crime Compliance (FCC) team handles Anti-Money Laundering (AML) obligations under FINMA and EU directives. The bank processes approximately 80,000 transactions per day and runs Actimize SAFE for automated transaction monitoring.

Current process: Actimize generates approximately 400 transaction monitoring alerts per day based on rule-based scenario models (velocity checks, geographic risk flags, amount thresholds). AML investigators manually review every alert in a first-in, first-out queue. Each review takes 45–90 minutes. Only about 5% of alerts (~20 per day) are escalated as Suspicious Activity Reports (SARs) — the remaining 95% are closed as false positives. FINMA expects substantive written analysis behind every alert closure. The bank employs 24 AML investigators.`,
    situation: `The 95% false positive rate is causing severe investigator burnout and declining review quality — at current volume, investigators are at capacity. FINMA expects rigorous analysis behind every alert disposition, but investigators are spending most of their time closing obvious false positives. Hiring additional investigators is not feasible in the near term. The bank has 2+ years of historical investigator dispositions stored in Actimize and wants to explore whether this data could be used to intelligently prioritise the alert queue — routing the highest-risk cases to senior investigators first, so that genuine suspicious activity is never missed due to queue overload.`,
    stakeholders: [
      {
        role: 'Head of Financial Crime Compliance',
        description: 'Owns the alert triage process and is accountable to FINMA for investigation quality. Responsible for SAR filings and maintaining a defensible audit trail. Concerned about missing genuine suspicious activity due to investigator fatigue.',
      },
      {
        role: 'AML Investigators',
        description: '24 compliance analysts who manually review every Actimize alert. Primary users of any new triage tool. Currently spending ~90% of their time closing false positives. Need clear reasoning behind any AI-driven prioritisation to write defensible closure notes.',
      },
      {
        role: 'Chief Compliance Officer',
        description: 'Approves changes to the investigation workflow and is the main point of contact for FINMA examinations. Accountable if the bank fails to detect genuine money laundering. Will not approve any tool that reduces investigator oversight.',
      },
      {
        role: 'IT & Data Architecture Team',
        description: 'Maintains the Actimize integration, core banking (T24) data warehouse, and compliance data stores. Governs access to AML data — all processing must remain on-premise.',
      },
    ],
  },
  {
    id: 'services',
    domain: 'Services Business',
    color: 'amber',
    title: 'Customer Churn Prevention',
    context: `Claros Analytics is a B2B SaaS company providing business intelligence dashboards to 3,200 enterprise clients across Europe and North America. The Customer Success (CS) team has 28 people and the Account Executive team has 35. Annual recurring revenue is CHF 42M; the average contract is worth approximately CHF 13,100 ARR. Each CS manager handles roughly 110 accounts.

Client behavioural data — login frequency, feature usage, support ticket volume, and NPS scores — is stored in a Snowflake data warehouse, updated nightly.

Current process: CS managers manually review accounts flagged by account executives or identified through periodic NPS surveys. There is no systematic prioritisation tool. The team cannot proactively outreach to all 3,200 accounts — capacity allows for roughly 15% of the client base to receive proactive attention in any given quarter.

Annual churn rate has risen from 8% two years ago to 12% today. Post-cancellation interviews reveal that many churned clients showed clear signs of disengagement in the behavioural data 6–8 weeks before their renewal date — but the CS team was not aware in time to intervene.`,
    situation: `The company is losing more clients at renewal than in previous years — churn has risen from 8% to 12%, representing approximately CHF 5M in lost ARR annually. Post-cancellation interviews show that warning signs were present in the data weeks before renewal, but the CS team lacked a systematic way to identify which of their 3,200 accounts were at risk. Given the team-to-account ratio, proactive outreach cannot be applied to everyone — the team needs a way to prioritise which clients need urgent attention. Leadership wants to explore whether the available behavioural data can reliably identify at-risk accounts far enough in advance for meaningful intervention.`,
    stakeholders: [
      {
        role: 'VP of Customer Success',
        description: 'Manages the CS team and owns net revenue retention targets. Allocates CS capacity across the client base and decides which accounts receive proactive outreach. Reports churn rate and expansion revenue to the CEO quarterly.',
      },
      {
        role: 'Account Executives',
        description: 'Own client relationships post-sale. Responsible for renewals and upsell opportunities. Typically manage 90–120 accounts each and rely on CS handoffs to flag at-risk clients.',
      },
      {
        role: 'Head of Product',
        description: 'Uses product engagement data to inform the roadmap. Interested in which features correlate with client retention and which are underused by clients who churn.',
      },
      {
        role: 'Data Engineering Team',
        description: 'Maintains the Snowflake data warehouse and ETL pipelines. Owns data quality standards and controls access to client behavioural data.',
      },
    ],
  },
  // Hidden — only used for the /prefilled instructor example, not shown to students
  {
    id: 'loan',
    domain: 'Finance',
    color: 'indigo',
    title: 'Loan Default Risk Assessment',
    context: `SwissCredit Bank AG is a retail and commercial bank headquartered in Zurich, operating across Switzerland and three EU member states. It processes approximately 50,000 personal loan applications per month via branch loan officers and an online portal. The bank holds 10 years of historical loan application and repayment data in its core banking system (Temenos T24).

Current process: Loan officers manually review each application against a fixed points-based scorecard and cross-reference credit bureau reports. Borderline cases are escalated to a credit committee, adding 2 further business days. End-to-end median decision time is 3–5 business days. Digital-native lenders have entered the Swiss market offering decisions in under 2 hours, and the bank has observed a 35% drop-off rate among qualified applicants who abandon the application before a decision is issued.

The bank has indicated it will make its full historical loan dataset available for this project if needed.`,
    situation: `The bank's slow, manual assessment process is losing qualified customers to faster digital competitors — a 35% applicant drop-off rate represents a material revenue impact. Leadership wants to explore whether the bank's historical data could improve the speed and consistency of credit decisions without compromising risk management standards. The bank has already indicated it will make its historical data available if needed; the question is how to use it effectively.`,
    stakeholders: [
      {
        role: 'Chief Risk Officer (CRO)',
        description: 'Owns the bank\'s credit risk framework. Approves changes to underwriting policies. Reports credit loss provisions and portfolio quality to the board and FINMA. Accountable if new approaches increase default rates.',
      },
      {
        role: 'Head of Retail Banking',
        description: 'Responsible for the personal loan product line — pricing, volume targets, and customer experience. Tracks application-to-approval conversion rates and time-to-decision as core operational metrics.',
      },
      {
        role: 'Compliance & Legal Officer',
        description: 'Ensures lending practices comply with FINMA guidelines, the EU AI Act, GDPR, and revFADP. Reviews any new decisioning tools for regulatory risk before deployment.',
      },
      {
        role: 'Loan Officers',
        description: 'Front-line staff who manage the application pipeline. Currently spend significant time on manual data entry and scoring. Handle customer questions and are required to explain outcomes to applicants on request.',
      },
    ],
  },
]
