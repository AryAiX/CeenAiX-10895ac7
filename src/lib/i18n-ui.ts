import type { TFunction } from 'i18next';

export const formatRelativeTime = (t: TFunction, value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return t('shared.time.minutesAgo', { count: diffMinutes });
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return t('shared.time.hoursAgo', { count: diffHours });
  }

  const diffDays = Math.round(diffHours / 24);
  return t('shared.time.daysAgo', { count: diffDays });
};

export const appointmentTypeLabel = (t: TFunction, value: 'in_person' | 'virtual') =>
  value === 'in_person' ? t('shared.appointmentType.inPerson') : t('shared.appointmentType.virtual');

export const appointmentStatusLabel = (t: TFunction, status: string) => {
  const key = `shared.appointmentStatus.${status}`;
  const label = t(key);
  return label === key ? status.replace(/_/g, ' ') : label;
};

export const preVisitStatusLabel = (t: TFunction, status: string) => {
  const key = `shared.preVisitStatus.${status}`;
  const label = t(key);
  return label === key ? status : label;
};

export const prescriptionStatusLabel = (t: TFunction, status: string) => {
  const key = `shared.prescriptionStatus.${status}`;
  const label = t(key);
  return label === key ? status.replace(/_/g, ' ') : label;
};

export const calendarWeekdayShort = (t: TFunction) =>
  [
    t('shared.weekdays.sun'),
    t('shared.weekdays.mon'),
    t('shared.weekdays.tue'),
    t('shared.weekdays.wed'),
    t('shared.weekdays.thu'),
    t('shared.weekdays.fri'),
    t('shared.weekdays.sat'),
  ] as const;

export const resolveLocale = (language: string) => (language.startsWith('ar') ? 'ar-AE' : 'en-US');

/** Eastern Arabic-Indic digits (٠١٢…) when the UI language is Arabic */
export const usesArabicEasternNumerals = (language: string): boolean => language.startsWith('ar');

/** Merge Intl date/time options so numeric parts use Eastern Arabic-Indic digits in Arabic UI */
export const dateTimeFormatWithNumerals = (
  language: string,
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormatOptions => ({
  ...(options ?? {}),
  ...(usesArabicEasternNumerals(language) ? { numberingSystem: 'arab' as const } : {}),
});

/** Format integers for display (calendar day numbers, counts in JSX, etc.) */
export const formatLocaleDigits = (value: number, language: string): string => {
  if (!usesArabicEasternNumerals(language)) {
    return String(value);
  }
  try {
    return new Intl.NumberFormat('ar-AE', { numberingSystem: 'arab' }).format(value);
  } catch {
    return String(value);
  }
};
