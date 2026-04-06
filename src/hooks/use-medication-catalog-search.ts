import type { MedicationCatalog, MedicationCatalogSuggestion } from '../types';
import {
  getMedicationCatalogDisplayNameAr,
  getMedicationCatalogDisplayNameEn,
  getMedicationSuggestionDisplayNameEn,
} from '../lib/medication-catalog';
import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

export interface MedicationCatalogSearchMatch extends MedicationCatalog {
  displayNameEn: string;
  displayNameAr: string | null;
}

export interface MedicationCatalogSuggestionSearchMatch extends MedicationCatalogSuggestion {
  displayNameEn: string;
  displayNameAr: string | null;
  fallbackCatalog: MedicationCatalog | null;
}

export interface MedicationCatalogSearchResults {
  catalogMatches: MedicationCatalogSearchMatch[];
  pendingSuggestionMatches: MedicationCatalogSuggestionSearchMatch[];
}

const sanitizeSearchTerm = (value: string) => value.trim().replace(/[,%]/g, ' ');

export function useMedicationCatalogSearch(
  userId: string | null | undefined,
  rawSearchTerm: string | null | undefined
) {
  return useQuery<MedicationCatalogSearchResults>(
    async () => {
      const searchTerm = sanitizeSearchTerm(rawSearchTerm ?? '');

      if (!userId || searchTerm.length < 2) {
        return { catalogMatches: [], pendingSuggestionMatches: [] };
      }

      const likeTerm = `%${searchTerm}%`;

      const [
        { data: catalogRows, error: catalogError },
        { data: suggestionRows, error: suggestionError },
      ] = await Promise.all([
        supabase
          .from('medication_catalog')
          .select('*')
          .eq('is_active', true)
          .or(
            [
              `generic_name_en.ilike.${likeTerm}`,
              `brand_name_en.ilike.${likeTerm}`,
              `display_name_ar.ilike.${likeTerm}`,
            ].join(',')
          )
          .order('generic_name_en', { ascending: true })
          .limit(8),
        supabase
          .from('medication_catalog_suggestions')
          .select('*')
          .eq('created_by', userId)
          .eq('status', 'pending')
          .or(
            [
              `proposed_generic_name_en.ilike.${likeTerm}`,
              `proposed_brand_name_en.ilike.${likeTerm}`,
              `proposed_display_name_ar.ilike.${likeTerm}`,
            ].join(',')
          )
          .order('created_at', { ascending: false })
          .limit(8),
      ]);

      if (catalogError) {
        throw catalogError;
      }

      if (suggestionError) {
        throw suggestionError;
      }

      const safeCatalogRows = (catalogRows ?? []) as MedicationCatalog[];
      const safeSuggestionRows = (suggestionRows ?? []) as MedicationCatalogSuggestion[];

      const fallbackCatalogIds = Array.from(
        new Set(
          safeSuggestionRows
            .map((suggestionRow) => suggestionRow.medication_catalog_id)
            .filter((value): value is string => Boolean(value))
        )
      );

      const extraCatalogRows =
        fallbackCatalogIds.length > 0
          ? await supabase.from('medication_catalog').select('*').in('id', fallbackCatalogIds)
          : { data: [], error: null };

      if (extraCatalogRows.error) {
        throw extraCatalogRows.error;
      }

      const catalogById = new Map<string, MedicationCatalog>(
        [...safeCatalogRows, ...((extraCatalogRows.data ?? []) as MedicationCatalog[])].map((catalogRow) => [
          catalogRow.id,
          catalogRow,
        ])
      );

      return {
        catalogMatches: safeCatalogRows.map((catalogRow) => ({
          ...catalogRow,
          displayNameEn: getMedicationCatalogDisplayNameEn(catalogRow),
          displayNameAr: getMedicationCatalogDisplayNameAr(catalogRow),
        })),
        pendingSuggestionMatches: safeSuggestionRows.map((suggestionRow) => {
          const fallbackCatalog = suggestionRow.medication_catalog_id
            ? (catalogById.get(suggestionRow.medication_catalog_id) ?? null)
            : null;

          return {
            ...suggestionRow,
            displayNameEn: getMedicationSuggestionDisplayNameEn(suggestionRow, fallbackCatalog),
            displayNameAr:
              getMedicationCatalogDisplayNameAr(suggestionRow) ??
              (fallbackCatalog ? getMedicationCatalogDisplayNameAr(fallbackCatalog) : null),
            fallbackCatalog,
          };
        }),
      };
    },
    [userId ?? '', sanitizeSearchTerm(rawSearchTerm ?? '')]
  );
}
