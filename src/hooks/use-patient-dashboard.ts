import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';
import type { NotificationType } from '../types';

interface DashboardAppointment {
  id: string;
  doctorName: string;
  specialty: string | null;
  scheduledAt: string;
  type: 'in_person' | 'virtual';
}

interface DashboardMedication {
  id: string;
  medicationName: string;
  detail: string;
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

export function usePatientDashboard(userId: string | null | undefined) {
  return useQuery<PatientDashboardData | null>(async () => {
    if (!userId) {
      return null;
    }

    const now = new Date();

    const [
      { data: appointments, error: appointmentsError },
      { data: prescriptions, error: prescriptionsError },
      { data: notifications, error: notificationsError },
      { data: conversations, error: conversationsError },
    ] = await Promise.all([
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
        .select('id, medication_name, dosage, frequency, duration, is_dispensed')
        .in('prescription_id', activePrescriptionIds)
        .order('created_at', { ascending: false })
        .limit(3);

      if (prescriptionItemsError) {
        throw prescriptionItemsError;
      }

      medications =
        prescriptionItems?.map((item) => ({
          id: item.id,
          medicationName: item.medication_name,
          detail: [item.dosage, item.frequency, item.duration].filter(Boolean).join(' • ') || 'Active prescription',
          isDispensed: item.is_dispensed,
        })) ?? [];
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
  }, [userId]);
}
