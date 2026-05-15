import type { ProblemTemplate } from './types'

export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  {
    id: 'healthcare',
    domain: 'Healthcare',
    color: 'emerald',
    title: 'ICU Early Warning System',
    context: `Regional Medical Centre is a 600-bed acute care hospital. It operates an 80-bed ICU staffed by rotating teams of intensivists, residents, and nurses. The hospital runs on the Epic electronic health record (EHR) platform, which logs patient vitals every 15 minutes, lab results, medication orders, and free-text clinical notes. Roughly 4,200 ICU admissions occur annually.`,
    situation: `Clinical staff have raised concerns about unexpected patient deterioration events in the ICU — sudden episodes of sepsis, respiratory failure, and cardiac arrest that require emergency intervention. These events are costly, traumatic for patients and families, and some are believed preventable with earlier clinical action. The hospital wants to explore whether information already present in the EHR could enable earlier detection of patients trending toward a crisis, giving nurses and physicians time to intervene proactively.`,
    stakeholders: [
      {
        role: 'ICU Head Nurse',
        description: 'Manages a rotating team of 20 nurses. Each nurse typically covers 2–3 patients per shift. Responsible for escalating concerns to physicians and ensuring care protocols are followed. Limited time during shift handovers to review detailed histories.',
      },
      {
        role: 'Attending Intensivist',
        description: 'Senior physicians responsible for final clinical decisions in the ICU. Often cover multiple wards simultaneously. Conduct formal rounds twice daily; rely on nurses to flag deterioration between rounds.',
      },
      {
        role: 'Chief Medical Officer (CMO)',
        description: 'Oversees clinical quality, patient safety programmes, and regulatory compliance. Reports monthly mortality and adverse event rates to the hospital board and the national health authority.',
      },
      {
        role: 'IT & Data Engineering Team',
        description: 'Maintains the Epic EHR system and internal data warehouse. Responsible for system integrations, data pipelines, and ensuring patient data governance policies are upheld.',
      },
    ],
  },
  {
    id: 'finance',
    domain: 'Finance',
    color: 'indigo',
    title: 'Loan Default Risk Assessment',
    context: `SwissCredit Bank AG is a retail and commercial bank headquartered in Zurich, operating across Switzerland and three EU member states. It processes approximately 50,000 personal loan applications per month via branch loan officers and an online portal. The bank holds 10 years of historical loan application and repayment data in its core banking system.`,
    situation: `The bank's current assessment process has loan officers manually reviewing applications against a points-based scorecard and cross-referencing credit bureau reports. Borderline cases escalate to a credit committee, adding further delay. Digital-native lenders have entered the Swiss market offering decisions in minutes, and the bank has observed measurable application abandonment and customer attrition. Leadership wants to explore whether the bank's historical data can improve the speed and consistency of credit decisions without compromising risk management standards.`,
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
  {
    id: 'services',
    domain: 'Services Business',
    color: 'amber',
    title: 'Customer Churn Prevention',
    context: `Claros Analytics is a B2B SaaS company providing business intelligence dashboards to 3,200 enterprise clients across Europe and North America. The Customer Success team has 28 people and the Account Executive team has 35. Annual recurring revenue is CHF 42M. Client data — login frequency, feature usage, support ticket volume, and NPS scores — is stored in a Snowflake data warehouse, updated nightly.`,
    situation: `The company has seen an uptick in client churn at annual renewal. Post-cancellation interviews reveal that many churned clients showed signs of disengagement weeks or months before renewal, but the Customer Success team was not alerted in time to intervene. Given the size of the client base relative to the CS team, proactive outreach cannot be applied to all accounts — the team needs a way to prioritise which clients need attention. Leadership wants to explore whether available behavioural data can identify at-risk accounts significantly ahead of the renewal date.`,
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
]
