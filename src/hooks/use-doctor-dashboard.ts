import { supabase } from '../lib/supabase';
import type { AppointmentStatus, AppointmentType, PreVisitAssessmentStatus } from '../types';
import { useQuery } from './use-query';

interface DoctorNextAppointment {
  id: string;
  patientName: string;
  scheduledAt: string;
  type: AppointmentType;
  status: AppointmentStatus;
  chiefComplaint: string | null;
}

export interface DoctorQueueAppointment {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  type: AppointmentType;
  status: AppointmentStatus;
  chiefComplaint: string | null;
  preVisitStatus: PreVisitAssessmentStatus | null;
}

export interface DoctorDashboardData {
  totalPatients: number;
  todayAppointments: number;
  unreadMessages: number;
  pendingReviews: number;
  nextAppointment: DoctorNextAppointment | null;
  todayQueue: DoctorQueueAppointment[];
}

interface AppointmentRow {
  id: string;
  patient_id: string;
  scheduled_at: string;
  type: AppointmentType;
  status: AppointmentStatus;
  chief_complaint: string | null;
}

const UPCOMING_STATUSES = new Set<AppointmentStatus>(['scheduled', 'confirmed', 'in_progress']);
const TODAY_ACTIVE_STATUSES = new Set<AppointmentStatus>(['scheduled', 'confirmed', 'in_progress', 'completed']);

const isSameLocalDay = (value: string, reference: Date) => {
  const date = new Date(value);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
};

export function useDoctorDashboard(userId: string | null | undefined) {
  return useQuery<DoctorDashboardData | null>(async () => {
    if (!userId) {
      return null;
    }

    const [
      { data: appointments, error: appointmentsError },
      { count: pendingNotesCount, error: pendingNotesError },
      { data: conversations, error: conversationsError },
      { count: patientUpdateReviewCount, error: patientUpdateReviewError },
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
      // RLS limits visible conversations to ones the current doctor participates in.
      supabase.from('conversations').select('id'),
      supabase
        .from('patient_canonical_update_requests')
        .select('id', { count: 'exact', head: true })
        .eq('requires_doctor_review', true)
        .eq('status', 'applied'),
    ]);

    if (appointmentsError) throw appointmentsError;
    if (pendingNotesError) throw pendingNotesError;
    if (conversationsError) throw conversationsError;
    if (patientUpdateReviewError) throw patientUpdateReviewError;

    const safeAppointments = (appointments ?? []) as AppointmentRow[];
    const patientIds = Array.from(new Set(safeAppointments.map((appointment) => appointment.patient_id)));
    const appointmentIds = safeAppointments.map((appointment) => appointment.id);

    const [
      { data: patientProfiles, error: patientProfilesError },
      { data: preVisitAssessments, error: preVisitAssessmentsError },
    ] = await Promise.all([
      patientIds.length > 0
        ? supabase.from('user_profiles').select('user_id, full_name').in('user_id', patientIds)
        : Promise.resolve({ data: [], error: null }),
      appointmentIds.length > 0
        ? supabase
            .from('appointment_pre_visit_assessments')
            .select('appointment_id, status')
            .in('appointment_id', appointmentIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (patientProfilesError) throw patientProfilesError;
    if (preVisitAssessmentsError) throw preVisitAssessmentsError;

    const patientNameById = new Map(
      (patientProfiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? 'Patient'])
    );
    const preVisitStatusByAppointmentId = new Map(
      (preVisitAssessments ?? []).map((assessment) => [assessment.appointment_id, assessment.status])
    );

    const now = new Date();

    const todayAppointments = safeAppointments.filter(
      (appointment) => TODAY_ACTIVE_STATUSES.has(appointment.status) && isSameLocalDay(appointment.scheduled_at, now)
    ).length;

    const nextAppointmentSource =
      safeAppointments.find((appointment) => {
        if (!UPCOMING_STATUSES.has(appointment.status)) {
          return false;
        }

        return appointment.status === 'in_progress' || new Date(appointment.scheduled_at).getTime() >= now.getTime();
      }) ?? null;

    const todayQueue = safeAppointments
      .filter(
        (appointment) => UPCOMING_STATUSES.has(appointment.status) && isSameLocalDay(appointment.scheduled_at, now)
      )
      .map((appointment) => ({
        id: appointment.id,
        patientId: appointment.patient_id,
        patientName: patientNameById.get(appointment.patient_id) ?? 'Patient',
        scheduledAt: appointment.scheduled_at,
        type: appointment.type,
        status: appointment.status,
        chiefComplaint: appointment.chief_complaint,
        preVisitStatus: preVisitStatusByAppointmentId.get(appointment.id) ?? null,
      }));

    const preVisitReviewCount = (preVisitAssessments ?? []).filter(
      (assessment) => assessment.status === 'completed'
    ).length;

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
      pendingReviews: (pendingNotesCount ?? 0) + preVisitReviewCount + (patientUpdateReviewCount ?? 0),
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
      todayQueue,
    };
  }, [userId]);
}
