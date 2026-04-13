import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

export interface PatientDashboardAlert {
  id: string;
  allergen: string;
  severity: string;
  reaction: string | null;
}

export function usePatientDashboardAlert(userId: string | null | undefined) {
  return useQuery<PatientDashboardAlert[]>(async () => {
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('allergies')
      .select('id, allergen, severity, reaction')
      .eq('patient_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(2);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      allergen: row.allergen,
      severity: row.severity,
      reaction: row.reaction ?? null,
    }));
  }, [userId]);
}
