import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import { createSupabaseQueryBuilder } from '../test/supabase-mock';
import { usePatientRecords } from './use-patient-records';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('usePatientRecords', () => {
  const fromMock = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty record groups when no user is provided', async () => {
    const { result } = renderHook(() => usePatientRecords(null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      conditions: [],
      allergies: [],
      vaccinations: [],
    });
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('loads canonical conditions, allergies, and vaccinations', async () => {
    const conditionsBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'condition-1',
          patient_id: 'patient-1',
          condition_name: 'Hypertension',
          icd_code: 'I10',
          diagnosed_date: '2024-09-14',
          status: 'active',
          notes: 'Monitor at home',
          is_deleted: false,
          deleted_at: null,
          created_at: '2024-09-14T00:00:00Z',
          updated_at: '2024-09-14T00:00:00Z',
        },
      ],
      error: null,
    });
    const allergiesBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'allergy-1',
          patient_id: 'patient-1',
          allergen: 'Penicillin',
          severity: 'severe',
          reaction: 'Hives',
          confirmed_by_doctor: true,
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-03-21T00:00:00Z',
          updated_at: '2026-03-21T00:00:00Z',
        },
      ],
      error: null,
    });
    const vaccinationsBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'vaccination-1',
          patient_id: 'patient-1',
          vaccine_name: 'Influenza',
          dose_number: 1,
          administered_date: '2025-10-02',
          administered_by: 'Downtown Clinic',
          next_dose_due: '2026-10-02',
          is_deleted: false,
          deleted_at: null,
          created_at: '2025-10-02T00:00:00Z',
          updated_at: '2025-10-02T00:00:00Z',
        },
      ],
      error: null,
    });

    fromMock.mockImplementation(
      ((table: string) => {
        if (table === 'medical_conditions') {
          return conditionsBuilder;
        }

        if (table === 'allergies') {
          return allergiesBuilder;
        }

        if (table === 'vaccinations') {
          return vaccinationsBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }) as never
    );

    const { result } = renderHook(() => usePatientRecords('patient-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      conditions: [
        {
          id: 'condition-1',
          patient_id: 'patient-1',
          condition_name: 'Hypertension',
          icd_code: 'I10',
          diagnosed_date: '2024-09-14',
          status: 'active',
          notes: 'Monitor at home',
          is_deleted: false,
          deleted_at: null,
          created_at: '2024-09-14T00:00:00Z',
          updated_at: '2024-09-14T00:00:00Z',
        },
      ],
      allergies: [
        {
          id: 'allergy-1',
          patient_id: 'patient-1',
          allergen: 'Penicillin',
          severity: 'severe',
          reaction: 'Hives',
          confirmed_by_doctor: true,
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-03-21T00:00:00Z',
          updated_at: '2026-03-21T00:00:00Z',
        },
      ],
      vaccinations: [
        {
          id: 'vaccination-1',
          patient_id: 'patient-1',
          vaccine_name: 'Influenza',
          dose_number: 1,
          administered_date: '2025-10-02',
          administered_by: 'Downtown Clinic',
          next_dose_due: '2026-10-02',
          is_deleted: false,
          deleted_at: null,
          created_at: '2025-10-02T00:00:00Z',
          updated_at: '2025-10-02T00:00:00Z',
        },
      ],
    });

    expect(conditionsBuilder.eq).toHaveBeenCalledWith('patient_id', 'patient-1');
    expect(conditionsBuilder.eq).toHaveBeenCalledWith('is_deleted', false);
    expect(vaccinationsBuilder.order).toHaveBeenCalledWith('administered_date', { ascending: false });
  });
});
