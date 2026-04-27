import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

export interface PharmacyQueuePrescriptionItem {
  id: string;
  prescriptionId: string;
  patientName: string;
  medication: string;
  prescriber: string;
  priority: 'stat' | 'routine' | 'scheduled';
  status: 'verifying' | 'ready' | 'counseling';
  waitMinutes: number;
  quantity: number | null;
  isDispensed: boolean;
}

export interface PharmacyInventoryDerivedItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  expiryMonth: string | null;
  status: 'healthy' | 'low' | 'near_expiry' | 'out';
}

export interface PharmacyPrescriptionQueueData {
  pendingPrescriptions: number;
  dispensedToday: number;
  lowStockAlerts: number;
  claimsInReview: number;
  queue: PharmacyQueuePrescriptionItem[];
  inventory: PharmacyInventoryDerivedItem[];
}

export function usePharmacyPrescriptionQueue() {
  return useQuery<PharmacyPrescriptionQueueData>(async () => {
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('id, patient_id, doctor_id, status, prescribed_at, prescription_items (id, medication_name, dosage, quantity, is_dispensed)')
      .eq('is_deleted', false)
      .order('prescribed_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const rows = (prescriptions ?? []) as Array<{
      id: string;
      patient_id: string;
      doctor_id: string;
      status: string;
      prescribed_at: string;
      prescription_items:
        | Array<{
            id: string;
            medication_name: string;
            dosage: string | null;
            quantity: number | null;
            is_dispensed: boolean;
          }>
        | null;
    }>;

    const userIds = Array.from(new Set(rows.flatMap((row) => [row.patient_id, row.doctor_id])));
    const { data: profiles, error: profilesError } =
      userIds.length > 0
        ? await supabase.from('user_profiles').select('user_id, full_name').in('user_id', userIds)
        : { data: [], error: null };

    if (profilesError) throw profilesError;

    const names = new Map((profiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? 'Unknown']));
    const now = Date.now();

    const queue = rows.flatMap((row) =>
      (row.prescription_items ?? []).map((item): PharmacyQueuePrescriptionItem => {
        const ageMinutes = Math.max(0, Math.round((now - new Date(row.prescribed_at).getTime()) / 60000));
        const status: PharmacyQueuePrescriptionItem['status'] = item.is_dispensed
          ? 'counseling'
          : row.status === 'active'
            ? 'verifying'
            : 'ready';
        return {
          id: item.id,
          prescriptionId: row.id,
          patientName: names.get(row.patient_id) ?? 'Patient',
          medication: [item.medication_name, item.dosage].filter(Boolean).join(' '),
          prescriber: names.get(row.doctor_id) ?? 'Doctor',
          priority: ageMinutes < 120 ? 'stat' : row.status === 'active' ? 'routine' : 'scheduled',
          status,
          waitMinutes: ageMinutes,
          quantity: item.quantity,
          isDispensed: item.is_dispensed,
        };
      })
    );

    const inventoryByMedication = new Map<string, PharmacyInventoryDerivedItem>();
    for (const item of queue) {
      const name = item.medication.split(/\s+\d/)[0]?.trim() || item.medication;
      const existing =
        inventoryByMedication.get(name) ??
        ({
          id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name,
          sku: `RX-${name.slice(0, 3).toUpperCase()}-${inventoryByMedication.size + 1}`,
          stock: 0,
          reorderPoint: 20,
          expiryMonth: null,
          status: 'healthy',
        } satisfies PharmacyInventoryDerivedItem);
      existing.stock += item.quantity ?? 0;
      inventoryByMedication.set(name, existing);
    }

    const inventory = Array.from(inventoryByMedication.values()).map((item) => ({
      ...item,
      status: item.stock <= 0 ? 'out' as const : item.stock < item.reorderPoint ? 'low' as const : 'healthy' as const,
    }));

    return {
      pendingPrescriptions: queue.filter((item) => !item.isDispensed).length,
      dispensedToday: queue.filter((item) => item.isDispensed).length,
      lowStockAlerts: inventory.filter((item) => item.status === 'low' || item.status === 'out').length,
      claimsInReview: queue.filter((item) => !item.isDispensed).length,
      queue,
      inventory,
    };
  }, []);
}
