import type { LabOrder, LabOrderItem } from '../types';
import {
  hydrateLabOrderItemsWithCatalog,
  loadLabTestCatalogRowsForLabOrderItems,
  loadLabTestCatalogSuggestionRowsForLabOrderItems,
} from '../lib/lab-test-catalog';
import { useQuery } from './use-query';
import { supabase } from '../lib/supabase';

export interface PatientLabOrderRecord extends LabOrder {
  doctorName: string | null;
  items: LabOrderItem[];
  abnormalCount: number;
  resultedCount: number;
}

export function usePatientLabResults(userId: string | null | undefined) {
  return useQuery<PatientLabOrderRecord[]>(async () => {
    if (!userId) {
      return [];
    }

    const { data: labOrders, error: labOrdersError } = await supabase
      .from('lab_orders')
      .select('*')
      .eq('patient_id', userId)
      .eq('is_deleted', false)
      .order('ordered_at', { ascending: false });

    if (labOrdersError) {
      throw labOrdersError;
    }

    const safeLabOrders = (labOrders ?? []) as LabOrder[];

    if (safeLabOrders.length === 0) {
      return [];
    }

    const labOrderIds = safeLabOrders.map((labOrder) => labOrder.id);
    const doctorIds = Array.from(new Set(safeLabOrders.map((labOrder) => labOrder.doctor_id)));

    const [
      { data: labOrderItems, error: labOrderItemsError },
      { data: doctorProfiles, error: doctorProfilesError },
    ] = await Promise.all([
      supabase
        .from('lab_order_items')
        .select('*')
        .in('lab_order_id', labOrderIds)
        .order('created_at', { ascending: true }),
      supabase.from('user_profiles').select('user_id, full_name').in('user_id', doctorIds),
    ]);

    if (labOrderItemsError) {
      throw labOrderItemsError;
    }

    if (doctorProfilesError) {
      throw doctorProfilesError;
    }

    const rawItems = (labOrderItems ?? []) as LabOrderItem[];
    const hydratedLabOrderItems = hydrateLabOrderItemsWithCatalog(
      rawItems,
      await loadLabTestCatalogRowsForLabOrderItems(rawItems),
      await loadLabTestCatalogSuggestionRowsForLabOrderItems(rawItems)
    );

    const doctorNameById = new Map(
      (doctorProfiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? null])
    );

    const itemsByLabOrderId = new Map<string, LabOrderItem[]>();
    for (const item of hydratedLabOrderItems) {
      const existingItems = itemsByLabOrderId.get(item.lab_order_id) ?? [];
      existingItems.push(item);
      itemsByLabOrderId.set(item.lab_order_id, existingItems);
    }

    return safeLabOrders.map((labOrder) => {
      const orderItems = itemsByLabOrderId.get(labOrder.id) ?? [];
      const abnormalCount = orderItems.filter((item) => item.is_abnormal === true).length;
      const resultedCount = orderItems.filter((item) => item.result_value != null).length;

      return {
        ...labOrder,
        doctorName: doctorNameById.get(labOrder.doctor_id) ?? null,
        items: orderItems,
        abnormalCount,
        resultedCount,
      };
    });
  }, [userId ?? '']);
}
