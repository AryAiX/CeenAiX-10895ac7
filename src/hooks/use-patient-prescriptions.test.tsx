import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import { createSupabaseQueryBuilder } from '../test/supabase-mock';
import { usePatientPrescriptions } from './use-patient-prescriptions';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('usePatientPrescriptions', () => {
  const fromMock = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty list when no user is provided', async () => {
    const { result } = renderHook(() => usePatientPrescriptions(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('maps normalized prescription items with doctor details', async () => {
    const prescriptionsBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'prescription-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          appointment_id: 'appointment-1',
          status: 'active',
          prescribed_at: '2026-02-10T05:15:00Z',
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-02-10T05:15:00Z',
          updated_at: '2026-02-10T05:15:00Z',
        },
      ],
      error: null,
    });
    const itemsBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'item-1',
          prescription_id: 'prescription-1',
          medication_name: 'Losartan',
          medication_name_ar: null,
          dosage: '50 mg',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: 30,
          instructions: 'Take in the morning',
          is_dispensed: true,
          created_at: '2026-02-10T05:15:00Z',
          updated_at: '2026-02-10T05:15:00Z',
        },
      ],
      error: null,
    });
    const userProfilesBuilder = createSupabaseQueryBuilder({
      data: [
        {
          user_id: 'doctor-1',
          full_name: 'Doctor 1',
        },
      ],
      error: null,
    });
    const doctorProfilesBuilder = createSupabaseQueryBuilder({
      data: [
        {
          user_id: 'doctor-1',
          specialization: 'General Surgery',
        },
      ],
      error: null,
    });

    fromMock.mockImplementation(
      ((table: string) => {
        if (table === 'prescriptions') {
          return prescriptionsBuilder;
        }

        if (table === 'prescription_items') {
          return itemsBuilder;
        }

        if (table === 'user_profiles') {
          return userProfilesBuilder;
        }

        if (table === 'doctor_profiles') {
          return doctorProfilesBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }) as never
    );

    const { result } = renderHook(() => usePatientPrescriptions('patient-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([
      {
        id: 'prescription-1',
        patient_id: 'patient-1',
        doctor_id: 'doctor-1',
        appointment_id: 'appointment-1',
        status: 'active',
        prescribed_at: '2026-02-10T05:15:00Z',
        is_deleted: false,
        deleted_at: null,
        created_at: '2026-02-10T05:15:00Z',
        updated_at: '2026-02-10T05:15:00Z',
        doctorName: 'Doctor 1',
        doctorSpecialty: 'General Surgery',
        items: [
          {
            id: 'item-1',
            prescription_id: 'prescription-1',
            medication_name: 'Losartan',
            medication_name_ar: null,
            dosage: '50 mg',
            frequency: 'Once daily',
            duration: '30 days',
            quantity: 30,
            instructions: 'Take in the morning',
            is_dispensed: true,
            created_at: '2026-02-10T05:15:00Z',
            updated_at: '2026-02-10T05:15:00Z',
          },
        ],
      },
    ]);

    expect(itemsBuilder.in).toHaveBeenCalledWith('prescription_id', ['prescription-1']);
    expect(userProfilesBuilder.in).toHaveBeenCalledWith('user_id', ['doctor-1']);
    expect(doctorProfilesBuilder.in).toHaveBeenCalledWith('user_id', ['doctor-1']);
  });
});
