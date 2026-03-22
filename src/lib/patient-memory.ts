import type {
  PatientMemorySourceKind,
  PatientMemoryStatus,
  PatientMemoryValueType,
  PreVisitQuestionType,
} from '../types';

export interface PatientMemoryFactRecord {
  id: string;
  patientId: string;
  sourceKind: PatientMemorySourceKind;
  sourceRecordId: string;
  memoryKey: string;
  label: string;
  valueType: PatientMemoryValueType;
  valueText: string | null;
  valueJson: unknown;
  status: PatientMemoryStatus;
  confidence: number;
  usableInChat: boolean;
  usableInForms: boolean;
  confirmedAt: string | null;
  lastUsedAt: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ResolvedPatientMemoryFact extends PatientMemoryFactRecord {
  sourceLabel: string;
  autofillSource: string;
}

const MEMORY_KEY_RULES: Array<{ memoryKey: string; patterns: RegExp[] }> = [
  {
    memoryKey: 'symptom_duration',
    patterns: [/how long/i, /\bduration\b/i, /how many (day|week|month|year)/i],
  },
  {
    memoryKey: 'symptom_onset',
    patterns: [/\bonset\b/i, /when did .* start/i, /when .* began/i, /started on/i],
  },
  {
    memoryKey: 'symptom_location',
    patterns: [/\blocation\b/i, /where is/i, /where do you feel/i, /which part of/i],
  },
  {
    memoryKey: 'symptom_severity_current',
    patterns: [/\bpain scale\b/i, /\bseverity now\b/i, /\bcurrent pain\b/i, /rate .* pain/i],
  },
  {
    memoryKey: 'symptom_severity_worst',
    patterns: [/\bworst pain\b/i, /\bhighest pain\b/i, /\bmaximum pain\b/i],
  },
  {
    memoryKey: 'associated_symptoms',
    patterns: [/\bassociated symptom/i, /\bother symptoms\b/i, /\baccompan(y|ied)/i],
  },
  {
    memoryKey: 'symptom_triggers',
    patterns: [/\btrigger/i, /what makes .* worse/i, /\bworsens\b/i],
  },
  {
    memoryKey: 'symptom_relievers',
    patterns: [/what makes .* better/i, /\brelieve/i, /\bhelps\b/i, /\bimprove/i],
  },
  {
    memoryKey: 'family_history',
    patterns: [/\bfamily history\b/i, /run in your family/i],
  },
  {
    memoryKey: 'surgical_history',
    patterns: [/\bsurgical history\b/i, /previous surgeries/i, /had surgery/i],
  },
  {
    memoryKey: 'social_history_smoking',
    patterns: [/\bsmok(e|ing)\b/i, /\btobacco\b/i],
  },
  {
    memoryKey: 'pregnancy_status',
    patterns: [/\bpregnan/i, /could you be pregnant/i],
  },
];

const normalizeTimestamp = (value: string | null) => (value ? new Date(value).getTime() : 0);

export const normalizePatientMemoryKey = (value: string) => {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || null;
};

export const inferPatientMemoryKey = (input: {
  label: string;
  helpText?: string | null;
  fallbackKey?: string | null;
  autofillSource?: string | null;
}): string | null => {
  if (input.autofillSource) {
    return null;
  }

  const combinedText = [input.label, input.helpText ?? '', input.fallbackKey ?? ''].join(' ').trim();

  for (const rule of MEMORY_KEY_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(combinedText))) {
      return rule.memoryKey;
    }
  }

  return normalizePatientMemoryKey(input.fallbackKey ?? input.label);
};

export const getPatientMemorySourceLabel = (fact: {
  sourceKind: PatientMemorySourceKind;
  status: PatientMemoryStatus;
}) => {
  if (fact.sourceKind === 'pre_visit_answer') {
    return 'From your previous answer';
  }

  return fact.status === 'confirmed' ? 'From earlier chat' : 'Suggested from earlier chat';
};

export const getPatientMemoryAutofillSource = (fact: {
  sourceKind: PatientMemorySourceKind;
  status: PatientMemoryStatus;
}) => `patient_memory.${fact.sourceKind}.${fact.status}`;

const getFactRank = (fact: PatientMemoryFactRecord) => {
  const statusRank = fact.status === 'confirmed' ? 2 : 1;
  const sourceRank = fact.sourceKind === 'pre_visit_answer' ? 2 : 1;
  const recencyRank = Math.max(
    normalizeTimestamp(fact.confirmedAt),
    normalizeTimestamp(fact.lastUsedAt),
    normalizeTimestamp(fact.updatedAt),
    normalizeTimestamp(fact.createdAt)
  );

  return {
    statusRank,
    sourceRank,
    recencyRank,
    confidence: fact.confidence,
  };
};

export const resolvePatientMemoryFacts = (facts: PatientMemoryFactRecord[]) => {
  const bestFactByKey = new Map<string, ResolvedPatientMemoryFact>();

  for (const fact of facts) {
    const current = bestFactByKey.get(fact.memoryKey);

    if (!current) {
      bestFactByKey.set(fact.memoryKey, {
        ...fact,
        sourceLabel: getPatientMemorySourceLabel(fact),
        autofillSource: getPatientMemoryAutofillSource(fact),
      });
      continue;
    }

    const nextRank = getFactRank(fact);
    const currentRank = getFactRank(current);
    const shouldReplace =
      nextRank.statusRank > currentRank.statusRank ||
      (nextRank.statusRank === currentRank.statusRank && nextRank.sourceRank > currentRank.sourceRank) ||
      (nextRank.statusRank === currentRank.statusRank &&
        nextRank.sourceRank === currentRank.sourceRank &&
        nextRank.confidence > currentRank.confidence) ||
      (nextRank.statusRank === currentRank.statusRank &&
        nextRank.sourceRank === currentRank.sourceRank &&
        nextRank.confidence === currentRank.confidence &&
        nextRank.recencyRank > currentRank.recencyRank);

    if (shouldReplace) {
      bestFactByKey.set(fact.memoryKey, {
        ...fact,
        sourceLabel: getPatientMemorySourceLabel(fact),
        autofillSource: getPatientMemoryAutofillSource(fact),
      });
    }
  }

  return bestFactByKey;
};

export const getPatientMemoryValue = (fact: Pick<PatientMemoryFactRecord, 'valueType' | 'valueText' | 'valueJson'>) => {
  if (fact.valueType === 'text_list' && Array.isArray(fact.valueJson)) {
    return fact.valueJson;
  }

  if (fact.valueType === 'boolean') {
    if (typeof fact.valueJson === 'boolean') {
      return fact.valueJson ? 'Yes' : 'No';
    }

    if (typeof fact.valueText === 'string' && fact.valueText.trim()) {
      return fact.valueText.trim();
    }
  }

  if (fact.valueType === 'json' && fact.valueJson !== null && fact.valueJson !== undefined) {
    return fact.valueJson;
  }

  if (fact.valueText && fact.valueText.trim()) {
    return fact.valueText.trim();
  }

  if (Array.isArray(fact.valueJson)) {
    return fact.valueJson;
  }

  if (typeof fact.valueJson === 'number' || typeof fact.valueJson === 'boolean') {
    return String(fact.valueJson);
  }

  return null;
};

export const buildPatientMemoryValue = (input: {
  questionType: PreVisitQuestionType;
  answerText: string | null;
  answerJson: unknown;
}) => {
  if (input.questionType === 'multi_select' && Array.isArray(input.answerJson)) {
    const values = input.answerJson.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);

    return {
      valueType: 'text_list' as const,
      valueText: values.join(', ') || null,
      valueJson: values,
    };
  }

  if (input.questionType === 'boolean') {
    const normalized = input.answerText?.trim().toLowerCase();

    if (normalized === 'yes' || normalized === 'true') {
      return {
        valueType: 'boolean' as const,
        valueText: 'Yes',
        valueJson: true,
      };
    }

    if (normalized === 'no' || normalized === 'false') {
      return {
        valueType: 'boolean' as const,
        valueText: 'No',
        valueJson: false,
      };
    }
  }

  if (input.questionType === 'number') {
    const trimmed = input.answerText?.trim() ?? '';
    const parsed = Number(trimmed);

    if (trimmed && Number.isFinite(parsed)) {
      return {
        valueType: 'number' as const,
        valueText: trimmed,
        valueJson: parsed,
      };
    }
  }

  if (input.questionType === 'date') {
    return {
      valueType: 'date' as const,
      valueText: input.answerText?.trim() || null,
      valueJson: input.answerText?.trim() || null,
    };
  }

  if (input.answerJson && !Array.isArray(input.answerJson) && typeof input.answerJson === 'object') {
    return {
      valueType: 'json' as const,
      valueText: input.answerText?.trim() || null,
      valueJson: input.answerJson,
    };
  }

  return {
    valueType: 'text' as const,
    valueText: input.answerText?.trim() || null,
    valueJson: input.answerJson ?? null,
  };
};
