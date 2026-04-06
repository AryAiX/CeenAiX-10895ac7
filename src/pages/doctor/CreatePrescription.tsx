import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Pill, Plus, Search, Trash2 } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { MedicationNameDisplay } from '../../components/MedicationNameDisplay';
import {
  useDoctorPatients,
  useMedicationCatalogSearch,
  useQuery,
} from '../../hooks';
import type {
  MedicationCatalog,
  MedicationCatalogSuggestion,
} from '../../types';
import { useAuth } from '../../lib/auth-context';
import {
  getMedicationCatalogDisplayNameAr,
  getMedicationCatalogDisplayNameEn,
  getMedicationSuggestionDisplayNameEn,
} from '../../lib/medication-catalog';
import {
  localizeMedicationDosageValue,
  normalizeMedicationDosageValue,
} from '../../lib/medication-display';
import { enrichMedicationCatalogEntry } from '../../lib/medication-enrichment';
import { resolveClinicalVocabLabel, type PrescriptionClinicalVocabRow } from '../../lib/prescription-vocab';
import { supabase } from '../../lib/supabase';

interface DraftPrescriptionItem {
  id: string;
  catalogSearch: string;
  medicationCatalogId: string | null;
  medicationCatalogSuggestionId: string | null;
  selectedCatalogGenericNameEn: string;
  selectedCatalogBrandNameEn: string;
  medicationName: string;
  medicationNameAr: string;
  dosage: string;
  frequencyCode: string;
  durationCode: string;
  quantity: string;
  instructions: string;
}

interface DraftNewMedicationSuggestion {
  genericNameEn: string;
  brandNameEn: string;
  displayNameAr: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
}

interface MedicationItemEditorProps {
  canRemove: boolean;
  durationOptions: PrescriptionClinicalVocabRow[];
  frequencyOptions: PrescriptionClinicalVocabRow[];
  item: DraftPrescriptionItem;
  index: number;
  onChange: (id: string, nextState: Partial<DraftPrescriptionItem>) => void;
  onRemove: (id: string) => void;
  uiLanguage: string;
  userId: string;
}

const createDraftPrescriptionItem = (): DraftPrescriptionItem => ({
  id: crypto.randomUUID(),
  catalogSearch: '',
  medicationCatalogId: null,
  medicationCatalogSuggestionId: null,
  selectedCatalogGenericNameEn: '',
  selectedCatalogBrandNameEn: '',
  medicationName: '',
  medicationNameAr: '',
  dosage: '',
  frequencyCode: '',
  durationCode: '',
  quantity: '',
  instructions: '',
});

const createDraftMedicationSuggestion = (genericNameEn = ''): DraftNewMedicationSuggestion => ({
  genericNameEn,
  brandNameEn: '',
  displayNameAr: '',
  strength: '',
  dosageForm: '',
  manufacturer: '',
});

const buildPendingSuggestionSelection = (
  suggestion: Pick<
    MedicationCatalogSuggestion,
    | 'id'
    | 'medication_catalog_id'
    | 'proposed_generic_name_en'
    | 'proposed_brand_name_en'
    | 'proposed_display_name_ar'
  >,
  fallbackCatalog?: MedicationCatalog | null
) => ({
  medicationCatalogId: suggestion.medication_catalog_id ?? fallbackCatalog?.id ?? null,
  medicationCatalogSuggestionId: suggestion.id,
  selectedCatalogGenericNameEn:
    suggestion.proposed_generic_name_en?.trim() || fallbackCatalog?.generic_name_en || '',
  selectedCatalogBrandNameEn:
    suggestion.proposed_brand_name_en?.trim() || fallbackCatalog?.brand_name_en || '',
  medicationName: getMedicationSuggestionDisplayNameEn(suggestion, fallbackCatalog),
  medicationNameAr:
    suggestion.proposed_display_name_ar?.trim() || getMedicationCatalogDisplayNameAr(fallbackCatalog ?? { display_name_ar: null }) || '',
});

const getCatalogSelectionDosage = (
  catalog: Pick<MedicationCatalog, 'strength'> | null | undefined,
  suggestion?: Pick<MedicationCatalogSuggestion, 'proposed_strength'> | null
) => suggestion?.proposed_strength?.trim() || catalog?.strength?.trim() || '';

const MedicationItemEditor: React.FC<MedicationItemEditorProps> = ({
  canRemove,
  durationOptions,
  frequencyOptions,
  item,
  index,
  onChange,
  onRemove,
  uiLanguage,
  userId,
}) => {
  const { t } = useTranslation('common');
  const [showTranslationForm, setShowTranslationForm] = useState(false);
  const [translationDraft, setTranslationDraft] = useState(item.medicationNameAr);
  const [showNewMedicationForm, setShowNewMedicationForm] = useState(false);
  const [newMedicationDraft, setNewMedicationDraft] = useState(createDraftMedicationSuggestion());
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [enrichingCatalogId, setEnrichingCatalogId] = useState<string | null>(null);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);
  const {
    data: searchResults,
    loading: searchLoading,
    refetch: refetchSearchResults,
  } = useMedicationCatalogSearch(userId, item.catalogSearch);

  const catalogMatches = useMemo(() => searchResults?.catalogMatches ?? [], [searchResults?.catalogMatches]);
  const pendingSuggestionMatches = useMemo(
    () => searchResults?.pendingSuggestionMatches ?? [],
    [searchResults?.pendingSuggestionMatches]
  );

  const pendingTranslationForSelectedCatalog =
    item.medicationCatalogId && !item.medicationCatalogSuggestionId
      ? pendingSuggestionMatches.find(
          (suggestion) =>
            suggestion.suggestion_type === 'translation' &&
            suggestion.medication_catalog_id === item.medicationCatalogId
        ) ?? null
      : null;
  const localizedDosageValue = localizeMedicationDosageValue(t, uiLanguage, item.dosage) ?? item.dosage;

  const clearSelection = () => {
    onChange(item.id, {
      catalogSearch: '',
      medicationCatalogId: null,
      medicationCatalogSuggestionId: null,
      selectedCatalogGenericNameEn: '',
      selectedCatalogBrandNameEn: '',
      medicationName: '',
      medicationNameAr: '',
    });
    setShowTranslationForm(false);
    setShowNewMedicationForm(false);
    setSuggestionError(null);
    setEnrichingCatalogId(null);
    setEnrichmentError(null);
  };

  const maybeEnrichCatalogMatch = async (
    catalogMatch: MedicationCatalog,
    preferredStrength?: string | null
  ) => {
    if (
      catalogMatch.source !== 'rxnorm' ||
      !catalogMatch.id ||
      (catalogMatch.enrichment_status === 'enriched' && catalogMatch.strength?.trim())
    ) {
      return;
    }

    setEnrichingCatalogId(catalogMatch.id);
    setEnrichmentError(null);

    try {
      const enrichedCatalog = await enrichMedicationCatalogEntry(catalogMatch.id);
      const nextDosage = preferredStrength?.trim() || enrichedCatalog.strength?.trim() || '';

      if (!item.dosage.trim() && nextDosage) {
        onChange(item.id, { dosage: nextDosage });
      }
    } catch (error) {
      setEnrichmentError(error instanceof Error ? error.message : t('doctor.createPrescription.enrichmentFailed'));
    } finally {
      setEnrichingCatalogId(null);
    }
  };

  const selectCatalogMatch = async (catalogMatch: MedicationCatalog) => {
    const nextDosage = getCatalogSelectionDosage(catalogMatch);
    onChange(item.id, {
      catalogSearch: getMedicationCatalogDisplayNameEn(catalogMatch),
      medicationCatalogId: catalogMatch.id,
      medicationCatalogSuggestionId: null,
      selectedCatalogGenericNameEn: catalogMatch.generic_name_en,
      selectedCatalogBrandNameEn: catalogMatch.brand_name_en?.trim() || '',
      medicationName: getMedicationCatalogDisplayNameEn(catalogMatch),
      medicationNameAr: getMedicationCatalogDisplayNameAr(catalogMatch) || '',
      dosage: item.dosage.trim() || nextDosage,
    });
    setTranslationDraft(getMedicationCatalogDisplayNameAr(catalogMatch) || '');
    setShowTranslationForm(false);
    setShowNewMedicationForm(false);
    setSuggestionError(null);
    setEnrichmentError(null);
    await maybeEnrichCatalogMatch(catalogMatch);
  };

  const selectPendingSuggestion = async (
    suggestion: Pick<
      MedicationCatalogSuggestion,
      | 'id'
      | 'medication_catalog_id'
      | 'proposed_generic_name_en'
      | 'proposed_brand_name_en'
      | 'proposed_display_name_ar'
      | 'proposed_strength'
    >,
    fallbackCatalog?: MedicationCatalog | null
  ) => {
    const nextDosage = getCatalogSelectionDosage(fallbackCatalog, suggestion);
    onChange(item.id, {
      catalogSearch: getMedicationSuggestionDisplayNameEn(suggestion, fallbackCatalog),
      ...buildPendingSuggestionSelection(suggestion, fallbackCatalog),
      dosage: item.dosage.trim() || nextDosage,
    });
    setTranslationDraft(suggestion.proposed_display_name_ar?.trim() || '');
    setShowTranslationForm(false);
    setShowNewMedicationForm(false);
    setSuggestionError(null);
    setEnrichmentError(null);

    if (fallbackCatalog) {
      await maybeEnrichCatalogMatch(fallbackCatalog, suggestion.proposed_strength);
    }
  };

  const submitTranslationSuggestion = async () => {
    if (!item.medicationCatalogId || !translationDraft.trim()) {
      setSuggestionError(t('doctor.createPrescription.translationRequired'));
      return;
    }

    setSubmittingSuggestion(true);
    setSuggestionError(null);

    const { data: insertedSuggestion, error } = await supabase
      .from('medication_catalog_suggestions')
      .insert({
        medication_catalog_id: item.medicationCatalogId,
        suggestion_type: 'translation',
        proposed_generic_name_en: item.selectedCatalogGenericNameEn || item.medicationName,
        proposed_brand_name_en: item.selectedCatalogBrandNameEn || null,
        proposed_display_name_ar: translationDraft.trim(),
        created_by: userId,
      })
      .select('*')
      .maybeSingle();

    setSubmittingSuggestion(false);

    if (error || !insertedSuggestion) {
      setSuggestionError(error?.message ?? t('doctor.createPrescription.suggestionSaveError'));
      return;
    }

    void selectPendingSuggestion(insertedSuggestion, {
      id: item.medicationCatalogId,
      source: 'rxnorm',
      source_code: null,
      generic_name_en: item.selectedCatalogGenericNameEn || item.medicationName,
      brand_name_en: item.selectedCatalogBrandNameEn || null,
      display_name_ar: null,
      strength: null,
      dosage_form: null,
      manufacturer: null,
      rxnorm_tty: null,
      ingredient_name_en: null,
      enrichment_status: 'pending',
      enrichment_error: null,
      last_enriched_at: null,
      is_active: true,
      is_custom: false,
      source_updated_at: null,
      last_synced_at: null,
      created_at: '',
      updated_at: '',
    });
    void refetchSearchResults();
  };

  const submitNewMedicationSuggestion = async () => {
    if (!newMedicationDraft.genericNameEn.trim()) {
      setSuggestionError(t('doctor.createPrescription.genericNameRequired'));
      return;
    }

    setSubmittingSuggestion(true);
    setSuggestionError(null);

    const { data: insertedSuggestion, error } = await supabase
      .from('medication_catalog_suggestions')
      .insert({
        suggestion_type: 'new_medication',
        proposed_generic_name_en: newMedicationDraft.genericNameEn.trim(),
        proposed_brand_name_en: newMedicationDraft.brandNameEn.trim() || null,
        proposed_display_name_ar: newMedicationDraft.displayNameAr.trim() || null,
        proposed_strength: newMedicationDraft.strength.trim() || null,
        proposed_dosage_form: newMedicationDraft.dosageForm.trim() || null,
        proposed_manufacturer: newMedicationDraft.manufacturer.trim() || null,
        created_by: userId,
      })
      .select('*')
      .maybeSingle();

    setSubmittingSuggestion(false);

    if (error || !insertedSuggestion) {
      setSuggestionError(error?.message ?? t('doctor.createPrescription.suggestionSaveError'));
      return;
    }

    void selectPendingSuggestion(insertedSuggestion, null);
    setShowNewMedicationForm(false);
    void refetchSearchResults();
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">
          {t('doctor.createPrescription.itemHeading', { count: index + 1 })}
        </h3>
        {canRemove ? (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('doctor.createPrescription.remove')}</span>
          </button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.searchMedication')}
          </span>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-4" />
            <input
              type="text"
              value={item.catalogSearch}
              onChange={(event) =>
                onChange(item.id, {
                  catalogSearch: event.target.value,
                  medicationCatalogId: null,
                  medicationCatalogSuggestionId: null,
                  selectedCatalogGenericNameEn: '',
                  selectedCatalogBrandNameEn: '',
                  medicationName: '',
                  medicationNameAr: '',
                })
              }
              placeholder={t('doctor.createPrescription.searchMedicationPlaceholder')}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rtl:pl-4 rtl:pr-11"
            />
          </div>
        </label>

        {item.medicationName ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {item.medicationCatalogSuggestionId
                    ? t('doctor.createPrescription.pendingSelection')
                    : t('doctor.createPrescription.selectedMedication')}
                </p>
                <div className="mt-2">
                  <MedicationNameDisplay
                    canonicalName={item.medicationName}
                    localizedName={item.medicationNameAr || null}
                    language={uiLanguage}
                    primaryClassName="font-semibold text-slate-900"
                    secondaryClassName="mt-0.5 text-xs text-slate-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t('doctor.createPrescription.clearSelection')}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {pendingTranslationForSelectedCatalog ? (
                <button
                  type="button"
                  onClick={() => {
                    void selectPendingSuggestion(
                      pendingTranslationForSelectedCatalog,
                      pendingTranslationForSelectedCatalog.fallbackCatalog
                    );
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
                >
                  {t('doctor.createPrescription.usePendingTranslation')}
                </button>
              ) : null}

              {item.medicationCatalogId && !item.medicationCatalogSuggestionId && !item.medicationNameAr.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowTranslationForm((current) => !current);
                    setTranslationDraft('');
                    setShowNewMedicationForm(false);
                  }}
                  className="rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  {t('doctor.createPrescription.addArabicSuggestion')}
                </button>
              ) : null}
            </div>

            {enrichingCatalogId === item.medicationCatalogId ? (
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{t('doctor.createPrescription.enrichingMedication')}</span>
              </div>
            ) : null}

            {enrichmentError ? (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {enrichmentError}
              </div>
            ) : null}
          </div>
        ) : null}

        {showTranslationForm ? (
          <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createPrescription.arabicLabel')}
              </span>
              <input
                type="text"
                value={translationDraft}
                onChange={(event) => setTranslationDraft(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitTranslationSuggestion}
                disabled={submittingSuggestion}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-60"
              >
                {submittingSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{t('doctor.createPrescription.saveSuggestionUseNow')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTranslationForm(false)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t('doctor.createPrescription.cancelSuggestion')}
              </button>
            </div>
          </div>
        ) : null}

        {showNewMedicationForm ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.genericName')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.genericNameEn}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, genericNameEn: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.brandName')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.brandNameEn}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, brandNameEn: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.arabicLabel')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.displayNameAr}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, displayNameAr: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.dosage')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.strength}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, strength: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.dosageForm')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.dosageForm}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, dosageForm: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  {t('doctor.createPrescription.manufacturer')}
                </span>
                <input
                  type="text"
                  value={newMedicationDraft.manufacturer}
                  onChange={(event) =>
                    setNewMedicationDraft((current) => ({ ...current, manufacturer: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitNewMedicationSuggestion}
                disabled={submittingSuggestion}
                className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:opacity-60"
              >
                {submittingSuggestion ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                <span>{t('doctor.createPrescription.saveSuggestionUseNow')}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowNewMedicationForm(false)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                {t('doctor.createPrescription.cancelSuggestion')}
              </button>
            </div>
          </div>
        ) : null}

        {suggestionError ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {suggestionError}
          </div>
        ) : null}

        {item.catalogSearch.trim().length >= 2 ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('doctor.createPrescription.catalogMatches')}
              </p>
              <div className="mt-2 space-y-2">
                {catalogMatches.map((catalogMatch) => (
                  <button
                    key={catalogMatch.id}
                    type="button"
                    onClick={() => {
                      void selectCatalogMatch(catalogMatch);
                    }}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60"
                  >
                    <MedicationNameDisplay
                      canonicalName={catalogMatch.displayNameEn}
                      localizedName={catalogMatch.displayNameAr}
                      language={uiLanguage}
                      primaryClassName="font-semibold text-slate-900"
                      secondaryClassName="mt-0.5 text-xs text-slate-500"
                    />
                  </button>
                ))}
                {!searchLoading && catalogMatches.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                    {t('doctor.createPrescription.noCatalogMatches')}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('doctor.createPrescription.pendingSuggestions')}
              </p>
              <div className="mt-2 space-y-2">
                {pendingSuggestionMatches.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => {
                      void selectPendingSuggestion(suggestion, suggestion.fallbackCatalog);
                    }}
                    className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left transition hover:bg-amber-100"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <MedicationNameDisplay
                        canonicalName={suggestion.displayNameEn}
                        localizedName={suggestion.displayNameAr}
                        language={uiLanguage}
                        primaryClassName="font-semibold text-slate-900"
                        secondaryClassName="mt-0.5 text-xs text-slate-500"
                      />
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-amber-800">
                        {t('doctor.createPrescription.pendingBadge')}
                      </span>
                    </div>
                  </button>
                ))}
                {!searchLoading && pendingSuggestionMatches.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                    {t('doctor.createPrescription.noPendingSuggestions')}
                  </p>
                ) : null}
              </div>
            </div>

            {!showNewMedicationForm ? (
              <button
                type="button"
                onClick={() => {
                  setShowNewMedicationForm(true);
                  setShowTranslationForm(false);
                  setNewMedicationDraft(createDraftMedicationSuggestion(item.catalogSearch.trim()));
                  setSuggestionError(null);
                }}
                className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
              >
                {t('doctor.createPrescription.suggestMissingMedication')}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.quantity')}
          </span>
          <input
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) => onChange(item.id, { quantity: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.dosage')}
          </span>
          <input
            type="text"
            value={localizedDosageValue}
            onChange={(event) =>
              onChange(item.id, { dosage: normalizeMedicationDosageValue(event.target.value) })
            }
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.frequency')}
          </span>
          <select
            value={item.frequencyCode}
            onChange={(event) => onChange(item.id, { frequencyCode: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{t('doctor.createPrescription.selectFrequency')}</option>
            {frequencyOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {uiLanguage.startsWith('ar') ? option.label_ar : option.label_en}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.duration')}
          </span>
          <select
            value={item.durationCode}
            onChange={(event) => onChange(item.id, { durationCode: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">{t('doctor.createPrescription.selectDuration')}</option>
            {durationOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {uiLanguage.startsWith('ar') ? option.label_ar : option.label_en}
              </option>
            ))}
          </select>
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-900">
            {t('doctor.createPrescription.instructions')}
          </span>
          <textarea
            rows={4}
            value={item.instructions}
            onChange={(event) => onChange(item.id, { instructions: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          />
        </label>
      </div>
    </div>
  );
};

export const CreatePrescription: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: patientsData } = useDoctorPatients(user?.id);
  const patients = useMemo(() => patientsData ?? [], [patientsData]);
  const [patientId, setPatientId] = useState(searchParams.get('patient') ?? '');
  const [appointmentId, setAppointmentId] = useState(searchParams.get('appointment') ?? '');
  const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [items, setItems] = useState<DraftPrescriptionItem[]>([createDraftPrescriptionItem()]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: vocabData } = useQuery<PrescriptionClinicalVocabRow[]>(
    async () => {
      const { data, error } = await supabase
        .from('prescription_clinical_vocab')
        .select('category, code, label_en, label_ar, legacy_match')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []) as PrescriptionClinicalVocabRow[];
    },
    []
  );

  const { data: appointmentsData } = useQuery<
    Array<{ id: string; scheduled_at: string; chief_complaint: string | null }>
  >(
    async () => {
      if (!user?.id || !patientId) {
        return [];
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('id, scheduled_at, chief_complaint')
        .eq('doctor_id', user.id)
        .eq('patient_id', patientId)
        .eq('is_deleted', false)
        .order('scheduled_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    [user?.id ?? '', patientId]
  );

  const vocabRows = useMemo(() => vocabData ?? [], [vocabData]);
  const frequencyOptions = useMemo(
    () => vocabRows.filter((row) => row.category === 'frequency'),
    [vocabRows]
  );
  const durationOptions = useMemo(
    () => vocabRows.filter((row) => row.category === 'duration'),
    [vocabRows]
  );
  const appointments = useMemo(() => appointmentsData ?? [], [appointmentsData]);

  const updateItem = (id: string, nextState: Partial<DraftPrescriptionItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...nextState } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const submit = async () => {
    if (!user?.id || !patientId) {
      setFeedback({ type: 'error', message: t('doctor.createPrescription.patientRequired') });
      return;
    }

    const normalizedItems = items
      .map((item) => ({
        medicationCatalogId: item.medicationCatalogId,
        medicationCatalogSuggestionId: item.medicationCatalogSuggestionId,
        medicationName: item.medicationName.trim(),
        medicationNameAr: item.medicationNameAr.trim(),
        dosage: item.dosage.trim(),
        frequencyCode: item.frequencyCode.trim(),
        durationCode: item.durationCode.trim(),
        quantity: item.quantity.trim(),
        instructions: item.instructions.trim(),
      }))
      .filter((item) => item.medicationName.length > 0);

    if (normalizedItems.length === 0) {
      setFeedback({ type: 'error', message: t('doctor.createPrescription.itemRequired') });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const { data: insertedPrescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id: patientId,
        doctor_id: user.id,
        appointment_id: appointmentId || null,
        status,
      })
      .select('id')
      .maybeSingle();

    if (prescriptionError || !insertedPrescription) {
      setSaving(false);
      setFeedback({
        type: 'error',
        message: prescriptionError?.message ?? t('doctor.createPrescription.saveError'),
      });
      return;
    }

    const itemPayload = normalizedItems.map((item) => ({
      prescription_id: insertedPrescription.id,
      medication_catalog_id: item.medicationCatalogId,
      medication_catalog_suggestion_id: item.medicationCatalogSuggestionId,
      medication_name: item.medicationName,
      medication_name_ar: item.medicationNameAr || null,
      dosage: item.dosage || null,
      frequency_code: item.frequencyCode || null,
      duration_code: item.durationCode || null,
      frequency:
        resolveClinicalVocabLabel(vocabRows, 'frequency', item.frequencyCode || null, null, 'en') ?? null,
      duration:
        resolveClinicalVocabLabel(vocabRows, 'duration', item.durationCode || null, null, 'en') ?? null,
      quantity: item.quantity ? Number.parseInt(item.quantity, 10) || null : null,
      instructions: item.instructions || null,
      is_dispensed: false,
    }));

    const { error: itemsError } = await supabase.from('prescription_items').insert(itemPayload);

    if (itemsError) {
      setSaving(false);
      setFeedback({ type: 'error', message: itemsError.message });
      return;
    }

    await supabase.from('notifications').insert({
      user_id: patientId,
      type: 'medication',
      title: 'New prescription issued',
      body: 'Your doctor added a new medication plan to your account.',
      action_url: '/patient/prescriptions',
    });

    setSaving(false);
    setFeedback({ type: 'success', message: t('doctor.createPrescription.saveSuccess') });
    navigate('/doctor/prescriptions');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="doctor" />
      <PageHeader
        title={t('doctor.createPrescription.title')}
        subtitle={t('doctor.createPrescription.subtitle')}
        icon={<Pill className="w-6 h-6 text-white" />}
        backTo="/doctor/prescriptions"
      />

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {feedback ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createPrescription.patient')}
              </span>
              <select
                value={patientId}
                onChange={(event) => {
                  setPatientId(event.target.value);
                  setAppointmentId('');
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">{t('doctor.createPrescription.selectPatient')}</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createPrescription.appointment')}
              </span>
              <select
                value={appointmentId}
                onChange={(event) => setAppointmentId(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">{t('doctor.createPrescription.selectAppointment')}</option>
                {appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {new Date(appointment.scheduled_at).toLocaleString(
                      i18n.language.startsWith('ar') ? 'ar-AE' : 'en-US'
                    )}
                    {appointment.chief_complaint ? ` • ${appointment.chief_complaint}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-900">
                {t('doctor.createPrescription.status')}
              </span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as 'active' | 'completed' | 'cancelled')
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="active">{t('shared.prescriptionStatus.active')}</option>
                <option value="completed">{t('shared.prescriptionStatus.completed')}</option>
                <option value="cancelled">{t('shared.prescriptionStatus.cancelled')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <MedicationItemEditor
              key={item.id}
              canRemove={items.length > 1}
              durationOptions={durationOptions}
              frequencyOptions={frequencyOptions}
              item={item}
              index={index}
              onChange={updateItem}
              onRemove={removeItem}
              uiLanguage={i18n.language ?? 'en'}
              userId={user?.id ?? ''}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setItems((current) => [...current, createDraftPrescriptionItem()])}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            <Plus className="h-4 w-4" />
            <span>{t('doctor.createPrescription.addItem')}</span>
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pill className="h-4 w-4" />}
            <span>{saving ? t('doctor.createPrescription.saving') : t('doctor.createPrescription.save')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
