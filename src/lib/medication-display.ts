import type { TFunction } from 'i18next';
import { formatLocaleDecimal, formatLocaleDigits } from './i18n-ui';

const FREQUENCY_KEY: Record<string, string> = {
  'once daily': 'onceDaily',
  'twice daily': 'twiceDaily',
  'three times daily': 'threeTimesDaily',
  'four times daily': 'fourTimesDaily',
  'every 12 hours': 'every12Hours',
  'every 8 hours': 'every8Hours',
  'every 6 hours': 'every6Hours',
  'as needed': 'asNeeded',
  'as needed for pain': 'asNeededPain',
};

function translateFrequency(t: TFunction, raw: string): string | null {
  const leaf = FREQUENCY_KEY[raw.trim().toLowerCase()];
  if (!leaf) return null;
  const key = `patient.dashboard.medFreq.${leaf}`;
  const out = t(key);
  return out === key ? null : out;
}

function translateDuration(t: TFunction, language: string, raw: string): string | null {
  const trimmed = raw.trim();
  const days = trimmed.match(/^(\d+)\s*days?$/i);
  if (days) {
    const n = parseInt(days[1], 10);
    return t('patient.dashboard.medDurationDays', {
      count: formatLocaleDigits(n, language),
    });
  }
  const weeks = trimmed.match(/^(\d+)\s*weeks?$/i);
  if (weeks) {
    const n = parseInt(weeks[1], 10);
    return t('patient.dashboard.medDurationWeeks', {
      count: formatLocaleDigits(n, language),
    });
  }
  return null;
}

function translateDosage(t: TFunction, language: string, raw: string): string | null {
  const m = raw.trim().match(/^([\d.]+)\s*(mg|mcg|g|ml)$/i);
  if (!m) return null;
  const num = parseFloat(m[1]);
  const unit = m[2].toLowerCase();
  const unitKey =
    unit === 'mg'
      ? 'medUnitMg'
      : unit === 'mcg'
        ? 'medUnitMcg'
        : unit === 'g'
          ? 'medUnitG'
          : 'medUnitMl';
  const numStr = Number.isInteger(num)
    ? formatLocaleDigits(num, language)
    : formatLocaleDecimal(num, language, 1);
  return `${numStr}\u00A0${t(`patient.dashboard.${unitKey}`)}`;
}

export type MedicationDetailParts = {
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  /** Pre-joined English fallback from the server layer */
  detail: string;
  /** When set (e.g. from prescription_clinical_vocab), skips client frequency map */
  frequencyFromVocab?: string | null;
  /** When set, skips client duration parsing */
  durationFromVocab?: string | null;
};

/** Dashboard prescription reminder line: dosage • frequency • duration */
export const formatMedicationDetailLine = (
  t: TFunction,
  language: string,
  row: MedicationDetailParts
): string => {
  const parts: string[] = [];
  if (row.dosage) {
    parts.push(translateDosage(t, language, row.dosage) ?? row.dosage);
  }
  if (row.frequencyFromVocab) {
    parts.push(row.frequencyFromVocab);
  } else if (row.frequency) {
    parts.push(translateFrequency(t, row.frequency) ?? row.frequency);
  }
  if (row.durationFromVocab) {
    parts.push(row.durationFromVocab);
  } else if (row.duration) {
    parts.push(translateDuration(t, language, row.duration) ?? row.duration);
  }
  if (parts.length > 0) {
    return parts.join(' • ');
  }
  const fallbackEn = 'Active prescription';
  if (row.detail && row.detail !== fallbackEn) {
    return row.detail;
  }
  return t('patient.dashboard.medActiveFallback');
};
