import { supabase } from '../lib/supabase';
import { resolveClinicalVocabLabel, type PrescriptionClinicalVocabRow } from '../lib/prescription-vocab';
import {
  hydratePrescriptionItemsWithCatalog,
  loadMedicationCatalogRowsForPrescriptionItems,
} from '../lib/medication-catalog';
import { useQuery } from './use-query';
import type { NotificationType, PrescriptionItem } from '../types';

interface DashboardAppointment {
  id: string;
  doctorName: string;
  specialty: string | null;
  scheduledAt: string;
  type: 'in_person' | 'virtual';
}

export interface DashboardMedication {
  id: string;
  medicationName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  /** Joined English fallback when parts are missing */
  detail: string;
  /** Resolved from `prescription_clinical_vocab` for current UI language */
  frequencyFromVocab: string | null;
  durationFromVocab: string | null;
  medicationNameAr: string | null;
  isDispensed: boolean;
}

interface DashboardActivity {
  id: string;
  type: NotificationType | 'appointment';
  title: string;
  detail: string | null;
  createdAt: string;
  actionUrl: string | null;
}

export interface PatientDashboardData {
  upcomingAppointmentsCount: number;
  activePrescriptionsCount: number;
  unreadMessagesCount: number;
  nextAppointment: DashboardAppointment | null;
  medications: DashboardMedication[];
  recentActivity: DashboardActivity[];
}

const UPCOMING_STATUSES = new Set(['scheduled', 'confirmed', 'in_progress']);

export function usePatientDashboard(userId: string | null | undefined, uiLanguage: string) {
  return useQuery<PatientDashboardData | null>(async () => {
    if (!userId) {
      return null;
    }

    const now = new Date();

    const [
      { data: vocabData, error: vocabError },
      { data: appointments, error: appointmentsError },
      { data: prescriptions, error: prescriptionsError },
      { data: notifications, error: notificationsError },
      { data: conversations, error: conversationsError },
    ] = await Promise.all([
      supabase
        .from('prescription_clinical_vocab')
        .select('category, code, label_en, label_ar, legacy_match')
        .eq('is_active', true),
      supabase
        .from('appointments')
        .select('id, doctor_id, type, status, scheduled_at')
        .eq('patient_id', userId)
        .eq('is_deleted', false)
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('prescriptions')
        .select('id, status, prescribed_at')
        .eq('patient_id', userId)
        .eq('is_deleted', false)
        .order('prescribed_at', { ascending: false }),
      supabase
        .from('notifications')
        .select('id, type, title, body, action_url, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3),
      // RLS already limits visible conversations to ones the user participates in.
      supabase.from('conversations').select('id'),
    ]);

    if (appointmentsError) {
      throw appointmentsError;
    }

    if (prescriptionsError) {
      throw prescriptionsError;
    }

    if (notificationsError) {
      throw notificationsError;
    }

    if (conversationsError) {
      throw conversationsError;
    }

    let vocabRows: PrescriptionClinicalVocabRow[] = [];
    if (vocabError) {
      console.warn('[usePatientDashboard] prescription_clinical_vocab unavailable:', vocabError.message);
    } else {
      vocabRows = (vocabData ?? []) as PrescriptionClinicalVocabRow[];
    }

    const safeAppointments = appointments ?? [];
    const safePrescriptions = prescriptions ?? [];
    const safeNotifications = notifications ?? [];

    const upcomingAppointments = safeAppointments.filter((appointment) => {
      if (!UPCOMING_STATUSES.has(appointment.status)) {
        return false;
      }

      return new Date(appointment.scheduled_at) >= now;
    });

    const nextAppointmentBase = upcomingAppointments[0] ?? null;

    let nextAppointment: DashboardAppointment | null = null;

    if (nextAppointmentBase) {
      const [
        { data: doctorUserProfile, error: doctorUserProfileError },
        { data: doctorProfile, error: doctorProfileError },
      ] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('full_name')
          .eq('user_id', nextAppointmentBase.doctor_id)
          .maybeSingle(),
        supabase
          .from('doctor_profiles')
          .select('specialization')
          .eq('user_id', nextAppointmentBase.doctor_id)
          .maybeSingle(),
      ]);

      if (doctorUserProfileError) {
        throw doctorUserProfileError;
      }

      if (doctorProfileError) {
        throw doctorProfileError;
      }

      nextAppointment = {
        id: nextAppointmentBase.id,
        doctorName: doctorUserProfile?.full_name ?? 'Care Team Clinician',
        specialty: doctorProfile?.specialization ?? null,
        scheduledAt: nextAppointmentBase.scheduled_at,
        type: nextAppointmentBase.type,
      };
    }

    const activePrescriptions = safePrescriptions.filter((prescription) => prescription.status === 'active');
    const activePrescriptionIds = activePrescriptions.map((prescription) => prescription.id);

    let medications: DashboardMedication[] = [];

    if (activePrescriptionIds.length > 0) {
      const { data: prescriptionItems, error: prescriptionItemsError } = await supabase
        .from('prescription_items')
        .select(
          'id, prescription_id, medication_catalog_id, medication_name, medication_name_ar, dosage, frequency, duration, frequency_code, duration_code, is_dispensed'
        )
        .in('prescription_id', activePrescriptionIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (prescriptionItemsError) {
        throw prescriptionItemsError;
      }

      const hydratedPrescriptionItems = hydratePrescriptionItemsWithCatalog(
        (prescriptionItems ?? []) as PrescriptionItem[],
        await loadMedicationCatalogRowsForPrescriptionItems((prescriptionItems ?? []) as PrescriptionItem[])
      );

      medications =
        hydratedPrescriptionItems.map((item) => {
          const dosage = item.dosage?.trim() || null;
          const frequency = item.frequency?.trim() || null;
          const duration = item.duration?.trim() || null;
          const joined = [dosage, frequency, duration].filter(Boolean).join(' • ');
          const frequencyFromVocab = resolveClinicalVocabLabel(
            vocabRows,
            'frequency',
            item.frequency_code,
            frequency,
            uiLanguage
          );
          const durationFromVocab = resolveClinicalVocabLabel(
            vocabRows,
            'duration',
            item.duration_code,
            duration,
            uiLanguage
          );
          return {
            id: item.id,
            medicationName: item.medication_name,
            medicationNameAr: item.medication_name_ar?.trim() || null,
            dosage,
            frequency,
            duration,
            detail: joined || 'Active prescription',
            frequencyFromVocab,
            durationFromVocab,
            isDispensed: item.is_dispensed,
          };
        }) ?? [];
    }

    const conversationIds = (conversations ?? []).map((conversation) => conversation.id);

    let unreadMessagesCount = 0;

    if (conversationIds.length > 0) {
      const { count, error: unreadMessagesError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .is('read_at', null)
        .neq('sender_id', userId);

      if (unreadMessagesError) {
        throw unreadMessagesError;
      }

      unreadMessagesCount = count ?? 0;
    }

    const recentActivity: DashboardActivity[] = safeNotifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      detail: notification.body,
      createdAt: notification.created_at,
      actionUrl: notification.action_url,
    }));

    if (recentActivity.length === 0 && nextAppointment) {
      recentActivity.push({
        id: `appointment-${nextAppointment.id}`,
        type: 'appointment',
        title: 'Upcoming appointment scheduled',
        detail: `Next with ${nextAppointment.doctorName}`,
        createdAt: nextAppointment.scheduledAt,
        actionUrl: '/patient/appointments',
      });
    }

    return {
      upcomingAppointmentsCount: upcomingAppointments.length,
      activePrescriptionsCount: activePrescriptions.length,
      unreadMessagesCount,
      nextAppointment,
      medications,
      recentActivity,
    };
  }, [userId, uiLanguage]);
}
