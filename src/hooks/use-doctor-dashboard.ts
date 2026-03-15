import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';

interface DoctorNextAppointment {
  id: string;
  patientName: string;
  scheduledAt: string;
  type: 'in_person' | 'virtual';
  status: string;
  chiefComplaint: string | null;
}

export interface DoctorDashboardData {
  totalPatients: number;
  todayAppointments: number;
  unreadMessages: number;
  pendingReviews: number;
  nextAppointment: DoctorNextAppointment | null;
}

const UPCOMING_STATUSES = new Set(['scheduled', 'confirmed', 'in_progress']);

export function useDoctorDashboard(userId: string | null | undefined) {
  return useQuery<DoctorDashboardData | null>(async () => {
    if (!userId) {
      return null;
    }

    const [
      { data: appointments, error: appointmentsError },
      { count: pendingNotesCount, error: pendingNotesError },
      { data: conversations, error: conversationsError },
    ] = await Promise.all([
      supabase
        .from('appointments')
        .select('id, patient_id, scheduled_at, type, status, chief_complaint')
        .eq('doctor_id', userId)
        .eq('is_deleted', false)
        .order('scheduled_at', { ascending: true }),
      supabase
        .from('consultation_notes')
        .select('id', { count: 'exact', head: true })
        .eq('doctor_id', userId)
        .eq('doctor_approved', false)
        .eq('is_deleted', false),
      supabase.from('conversations').select('id'),
    ]);

    if (appointmentsError) throw appointmentsError;
    if (pendingNotesError) throw pendingNotesError;
    if (conversationsError) throw conversationsError;

    const safeAppointments = appointments ?? [];
    const patientIds = Array.from(new Set(safeAppointments.map((appointment) => appointment.patient_id)));

    let patientNameById = new Map<string, string>();

    if (patientIds.length > 0) {
      const { data: patientProfiles, error: patientProfilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', patientIds);

      if (patientProfilesError) throw patientProfilesError;

      patientNameById = new Map(
        (patientProfiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? 'Patient'])
      );
    }

    const today = new Date().toISOString().slice(0, 10);
    const todayAppointments = safeAppointments.filter(
      (appointment) => appointment.scheduled_at.slice(0, 10) === today
    ).length;

    const nextAppointmentSource =
      safeAppointments.find((appointment) => {
        if (!UPCOMING_STATUSES.has(appointment.status)) {
          return false;
        }

        return new Date(appointment.scheduled_at).getTime() >= Date.now();
      }) ?? null;

    let unreadMessages = 0;
    const conversationIds = (conversations ?? []).map((conversation) => conversation.id);

    if (conversationIds.length > 0) {
      const { count, error: unreadMessagesError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .is('read_at', null)
        .neq('sender_id', userId);

      if (unreadMessagesError) throw unreadMessagesError;

      unreadMessages = count ?? 0;
    }

    return {
      totalPatients: patientIds.length,
      todayAppointments,
      unreadMessages,
      pendingReviews: pendingNotesCount ?? 0,
      nextAppointment: nextAppointmentSource
        ? {
            id: nextAppointmentSource.id,
            patientName: patientNameById.get(nextAppointmentSource.patient_id) ?? 'Patient',
            scheduledAt: nextAppointmentSource.scheduled_at,
            type: nextAppointmentSource.type,
            status: nextAppointmentSource.status,
            chiefComplaint: nextAppointmentSource.chief_complaint,
          }
        : null,
    };
  }, [userId]);
}
