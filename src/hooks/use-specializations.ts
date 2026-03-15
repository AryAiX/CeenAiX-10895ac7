import { supabase } from '../lib/supabase';
import type { Specialization } from '../types';
import { useQuery } from './use-query';

export function useSpecializations() {
  return useQuery<Specialization[]>(
    async () => {
      const { data, error } = await supabase
        .from('specializations')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    []
  );
}

export function useDoctorSpecializationIds(userId: string | null | undefined) {
  return useQuery<string[]>(
    async () => {
      if (!userId) {
        return [];
      }

      const { data, error } = await supabase
        .from('doctor_specializations')
        .select('specialization_id')
        .eq('doctor_user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => row.specialization_id);
    },
    [userId]
  );
}
