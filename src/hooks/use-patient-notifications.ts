import type { Notification } from '../types';
import { useQuery } from './use-query';
import { supabase } from '../lib/supabase';

export interface PatientDerivedNotification {
  id: string;
  kind: 'message' | 'upcoming_appointment' | 'lab_result';
  title: string;
  body: string;
  createdAt: string;
  actionUrl: string;
}

export interface PatientNotificationsData {
  notifications: Notification[];
  derivedNotifications: PatientDerivedNotification[];
}

function addDays(iso: string, days: number): Date {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date;
}

export function usePatientNotifications(userId: string | null | undefined) {
  return useQuery<PatientNotificationsData | null>(async () => {
    if (!userId) {
      return null;
    }

    const nowIso = new Date().toISOString();
    const upcomingWindowIso = addDays(nowIso, 2).toISOString();
    const recentCutoffIso = addDays(nowIso, -14).toISOString();

    const [
      { data: notifications, error: notificationsError },
      { data: upcomingAppointments, error: upcomingAppointmentsError },
      { data: recentlyResulted, error: recentlyResultedError },
      { data: conversations, error: conversationsError },
    ] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('appointments')
        .select('id, doctor_id, scheduled_at, status, chief_complaint')
        .eq('patient_id', userId)
        .gte('scheduled_at', nowIso)
        .lte('scheduled_at', upcomingWindowIso)
        .in('status', ['scheduled', 'confirmed', 'in_progress'])
        .order('scheduled_at', { ascending: true })
        .limit(8),
      supabase
        .from('lab_orders')
        .select('id, doctor_id, status, ordered_at, updated_at')
        .eq('patient_id', userId)
        .eq('is_deleted', false)
        .in('status', ['resulted', 'reviewed'])
        .gte('updated_at', recentCutoffIso)
        .order('updated_at', { ascending: false })
        .limit(8),
      supabase
        .from('conversations')
        .select('id, participant_ids'),
    ]);

    if (notificationsError) throw notificationsError;
    if (upcomingAppointmentsError) throw upcomingAppointmentsError;
    if (recentlyResultedError) throw recentlyResultedError;
    if (conversationsError) throw conversationsError;

    const derivedNotifications: PatientDerivedNotification[] = [];

    const doctorIds = Array.from(
      new Set([
        ...(upcomingAppointments ?? []).map((appointment) => appointment.doctor_id),
        ...(recentlyResulted ?? []).map((labOrder) => labOrder.doctor_id),
      ])
    );

    const { data: doctorProfiles, error: doctorProfilesError } = doctorIds.length
      ? await supabase.from('user_profiles').select('user_id, full_name').in('user_id', doctorIds)
      : { data: [], error: null };

    if (doctorProfilesError) {
      throw doctorProfilesError;
    }

    const doctorNameById = new Map(
      (doctorProfiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? 'Your care team'])
    );

    for (const appointment of upcomingAppointments ?? []) {
      const doctorName = doctorNameById.get(appointment.doctor_id) ?? 'Your care team';
      derivedNotifications.push({
        id: `upcoming-${appointment.id}`,
        kind: 'upcoming_appointment',
        title: `Upcoming visit with ${doctorName}`,
        body: appointment.chief_complaint?.trim() || 'Review the appointment detail for preparation guidance.',
        createdAt: appointment.scheduled_at,
        actionUrl: `/patient/appointments/${appointment.id}`,
      });
    }

    for (const labOrder of recentlyResulted ?? []) {
      const doctorName = doctorNameById.get(labOrder.doctor_id) ?? 'Your care team';
      derivedNotifications.push({
        id: `lab-${labOrder.id}`,
        kind: 'lab_result',
        title: `New lab results from ${doctorName}`,
        body: 'Open your lab results to see details and ask the AI assistant for a plain-language explanation.',
        createdAt: labOrder.updated_at ?? labOrder.ordered_at,
        actionUrl: `/patient/lab-results`,
      });
    }

    const conversationsForUser = (conversations ?? []).filter((conversation) => {
      const participants = Array.isArray(conversation.participant_ids)
        ? conversation.participant_ids
        : [];
      return participants.includes(userId);
    });
    const conversationIds = conversationsForUser.map((conversation) => conversation.id);

    if (conversationIds.length > 0) {
      const { data: unreadMessages, error: unreadMessagesError } = await supabase
        .from('messages')
        .select('id, conversation_id, sender_id, body, sent_at')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .is('read_at', null)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (unreadMessagesError) {
        throw unreadMessagesError;
      }

      const senderIds = Array.from(
        new Set((unreadMessages ?? []).map((message) => message.sender_id).filter(Boolean))
      );
      const { data: senderProfiles, error: senderProfilesError } = senderIds.length
        ? await supabase.from('user_profiles').select('user_id, full_name').in('user_id', senderIds)
        : { data: [], error: null };

      if (senderProfilesError) {
        throw senderProfilesError;
      }

      const senderNameById = new Map(
        (senderProfiles ?? []).map((profile) => [profile.user_id, profile.full_name ?? 'Care team'])
      );

      for (const message of unreadMessages ?? []) {
        derivedNotifications.push({
          id: `message-${message.id}`,
          kind: 'message',
          title: `New message from ${senderNameById.get(message.sender_id) ?? 'Care team'}`,
          body: message.body?.trim() || 'Open the thread to review the latest care message.',
          createdAt: message.sent_at,
          actionUrl: `/patient/messages/${message.conversation_id}`,
        });
      }
    }

    derivedNotifications.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );

    return {
      notifications: (notifications ?? []) as Notification[],
      derivedNotifications,
    };
  }, [userId ?? '']);
}
