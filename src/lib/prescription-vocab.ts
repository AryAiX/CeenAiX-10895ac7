export type PrescriptionClinicalVocabRow = {
  category: string;
  code: string;
  label_en: string;
  label_ar: string;
  legacy_match: string | null;
};

/** Pick localized label from DB-backed clinical vocabulary */
export const resolveClinicalVocabLabel = (
  rows: PrescriptionClinicalVocabRow[],
  category: 'frequency' | 'duration',
  code: string | null | undefined,
  rawText: string | null | undefined,
  language: string
): string | null => {
  const catRows = rows.filter((r) => r.category === category);
  const useAr = language.startsWith('ar');

  const codeTrimmed = code?.trim();
  if (codeTrimmed) {
    const hit = catRows.find((r) => r.code === codeTrimmed);
    if (hit) return useAr ? hit.label_ar : hit.label_en;
  }

  const raw = rawText?.trim();
  if (raw) {
    const lower = raw.toLowerCase();
    const hit = catRows.find(
      (r) => r.legacy_match && r.legacy_match.trim().toLowerCase() === lower
    );
    if (hit) return useAr ? hit.label_ar : hit.label_en;
  }

  return null;
};
