import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '../lib/supabase';
import { createSupabaseQueryBuilder } from '../test/supabase-mock';
import { usePatientAiChat } from './use-patient-ai-chat';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('usePatientAiChat', () => {
  const fromMock = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null without a signed-in patient', async () => {
    const { result } = renderHook(() => usePatientAiChat(undefined));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it('loads session summaries, selected-session messages, and context summary counts', async () => {
    const sessionsBuilder = createSupabaseQueryBuilder({
      data: [{ id: 'session-1', started_at: '2026-03-21T10:00:00Z' }],
      error: null,
    });
    const conditionsBuilder = createSupabaseQueryBuilder({
      data: [{ id: 'condition-1' }, { id: 'condition-2' }],
      error: null,
    });
    const allergiesBuilder = createSupabaseQueryBuilder({
      data: [{ id: 'allergy-1' }],
      error: null,
    });
    const prescriptionsBuilder = createSupabaseQueryBuilder({
      data: [
        { id: 'prescription-1', status: 'active' },
        { id: 'prescription-2', status: 'completed' },
      ],
      error: null,
    });
    const appointmentsBuilder = createSupabaseQueryBuilder({
      data: [
        { id: 'appointment-1', status: 'scheduled', doctor_id: 'doctor-1', scheduled_at: '2026-03-22T09:00:00Z', chief_complaint: 'Headache' },
        { id: 'appointment-2', status: 'completed', doctor_id: 'doctor-1', scheduled_at: '2026-03-01T09:00:00Z', chief_complaint: 'Follow-up' },
      ],
      error: null,
    });
    const nextAppointmentBuilder = createSupabaseQueryBuilder({
      data: [
        { id: 'appointment-1', doctor_id: 'doctor-1', scheduled_at: '2026-03-22T09:00:00Z', chief_complaint: 'Headache' },
      ],
      error: null,
    });
    const labOrdersBuilder = createSupabaseQueryBuilder({
      data: [{ id: 'lab-order-1' }],
      error: null,
    });
    const messagesBuilder = createSupabaseQueryBuilder({
      data: [
        {
          id: 'message-2',
          session_id: 'session-1',
          role: 'user',
          content: 'Summarize my records.',
          created_at: '2026-03-21T10:02:00Z',
          attachments: [],
        },
        {
          id: 'message-1',
          session_id: 'session-1',
          role: 'assistant',
          content: 'How can I help?',
          created_at: '2026-03-21T10:01:00Z',
          attachments: [],
        },
      ],
      error: null,
    });
    const labOrderItemsBuilder = createSupabaseQueryBuilder({
      data: null,
      error: null,
      count: 2,
    });
    const doctorProfileBuilder = createSupabaseQueryBuilder({
      data: {
        user_id: 'doctor-1',
        full_name: 'Doctor 1',
      },
      error: null,
    });
    let appointmentsQueryCount = 0;

    fromMock.mockImplementation(
      ((table: string) => {
        if (table === 'ai_chat_sessions') {
          return sessionsBuilder;
        }

        if (table === 'medical_conditions') {
          return conditionsBuilder;
        }

        if (table === 'allergies') {
          return allergiesBuilder;
        }

        if (table === 'prescriptions') {
          return prescriptionsBuilder;
        }

        if (table === 'appointments') {
          appointmentsQueryCount += 1;
          return appointmentsQueryCount === 1 ? appointmentsBuilder : nextAppointmentBuilder;
        }

        if (table === 'lab_orders') {
          return labOrdersBuilder;
        }

        if (table === 'ai_chat_messages') {
          return messagesBuilder;
        }

        if (table === 'lab_order_items') {
          return labOrderItemsBuilder;
        }

        if (table === 'user_profiles') {
          return doctorProfileBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }) as never
    );

    const { result } = renderHook(() => usePatientAiChat('patient-1', 'session-1'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({
      sessionId: 'session-1',
      sessions: [
        {
          id: 'session-1',
          startedAt: '2026-03-21T10:00:00Z',
          lastMessageAt: '2026-03-21T10:02:00Z',
          preview: 'Summarize my records.',
        },
      ],
      messages: [
        {
          id: 'message-1',
          role: 'assistant',
          content: 'How can I help?',
          createdAt: '2026-03-21T10:01:00Z',
          attachments: [],
        },
        {
          id: 'message-2',
          role: 'user',
          content: 'Summarize my records.',
          createdAt: '2026-03-21T10:02:00Z',
          attachments: [],
        },
      ],
      contextSummary: {
        conditionsCount: 2,
        allergiesCount: 1,
        activeMedicationCount: 1,
        recentAppointmentsCount: 2,
        labResultCount: 2,
      },
      nextAppointment: {
        id: 'appointment-1',
        scheduledAt: '2026-03-22T09:00:00Z',
        chiefComplaint: 'Headache',
        doctorName: 'Doctor 1',
      },
    });

    expect(sessionsBuilder.eq).toHaveBeenCalledWith('user_id', 'patient-1');
    expect(messagesBuilder.in).toHaveBeenCalledWith('session_id', ['session-1']);
    expect(labOrderItemsBuilder.in).toHaveBeenCalledWith('lab_order_id', ['lab-order-1']);
    expect(labOrderItemsBuilder.not).toHaveBeenCalledWith('resulted_at', 'is', null);
    expect(doctorProfileBuilder.eq).toHaveBeenCalledWith('user_id', 'doctor-1');
  });
});
