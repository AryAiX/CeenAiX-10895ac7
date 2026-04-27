import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

/** Primary (or first) insurance row for dashboard / medications cost KPIs. */
export interface PatientPrimaryInsurance {
  planName: string;
  providerCompany: string;
  coPayPercent: number | null;
  annualLimit: number | null;
  annualLimitUsed: number | null;
  validUntil: string | null;
  policyNumber: string | null;
  isPrimary: boolean;
}

export function usePatientPrimaryInsurance(userId: string | null | undefined) {
  return useQuery<PatientPrimaryInsurance | null>(async () => {
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('patient_insurance')
      .select(
        'is_primary, annual_limit_used, valid_until, policy_number, insurance_plans (name, provider_company, co_pay_percentage, annual_limit)'
      )
      .eq('patient_id', userId);

    if (error) {
      throw error;
    }

    const rows = (data ?? []) as Array<{
      is_primary: boolean;
      annual_limit_used: number;
      valid_until: string | null;
      policy_number: string | null;
      insurance_plans:
        | { name: string; provider_company: string; co_pay_percentage: number | null; annual_limit: number | null }
        | { name: string; provider_company: string; co_pay_percentage: number | null; annual_limit: number | null }[]
        | null;
    }>;

    if (rows.length === 0) {
      return null;
    }

    const sorted = [...rows].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });

    const row = sorted[0];
    const planRaw = row.insurance_plans;
    const p = Array.isArray(planRaw) ? planRaw[0] : planRaw;
    if (!p) {
      return null;
    }

    return {
      planName: p.name,
      providerCompany: p.provider_company,
      coPayPercent: p.co_pay_percentage,
      annualLimit: p.annual_limit,
      annualLimitUsed: row.annual_limit_used,
      validUntil: row.valid_until,
      policyNumber: row.policy_number,
      isPrimary: row.is_primary,
    };
  }, [userId]);
}
