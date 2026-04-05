import { supabase } from '../lib/supabase';
import type { Prescription, PrescriptionItem } from '../types';
import { useQuery } from './use-query';

interface PatientPrescriptionProfile {
  fullName: string;
  email: string | null;
}

export interface DoctorPrescriptionRecord extends Prescription {
  patientName: string;
  patientEmail: string | null;
  items: PrescriptionItem[];
}

export function useDoctorPrescriptions(userId: string | null | undefined) {
  return useQuery<DoctorPrescriptionRecord[]>(async () => {
    if (!userId) {
      return [];
    }

    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('doctor_id', userId)
      .eq('is_deleted', false)
      .order('prescribed_at', { ascending: false });

    if (prescriptionsError) {
      throw prescriptionsError;
    }

    const safePrescriptions = prescriptions ?? [];

    if (safePrescriptions.length === 0) {
      return [];
    }

    const prescriptionIds = safePrescriptions.map((prescription) => prescription.id);
    const patientIds = Array.from(new Set(safePrescriptions.map((prescription) => prescription.patient_id)));

    const [
      { data: prescriptionItems, error: prescriptionItemsError },
      { data: userProfiles, error: userProfilesError },
    ] = await Promise.all([
      supabase
        .from('prescription_items')
        .select('*')
        .in('prescription_id', prescriptionIds)
        .order('created_at', { ascending: true }),
      supabase.from('user_profiles').select('user_id, full_name, email').in('user_id', patientIds),
    ]);

    if (prescriptionItemsError) {
      throw prescriptionItemsError;
    }

    if (userProfilesError) {
      throw userProfilesError;
    }

    const itemsByPrescriptionId = new Map<string, PrescriptionItem[]>();

    for (const item of prescriptionItems ?? []) {
      const existingItems = itemsByPrescriptionId.get(item.prescription_id) ?? [];
      existingItems.push(item);
      itemsByPrescriptionId.set(item.prescription_id, existingItems);
    }

    const patientProfileById = new Map<string, PatientPrescriptionProfile>(
      (userProfiles ?? []).map((userProfile) => [
        userProfile.user_id,
        {
          fullName: userProfile.full_name ?? 'Patient',
          email: userProfile.email ?? null,
        },
      ])
    );

    return safePrescriptions.map((prescription) => {
      const patientProfile = patientProfileById.get(prescription.patient_id);

      return {
        ...prescription,
        patientName: patientProfile?.fullName ?? 'Patient',
        patientEmail: patientProfile?.email ?? null,
        items: itemsByPrescriptionId.get(prescription.id) ?? [],
      };
    });
  }, [userId]);
}
