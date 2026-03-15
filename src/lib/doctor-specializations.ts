import { supabase } from './supabase';
import type { DoctorProfile, Specialization } from '../types';

export const getSelectedSpecializations = (
  selectedIds: string[] | null | undefined,
  options: Specialization[] | null | undefined
) => {
  const safeSelectedIds = selectedIds ?? [];
  const safeOptions = options ?? [];
  const orderMap = new Map(safeSelectedIds.map((id, index) => [id, index]));

  return safeOptions
    .filter((option) => orderMap.has(option.id))
    .sort((left, right) => (orderMap.get(left.id) ?? 0) - (orderMap.get(right.id) ?? 0));
};

export const deriveLegacySpecializationIds = (
  doctorProfile: DoctorProfile | null,
  options: Specialization[] | null | undefined
) => {
  if (!doctorProfile) {
    return [];
  }

  const safeOptions = options ?? [];
  const optionByName = new Map(safeOptions.map((option) => [option.name.toLowerCase(), option.id]));
  const legacyValues = [doctorProfile.specialization, doctorProfile.sub_specialization]
    .flatMap((value) => (value ?? '').split(','))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(
    new Set(
      legacyValues
        .map((value) => optionByName.get(value))
        .filter((value): value is string => Boolean(value))
    )
  );
};

export const getPrimaryAndSecondarySpecializations = (
  selectedIds: string[] | null | undefined,
  options: Specialization[] | null | undefined
) => {
  const selectedOptions = getSelectedSpecializations(selectedIds, options);

  return {
    primarySpecialization: selectedOptions[0]?.name ?? null,
    secondarySpecialization:
      selectedOptions.length > 1 ? selectedOptions.slice(1).map((option) => option.name).join(', ') : null,
    selectedOptions,
  };
};

export const syncDoctorSpecializations = async (
  doctorUserId: string,
  specializationIds: string[] | null | undefined
) => {
  const uniqueIds = Array.from(new Set(specializationIds ?? []));

  const { error: deleteError } = await supabase
    .from('doctor_specializations')
    .delete()
    .eq('doctor_user_id', doctorUserId);

  if (deleteError) {
    throw deleteError;
  }

  if (uniqueIds.length === 0) {
    return;
  }

  const { error: insertError } = await supabase.from('doctor_specializations').insert(
    uniqueIds.map((specializationId) => ({
      doctor_user_id: doctorUserId,
      specialization_id: specializationId,
    }))
  );

  if (insertError) {
    throw insertError;
  }
};
