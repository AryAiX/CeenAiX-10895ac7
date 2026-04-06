import type { LabTestCatalog, LabTestCatalogSuggestion } from '../types';
import {
  getLabTestCatalogDisplayNameAr,
  getLabTestCatalogDisplayNameEn,
  getLabTestSuggestionDisplayNameEn,
} from '../lib/lab-test-catalog';
import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

export interface LabTestCatalogSearchMatch extends LabTestCatalog {
  displayNameEn: string;
  displayNameAr: string | null;
}

export interface LabTestCatalogSuggestionSearchMatch extends LabTestCatalogSuggestion {
  displayNameEn: string;
  displayNameAr: string | null;
  fallbackCatalog: LabTestCatalog | null;
}

export interface LabTestCatalogSearchResults {
  catalogMatches: LabTestCatalogSearchMatch[];
  pendingSuggestionMatches: LabTestCatalogSuggestionSearchMatch[];
}

const sanitizeSearchTerm = (value: string) => value.trim().replace(/[,%]/g, ' ');

export function useLabTestCatalogSearch(
  userId: string | null | undefined,
  rawSearchTerm: string | null | undefined
) {
  return useQuery<LabTestCatalogSearchResults>(
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
          .from('lab_test_catalog')
          .select('*')
          .eq('is_active', true)
          .or(
            [
              `display_name_en.ilike.${likeTerm}`,
              `short_name_en.ilike.${likeTerm}`,
              `display_name_ar.ilike.${likeTerm}`,
              `source_code.ilike.${likeTerm}`,
              `category.ilike.${likeTerm}`,
            ].join(',')
          )
          .order('display_name_en', { ascending: true })
          .limit(8),
        supabase
          .from('lab_test_catalog_suggestions')
          .select('*')
          .eq('created_by', userId)
          .eq('status', 'pending')
          .or(
            [
              `proposed_display_name_en.ilike.${likeTerm}`,
              `proposed_display_name_ar.ilike.${likeTerm}`,
              `proposed_short_name_en.ilike.${likeTerm}`,
              `proposed_source_code.ilike.${likeTerm}`,
              `proposed_category.ilike.${likeTerm}`,
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

      const safeCatalogRows = (catalogRows ?? []) as LabTestCatalog[];
      const safeSuggestionRows = (suggestionRows ?? []) as LabTestCatalogSuggestion[];

      const fallbackCatalogIds = Array.from(
        new Set(
          safeSuggestionRows
            .map((suggestionRow) => suggestionRow.lab_test_catalog_id)
            .filter((value): value is string => Boolean(value))
        )
      );

      const extraCatalogRows =
        fallbackCatalogIds.length > 0
          ? await supabase.from('lab_test_catalog').select('*').in('id', fallbackCatalogIds)
          : { data: [], error: null };

      if (extraCatalogRows.error) {
        throw extraCatalogRows.error;
      }

      const catalogById = new Map<string, LabTestCatalog>(
        [...safeCatalogRows, ...((extraCatalogRows.data ?? []) as LabTestCatalog[])].map((catalogRow) => [
          catalogRow.id,
          catalogRow,
        ])
      );

      return {
        catalogMatches: safeCatalogRows.map((catalogRow) => ({
          ...catalogRow,
          displayNameEn: getLabTestCatalogDisplayNameEn(catalogRow),
          displayNameAr: getLabTestCatalogDisplayNameAr(catalogRow),
        })),
        pendingSuggestionMatches: safeSuggestionRows.map((suggestionRow) => {
          const fallbackCatalog = suggestionRow.lab_test_catalog_id
            ? (catalogById.get(suggestionRow.lab_test_catalog_id) ?? null)
            : null;

          return {
            ...suggestionRow,
            displayNameEn: getLabTestSuggestionDisplayNameEn(suggestionRow, fallbackCatalog),
            displayNameAr:
              getLabTestCatalogDisplayNameAr(suggestionRow) ??
              (fallbackCatalog ? getLabTestCatalogDisplayNameAr(fallbackCatalog) : null),
            fallbackCatalog,
          };
        }),
      };
    },
    [userId ?? '', sanitizeSearchTerm(rawSearchTerm ?? '')]
  );
}
