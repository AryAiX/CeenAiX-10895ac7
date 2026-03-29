import type { TFunction } from 'i18next';

export const INSURANCE_PLAN_ID_TO_SLUG: Record<string, string> = {
  '1': 'basicShield',
  '2': 'silverPlus',
  '3': 'goldPremium',
  '4': 'platinumElite',
  '5': 'diamondExecutive',
  '6': 'familyWellness',
};

export const insurancePlanSlug = (planId: string): string | undefined =>
  INSURANCE_PLAN_ID_TO_SLUG[planId];

export const displayInsurancePlanField = (
  t: TFunction,
  slug: string,
  field: string,
  fallback: string
): string => {
  const key = `insurancePage.plans.${slug}.${field}`;
  const out = t(key);
  return out === key ? fallback : out;
};

export const displayInsuranceFeature = (
  t: TFunction,
  slug: string,
  index: number,
  fallback: string
): string => {
  const key = `insurancePage.plans.${slug}.features.${index}`;
  const out = t(key);
  return out === key ? fallback : out;
};
