export type AiChatIntent =
  | 'history_summary'
  | 'medication_question'
  | 'lab_question'
  | 'doctor_matching'
  | 'booking_support'
  | 'previsit_assessment'
  | 'symptom_question'
  | 'general_health';

export type EvidenceSourceType =
  | 'condition'
  | 'allergy'
  | 'medication'
  | 'appointment'
  | 'consultation_note'
  | 'lab_result'
  | 'patient_memory';

export interface RetrievalPlan {
  intent: AiChatIntent;
  sourceTargets: EvidenceSourceType[];
  expandedTerms: string[];
  historyHintPresent: boolean;
  recommendedSpecialty: string | null;
}

export interface EvidenceItem {
  sourceType: EvidenceSourceType;
  sourceId: string;
  title: string;
  excerpt: string;
  eventDate: string | null;
  tags: string[];
  score: number;
  whyRelevant: string;
}

export interface ConditionRecord {
  id: string;
  conditionName: string;
  status: string | null;
  diagnosedDate: string | null;
  notes: string | null;
}

export interface AllergyRecord {
  id: string;
  allergen: string;
  severity: string | null;
  reaction: string | null;
}

export interface PrescriptionRecord {
  id: string;
  status: string;
  prescribedAt: string;
  items: Array<{
    id: string;
    medicationName: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
    isDispensed: boolean;
  }>;
}

export interface AppointmentRecord {
  id: string;
  status: string;
  scheduledAt: string;
  chiefComplaint: string | null;
  notes: string | null;
  doctorSummary: string | null;
  doctorPlan: string | null;
  doctorSubjective: string | null;
}

export interface LabResultRecord {
  id: string;
  orderedAt: string;
  status: string;
  testName: string;
  resultValue: string | null;
  resultUnit: string | null;
  referenceRange: string | null;
  isAbnormal: boolean | null;
  resultedAt: string | null;
}

export interface PatientMemoryRecord {
  id: string;
  memoryKey: string;
  label: string;
  valueText: string | null;
  valueJson: unknown;
  status: 'suggested' | 'confirmed';
  sourceKind: 'pre_visit_answer' | 'ai_chat_message';
  createdAt: string;
  confirmedAt: string | null;
}

export interface PatientRetrievalBundle {
  conditions: ConditionRecord[];
  allergies: AllergyRecord[];
  prescriptions: PrescriptionRecord[];
  appointments: AppointmentRecord[];
  labResults: LabResultRecord[];
  memoryFacts: PatientMemoryRecord[];
}

const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'after',
  'all',
  'am',
  'as',
  'at',
  'be',
  'before',
  'by',
  'can',
  'do',
  'for',
  'from',
  'get',
  'going',
  'have',
  'how',
  'i',
  'if',
  'in',
  'is',
  'it',
  'me',
  'my',
  'of',
  'on',
  'or',
  'should',
  'so',
  'tell',
  'that',
  'the',
  'their',
  'them',
  'to',
  'what',
  'when',
  'where',
  'which',
  'why',
  'with',
  'would',
  'you',
  'your',
]);

const TERM_EXPANSIONS: Array<{ terms: string[]; expansions: string[] }> = [
  { terms: ['headache', 'headaches', 'migraine', 'head pain'], expansions: ['neurology', 'dizziness', 'headache', 'migraine'] },
  {
    terms: ['abdominal pain', 'abdomen', 'abdominal', 'stomach pain', 'stomach ache', 'bloating', 'bloated'],
    expansions: ['abdominal', 'stomach', 'bloating', 'general practice'],
  },
  {
    terms: ['blood sugar', 'diabetes', 'glucose', 'hba1c', 'metformin'],
    expansions: ['diabetes', 'glucose', 'hba1c', 'metformin'],
  },
  {
    terms: ['cholesterol', 'ldl', 'lipid', 'statin'],
    expansions: ['cholesterol', 'ldl', 'lipid', 'heart', 'cardiology'],
  },
  {
    terms: ['pressure', 'hypertension', 'blood pressure', 'bp'],
    expansions: ['hypertension', 'blood pressure', 'bp'],
  },
  {
    terms: ['allergy', 'allergies', 'allergic', 'rash', 'hives'],
    expansions: ['allergy', 'allergies', 'rash', 'hives', 'reaction'],
  },
  {
    terms: ['appointment', 'visit', 'doctor', 'specialist', 'book', 'booking'],
    expansions: ['appointment', 'visit', 'doctor', 'specialist', 'book'],
  },
  {
    terms: ['lab', 'result', 'test', 'blood work', 'screening'],
    expansions: ['lab', 'result', 'test', 'screening', 'blood work'],
  },
];

const SPECIALTY_RULES: Array<{ specialty: string; terms: string[] }> = [
  { specialty: 'Neurology', terms: ['headache', 'migraine', 'dizziness', 'seizure'] },
  { specialty: 'Cardiology', terms: ['cholesterol', 'blood pressure', 'hypertension', 'chest pain', 'palpitations'] },
  { specialty: 'Endocrinology', terms: ['diabetes', 'glucose', 'hba1c', 'thyroid'] },
  { specialty: 'Dermatology', terms: ['rash', 'eczema', 'acne', 'skin', 'allergy'] },
  {
    specialty: 'General Practice',
    terms: ['fatigue', 'follow-up', 'checkup', 'general', 'abdominal', 'abdomen', 'stomach', 'bloating'],
  },
];

const INTENT_SOURCE_WEIGHTS: Record<AiChatIntent, Partial<Record<EvidenceSourceType, number>>> = {
  history_summary: {
    condition: 20,
    allergy: 16,
    medication: 18,
    appointment: 16,
    consultation_note: 18,
    lab_result: 16,
    patient_memory: 14,
  },
  medication_question: {
    medication: 26,
    condition: 14,
    allergy: 18,
    consultation_note: 10,
    lab_result: 8,
    patient_memory: 12,
  },
  lab_question: {
    lab_result: 28,
    condition: 16,
    medication: 12,
    appointment: 10,
    patient_memory: 10,
  },
  doctor_matching: {
    appointment: 14,
    condition: 18,
    consultation_note: 14,
    lab_result: 8,
    patient_memory: 10,
  },
  booking_support: {
    appointment: 14,
    condition: 12,
    consultation_note: 12,
    patient_memory: 8,
  },
  previsit_assessment: {
    appointment: 20,
    condition: 16,
    medication: 14,
    allergy: 14,
    consultation_note: 16,
    lab_result: 12,
    patient_memory: 18,
  },
  symptom_question: {
    appointment: 22,
    consultation_note: 20,
    condition: 18,
    medication: 16,
    lab_result: 14,
    allergy: 10,
    patient_memory: 18,
  },
  general_health: {
    condition: 12,
    medication: 10,
    appointment: 8,
    lab_result: 8,
    patient_memory: 10,
  },
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string) =>
  normalize(value)
    .split(' ')
    .flatMap((token) => {
      if (token.length <= 2 || STOP_WORDS.has(token)) {
        return [];
      }

      const singularToken = token.endsWith('s') && token.length > 4 ? token.slice(0, -1) : null;
      return singularToken ? [token, singularToken] : [token];
    });

const getRecencyScore = (dateValue: string | null) => {
  if (!dateValue) {
    return 0;
  }

  const eventDate = new Date(dateValue);
  const now = new Date();
  const ageInDays = Math.max(0, (now.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

  if (ageInDays <= 30) {
    return 12;
  }

  if (ageInDays <= 180) {
    return 8;
  }

  if (ageInDays <= 365) {
    return 4;
  }

  return 2;
};

const getIntent = (message: string): AiChatIntent => {
  const normalizedMessage = normalize(message);

  if (normalizedMessage.includes('pre visit') || normalizedMessage.includes('pre-visit')) {
    return 'previsit_assessment';
  }

  if (
    normalizedMessage.includes('history') ||
    (normalizedMessage.includes('summary') &&
      (normalizedMessage.includes('record') || normalizedMessage.includes('history')))
  ) {
    return 'history_summary';
  }

  if (
    normalizedMessage.includes('medication') ||
    normalizedMessage.includes('medicine') ||
    normalizedMessage.includes('prescription') ||
    normalizedMessage.includes('side effect')
  ) {
    return 'medication_question';
  }

  if (
    normalizedMessage.includes('lab') ||
    normalizedMessage.includes('test result') ||
    normalizedMessage.includes('blood work') ||
    normalizedMessage.includes('cholesterol') ||
    normalizedMessage.includes('hba1c')
  ) {
    return 'lab_question';
  }

  if (
    normalizedMessage.includes('book') ||
    normalizedMessage.includes('appointment') ||
    normalizedMessage.includes('schedule') ||
    normalizedMessage.includes('see a doctor')
  ) {
    return 'booking_support';
  }

  if (
    normalizedMessage.includes('specialist') ||
    normalizedMessage.includes('which doctor') ||
    normalizedMessage.includes('what doctor') ||
    normalizedMessage.includes('find doctor')
  ) {
    return 'doctor_matching';
  }

  if (
    normalizedMessage.includes('pain') ||
    normalizedMessage.includes('symptom') ||
    normalizedMessage.includes('headache') ||
    normalizedMessage.includes('rash') ||
    normalizedMessage.includes('dizzy') ||
    normalizedMessage.includes('fatigue')
  ) {
    return 'symptom_question';
  }

  return 'general_health';
};

export function planPatientRetrieval(message: string, recentUserMessages: string[] = []): RetrievalPlan {
  const intent = getIntent(message);
  const baseTokens = [...tokenize(message), ...recentUserMessages.flatMap((item) => tokenize(item))];
  const expandedTerms = new Set(baseTokens);
  const normalizedMessage = normalize(message);

  for (const rule of TERM_EXPANSIONS) {
    if (rule.terms.some((term) => normalizedMessage.includes(normalize(term)))) {
      for (const expansion of rule.expansions) {
        expandedTerms.add(normalize(expansion));
      }
    }
  }

  const recommendedSpecialty =
    SPECIALTY_RULES.find((rule) =>
      rule.terms.some((term) => normalizedMessage.includes(normalize(term)) || expandedTerms.has(normalize(term)))
    )?.specialty ?? null;

  const historyHintPresent = normalizedMessage.includes('history') || normalizedMessage.includes('previous');

  return {
    intent,
    sourceTargets: Object.entries(INTENT_SOURCE_WEIGHTS[intent])
      .filter(([, weight]) => Boolean(weight))
      .map(([sourceType]) => sourceType as EvidenceSourceType),
    expandedTerms: Array.from(expandedTerms),
    historyHintPresent,
    recommendedSpecialty,
  };
}

export function buildEvidenceItems(bundle: PatientRetrievalBundle, plan: RetrievalPlan): EvidenceItem[] {
  const candidates: EvidenceItem[] = [];

  const scoreText = (text: string, tags: string[], sourceType: EvidenceSourceType, eventDate: string | null, bonus = 0) => {
    const normalizedText = normalize(text);
    const normalizedTags = tags.map((tag) => normalize(tag));
    const matchingTerms = plan.expandedTerms.filter(
      (term) => normalizedText.includes(term) || normalizedTags.some((tag) => tag.includes(term))
    );
    const sourceWeight = INTENT_SOURCE_WEIGHTS[plan.intent][sourceType] ?? 0;
    const termScore = matchingTerms.length * 10;
    const recencyScore = getRecencyScore(eventDate);
    const score = sourceWeight + termScore + recencyScore + bonus;

    return {
      score,
      matchingTerms,
    };
  };

  for (const condition of bundle.conditions) {
    const { score, matchingTerms } = scoreText(
      `${condition.conditionName} ${condition.status ?? ''} ${condition.notes ?? ''}`,
      [condition.conditionName, condition.status ?? ''],
      'condition',
      condition.diagnosedDate,
      condition.status === 'active' ? 8 : 0
    );

    candidates.push({
      sourceType: 'condition',
      sourceId: condition.id,
      title: condition.conditionName,
      excerpt: `${condition.status ?? 'Status not recorded'}${condition.notes ? ` — ${condition.notes}` : ''}`,
      eventDate: condition.diagnosedDate,
      tags: [condition.conditionName, condition.status ?? ''].filter(Boolean),
      score,
      whyRelevant: matchingTerms.length > 0 ? `Matched ${matchingTerms.join(', ')}` : 'Included from patient history',
    });
  }

  for (const allergy of bundle.allergies) {
    const { score, matchingTerms } = scoreText(
      `${allergy.allergen} ${allergy.reaction ?? ''} ${allergy.severity ?? ''}`,
      [allergy.allergen, allergy.reaction ?? '', allergy.severity ?? ''],
      'allergy',
      null,
      allergy.severity === 'severe' ? 8 : 0
    );

    candidates.push({
      sourceType: 'allergy',
      sourceId: allergy.id,
      title: allergy.allergen,
      excerpt: `${allergy.severity ?? 'Severity not recorded'}${allergy.reaction ? ` — ${allergy.reaction}` : ''}`,
      eventDate: null,
      tags: [allergy.allergen, allergy.reaction ?? '', allergy.severity ?? ''].filter(Boolean),
      score,
      whyRelevant: matchingTerms.length > 0 ? `Matched ${matchingTerms.join(', ')}` : 'Known allergy context',
    });
  }

  for (const prescription of bundle.prescriptions) {
    for (const item of prescription.items) {
      const { score, matchingTerms } = scoreText(
        `${item.medicationName} ${item.dosage ?? ''} ${item.frequency ?? ''} ${item.instructions ?? ''}`,
        [item.medicationName, prescription.status, item.instructions ?? ''],
        'medication',
        prescription.prescribedAt,
        prescription.status === 'active' ? 10 : 0
      );

      candidates.push({
        sourceType: 'medication',
        sourceId: item.id,
        title: item.medicationName,
        excerpt: [item.dosage, item.frequency, item.duration, item.instructions].filter(Boolean).join(' • '),
        eventDate: prescription.prescribedAt,
        tags: [item.medicationName, prescription.status, item.instructions ?? ''].filter(Boolean),
        score,
        whyRelevant: matchingTerms.length > 0 ? `Matched ${matchingTerms.join(', ')}` : 'Medication history',
      });
    }
  }

  for (const appointment of bundle.appointments) {
    const appointmentText = [
      appointment.chiefComplaint ?? '',
      appointment.notes ?? '',
      appointment.doctorSummary ?? '',
      appointment.doctorPlan ?? '',
      appointment.doctorSubjective ?? '',
    ].join(' ');
    const { score, matchingTerms } = scoreText(
      appointmentText,
      [appointment.chiefComplaint ?? '', appointment.status],
      'appointment',
      appointment.scheduledAt,
      appointment.status === 'scheduled' ? 4 : 0
    );

    candidates.push({
      sourceType: appointment.doctorSummary || appointment.doctorPlan ? 'consultation_note' : 'appointment',
      sourceId: appointment.id,
      title: appointment.chiefComplaint || 'Clinical appointment',
      excerpt: [appointment.doctorSummary, appointment.doctorPlan, appointment.notes].filter(Boolean).join(' • '),
      eventDate: appointment.scheduledAt,
      tags: [appointment.chiefComplaint ?? '', appointment.status].filter(Boolean),
      score,
      whyRelevant: matchingTerms.length > 0 ? `Matched ${matchingTerms.join(', ')}` : 'Related appointment history',
    });
  }

  for (const labResult of bundle.labResults) {
    const { score, matchingTerms } = scoreText(
      `${labResult.testName} ${labResult.resultValue ?? ''} ${labResult.referenceRange ?? ''}`,
      [labResult.testName, labResult.resultValue ?? '', labResult.referenceRange ?? ''],
      'lab_result',
      labResult.resultedAt ?? labResult.orderedAt,
      labResult.isAbnormal ? 10 : 0
    );

    candidates.push({
      sourceType: 'lab_result',
      sourceId: labResult.id,
      title: labResult.testName,
      excerpt: [
        labResult.resultValue ? `${labResult.resultValue}${labResult.resultUnit ? ` ${labResult.resultUnit}` : ''}` : 'Pending result',
        labResult.referenceRange ? `Range ${labResult.referenceRange}` : null,
        labResult.isAbnormal ? 'Abnormal result' : null,
      ]
        .filter(Boolean)
        .join(' • '),
      eventDate: labResult.resultedAt ?? labResult.orderedAt,
      tags: [labResult.testName, labResult.resultValue ?? '', labResult.referenceRange ?? ''].filter(Boolean),
      score,
      whyRelevant: matchingTerms.length > 0 ? `Matched ${matchingTerms.join(', ')}` : 'Relevant lab context',
    });
  }

  for (const memoryFact of bundle.memoryFacts) {
    const memoryText =
      typeof memoryFact.valueText === 'string' && memoryFact.valueText.trim()
        ? memoryFact.valueText
        : Array.isArray(memoryFact.valueJson)
          ? memoryFact.valueJson.join(', ')
          : typeof memoryFact.valueJson === 'string'
            ? memoryFact.valueJson
            : '';
    const { score, matchingTerms } = scoreText(
      `${memoryFact.label} ${memoryFact.memoryKey} ${memoryText}`,
      [memoryFact.label, memoryFact.memoryKey, memoryText],
      'patient_memory',
      memoryFact.confirmedAt ?? memoryFact.createdAt,
      memoryFact.status === 'confirmed' ? 8 : 2
    );

    candidates.push({
      sourceType: 'patient_memory',
      sourceId: memoryFact.id,
      title: memoryFact.label,
      excerpt: memoryText || 'Patient-stated detail',
      eventDate: memoryFact.confirmedAt ?? memoryFact.createdAt,
      tags: [memoryFact.label, memoryFact.memoryKey].filter(Boolean),
      score,
      whyRelevant:
        matchingTerms.length > 0
          ? `Matched ${matchingTerms.join(', ')}`
          : memoryFact.status === 'confirmed'
            ? 'Reusable patient-confirmed detail'
            : 'Patient-stated detail from earlier chat',
    });
  }

  return candidates
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 6);
}

export function createPromptContext(args: {
  plan: RetrievalPlan;
  evidence: EvidenceItem[];
  bundle: PatientRetrievalBundle;
}) {
  const activeConditions = args.bundle.conditions.filter((condition) => condition.status === 'active');
  const activeMedications = args.bundle.prescriptions
    .filter((prescription) => prescription.status === 'active')
    .flatMap((prescription) => prescription.items.map((item) => item.medicationName));
  const confirmedMemory = args.bundle.memoryFacts
    .filter((fact) => fact.status === 'confirmed')
    .slice(0, 4)
    .map((fact) => `${fact.label}: ${fact.valueText ?? (Array.isArray(fact.valueJson) ? fact.valueJson.join(', ') : 'recorded')}`);

  const evidenceText =
    args.evidence.length > 0
      ? args.evidence
          .map(
            (evidence, index) =>
              `${index + 1}. [${evidence.sourceType}] ${evidence.title}${evidence.eventDate ? ` (${evidence.eventDate})` : ''} — ${evidence.excerpt}`
          )
          .join('\n')
      : 'No strongly matched history items were found. Use only the patient summary below if it is relevant.';

  return [
    `INTENT: ${args.plan.intent}`,
    `EXPANDED TERMS: ${args.plan.expandedTerms.join(', ') || 'none'}`,
    `PATIENT SUMMARY: active conditions = ${activeConditions.map((item) => item.conditionName).join(', ') || 'none'}; known allergies = ${
      args.bundle.allergies.map((item) => item.allergen).join(', ') || 'none'
    }; active medications = ${activeMedications.join(', ') || 'none'}; reusable patient details = ${
      confirmedMemory.join('; ') || 'none'
    }.`,
    'TOP RELEVANT HISTORY:',
    evidenceText,
  ].join('\n');
}

export function createSuggestedActions(args: {
  plan: RetrievalPlan;
  nextAppointmentId: string | null;
  recommendedSpecializationId: string | null;
  reason: string;
}) {
  const encodedReason = encodeURIComponent(args.reason);
  const actions: Array<{ label: string; href: string }> = [];

  if (
    args.plan.intent === 'booking_support' ||
    args.plan.intent === 'doctor_matching' ||
    args.plan.intent === 'symptom_question'
  ) {
    const specializationQuery = args.recommendedSpecializationId
      ? `&specialization=${encodeURIComponent(args.recommendedSpecializationId)}`
      : '';

    actions.push({
      label: args.plan.recommendedSpecialty
        ? `Book a ${args.plan.recommendedSpecialty} visit`
        : 'Book an appointment',
      href: `/patient/appointments/book?reason=${encodedReason}${specializationQuery}`,
    });
  }

  return actions;
}
