import { supabase } from '../lib/supabase';
import { CLINIC_TIME_ZONE, isSameCalendarDayInTimeZone } from '../lib/i18n-ui';
import { getMessagePreviewText } from '../lib/messaging';
import type { AppointmentStatus, AppointmentType, LabOrderStatus, PreVisitAssessmentStatus } from '../types';
import { useQuery } from './use-query';

interface DoctorNextAppointment {
  id: string;
  patientId: string;
  patientName: string;
  scheduledAt: string;
  type: AppointmentType;
  status: AppointmentStatus;
  chiefComplaint: string | null;
}

export interface DoctorDashboardMessagePreview {
  id: string;
  conversationId: string;
  patientId: string;
  patientName: string;
  subject: string | null;
  body: string;
  sentAt: string;
  readAt: string | null;
}

export interface DoctorCriticalResult {
  id: string;
  labOrderId: string;
  patientId: string;
  patientName: string;
  testName: string;
  resultValue: string | null;
  resultUnit: string | null;
  referenceRange: string | null;
  resultedAt: string;
  labOrderStatus: LabOrderStatus;
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
  completedTodayAppointments: number;
  remainingTodayAppointments: number;
  inProgressAppointments: number;
  unreadMessages: number;
  pendingReviews: number;
  activeConsultation: DoctorNextAppointment | null;
  nextAppointment: DoctorNextAppointment | null;
  todaySchedule: DoctorQueueAppointment[];
  todayQueue: DoctorQueueAppointment[];
  criticalResults: DoctorCriticalResult[];
  recentLabResults: DoctorCriticalResult[];
  recentMessages: DoctorDashboardMessagePreview[];
}

interface AppointmentRow {
  id: string;
  patient_id: string;
  scheduled_at: string;
  type: AppointmentType;
  status: AppointmentStatus;
  chief_complaint: string | null;
}

interface ConversationRow {
  id: string;
  subject: string | null;
  participant_ids: string[];
}

interface MessagePreviewRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

interface LabOrderRow {
  id: string;
  patient_id: string;
  status: LabOrderStatus;
}

interface LabOrderItemRow {
  id: string;
  lab_order_id: string;
  test_name: string;
  result_value: string | null;
  result_unit: string | null;
  reference_range: string | null;
  is_abnormal: boolean | null;
  resulted_at: string | null;
}

const UPCOMING_STATUSES = new Set<AppointmentStatus>(['scheduled', 'confirmed', 'in_progress']);
const TODAY_ACTIVE_STATUSES = new Set<AppointmentStatus>(['scheduled', 'confirmed', 'in_progress', 'completed']);

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
      supabase.from('conversations').select('id, subject, participant_ids'),
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
    const safeConversations = (conversations ?? []) as ConversationRow[];
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
    const todayAppointmentRows = safeAppointments.filter(
      (appointment) =>
        TODAY_ACTIVE_STATUSES.has(appointment.status) &&
        isSameCalendarDayInTimeZone(appointment.scheduled_at, now, CLINIC_TIME_ZONE)
    );

    const todayAppointments = todayAppointmentRows.length;
    const completedTodayAppointments = todayAppointmentRows.filter((appointment) => appointment.status === 'completed').length;
    const inProgressAppointmentRows = safeAppointments.filter((appointment) => appointment.status === 'in_progress');
    const inProgressAppointments = inProgressAppointmentRows.length;
    const activeConsultationSource = inProgressAppointmentRows[0] ?? null;
    const remainingTodayAppointments = todayAppointmentRows.filter((appointment) =>
      ['scheduled', 'confirmed', 'in_progress'].includes(appointment.status)
    ).length;

    const nextAppointmentSource =
      safeAppointments.find((appointment) => {
        if (!UPCOMING_STATUSES.has(appointment.status) || appointment.status === 'in_progress') {
          return false;
        }

        return new Date(appointment.scheduled_at).getTime() >= now.getTime();
      }) ?? null;

    const todayQueue = safeAppointments
      .filter(
        (appointment) =>
          UPCOMING_STATUSES.has(appointment.status) &&
          isSameCalendarDayInTimeZone(appointment.scheduled_at, now, CLINIC_TIME_ZONE)
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
    const todaySchedule = safeAppointments
      .filter(
        (appointment) =>
          TODAY_ACTIVE_STATUSES.has(appointment.status) &&
          isSameCalendarDayInTimeZone(appointment.scheduled_at, now, CLINIC_TIME_ZONE)
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
    let recentMessages: DoctorDashboardMessagePreview[] = [];
    let criticalResults: DoctorCriticalResult[] = [];
    let recentLabResults: DoctorCriticalResult[] = [];
    const conversationIds = safeConversations.map((conversation) => conversation.id);

    if (conversationIds.length > 0) {
      const [
        { count, error: unreadMessagesError },
        { data: recentMessageRows, error: recentMessagesError },
      ] = await Promise.all([
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .is('read_at', null)
          .neq('sender_id', userId),
        supabase
          .from('messages')
          .select('id, conversation_id, sender_id, body, sent_at, read_at')
          .in('conversation_id', conversationIds)
          .neq('sender_id', userId)
          .order('sent_at', { ascending: false })
          .limit(4),
      ]);

      if (unreadMessagesError) throw unreadMessagesError;
      if (recentMessagesError) throw recentMessagesError;

      unreadMessages = count ?? 0;

      const conversationById = new Map(safeConversations.map((conversation) => [conversation.id, conversation]));
      recentMessages = ((recentMessageRows ?? []) as MessagePreviewRow[])
        .map((message) => {
          const conversation = conversationById.get(message.conversation_id);
          const patientId =
            conversation?.participant_ids.find((participantId) => participantId !== userId) ?? message.sender_id;

          return {
            id: message.id,
            conversationId: message.conversation_id,
            patientId,
            patientName: patientNameById.get(patientId) ?? 'Patient',
            subject: conversation?.subject ?? null,
            body: getMessagePreviewText(message.body).trim() || message.body,
            sentAt: message.sent_at,
            readAt: message.read_at,
          };
        })
        .filter((message) => Boolean(message.patientId));
    }

    const { data: labOrders, error: labOrdersError } = await supabase
      .from('lab_orders')
      .select('id, patient_id, status')
      .eq('doctor_id', userId)
      .eq('is_deleted', false)
      .in('status', ['resulted', 'reviewed'])
      .order('ordered_at', { ascending: false })
      .limit(20);

    if (labOrdersError) throw labOrdersError;

    const safeLabOrders = (labOrders ?? []) as LabOrderRow[];
    const labOrderIds = safeLabOrders.map((labOrder) => labOrder.id);

    if (labOrderIds.length > 0) {
      const { data: labOrderItems, error: labOrderItemsError } = await supabase
        .from('lab_order_items')
        .select('id, lab_order_id, test_name, result_value, result_unit, reference_range, is_abnormal, resulted_at')
        .in('lab_order_id', labOrderIds)
        .eq('status', 'resulted')
        .not('resulted_at', 'is', null)
        .order('resulted_at', { ascending: false })
        .limit(20);

      if (labOrderItemsError) throw labOrderItemsError;

      const labOrderById = new Map(safeLabOrders.map((labOrder) => [labOrder.id, labOrder]));

      const normalizedLabResults = ((labOrderItems ?? []) as LabOrderItemRow[])
        .filter((item) => item.resulted_at)
        .map((item) => {
          const labOrder = labOrderById.get(item.lab_order_id);
          const patientId = labOrder?.patient_id ?? '';

          return {
            id: item.id,
            labOrderId: item.lab_order_id,
            patientId,
            patientName: patientNameById.get(patientId) ?? 'Patient',
            testName: item.test_name,
            resultValue: item.result_value,
            resultUnit: item.result_unit,
            referenceRange: item.reference_range,
            resultedAt: item.resulted_at as string,
            labOrderStatus: labOrder?.status ?? 'reviewed',
            isAbnormal: item.is_abnormal === true,
          };
        });

      criticalResults = normalizedLabResults
        .filter((item) => item.isAbnormal && item.labOrderStatus === 'resulted')
        .slice(0, 3)
        .map(({ isAbnormal: _isAbnormal, ...item }) => item);

      recentLabResults = normalizedLabResults
        .filter((item) => item.isAbnormal)
        .slice(0, 4)
        .map(({ isAbnormal: _isAbnormal, ...item }) => item);
    }

    return {
      totalPatients: patientIds.length,
      todayAppointments,
      completedTodayAppointments,
      remainingTodayAppointments,
      inProgressAppointments,
      unreadMessages,
      pendingReviews: (pendingNotesCount ?? 0) + preVisitReviewCount + (patientUpdateReviewCount ?? 0),
      activeConsultation: activeConsultationSource
        ? {
            id: activeConsultationSource.id,
            patientId: activeConsultationSource.patient_id,
            patientName: patientNameById.get(activeConsultationSource.patient_id) ?? 'Patient',
            scheduledAt: activeConsultationSource.scheduled_at,
            type: activeConsultationSource.type,
            status: activeConsultationSource.status,
            chiefComplaint: activeConsultationSource.chief_complaint,
          }
        : null,
      nextAppointment: nextAppointmentSource
        ? {
            id: nextAppointmentSource.id,
            patientId: nextAppointmentSource.patient_id,
            patientName: patientNameById.get(nextAppointmentSource.patient_id) ?? 'Patient',
            scheduledAt: nextAppointmentSource.scheduled_at,
            type: nextAppointmentSource.type,
            status: nextAppointmentSource.status,
            chiefComplaint: nextAppointmentSource.chief_complaint,
          }
        : null,
      todaySchedule,
      todayQueue,
      criticalResults,
      recentLabResults,
      recentMessages,
    };
  }, [userId]);
}
