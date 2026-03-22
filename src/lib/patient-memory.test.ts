import { describe, expect, it } from 'vitest';
import {
  buildPatientMemoryValue,
  inferPatientMemoryKey,
  resolvePatientMemoryFacts,
  type PatientMemoryFactRecord,
} from './patient-memory';

describe('patient memory helpers', () => {
  it('maps semantically similar duration prompts to the same memory key', () => {
    expect(
      inferPatientMemoryKey({
        label: 'How long have you had this pain?',
        fallbackKey: 'how_long_have_you_had_this_pain',
      })
    ).toBe('symptom_duration');

    expect(
      inferPatientMemoryKey({
        label: 'Duration of symptoms',
        fallbackKey: 'duration_of_symptoms',
      })
    ).toBe('symptom_duration');
  });

  it('does not assign reusable memory keys to canonical autofill questions', () => {
    expect(
      inferPatientMemoryKey({
        label: 'Date of birth',
        fallbackKey: 'date_of_birth',
        autofillSource: 'profile.date_of_birth',
      })
    ).toBeNull();
  });

  it('prefers confirmed pre-visit facts over suggested chat facts for the same memory key', () => {
    const facts: PatientMemoryFactRecord[] = [
      {
        id: 'chat-fact',
        patientId: 'patient-1',
        sourceKind: 'ai_chat_message',
        sourceRecordId: 'message-1',
        memoryKey: 'symptom_duration',
        label: 'Duration of symptoms',
        valueType: 'text',
        valueText: 'One day',
        valueJson: null,
        status: 'suggested',
        confidence: 0.62,
        usableInChat: true,
        usableInForms: true,
        confirmedAt: null,
        lastUsedAt: null,
        metadata: {},
        createdAt: '2026-03-21T10:00:00.000Z',
        updatedAt: '2026-03-21T10:00:00.000Z',
      },
      {
        id: 'form-fact',
        patientId: 'patient-1',
        sourceKind: 'pre_visit_answer',
        sourceRecordId: 'assessment-1',
        memoryKey: 'symptom_duration',
        label: 'Duration of symptoms',
        valueType: 'text',
        valueText: 'Three days',
        valueJson: null,
        status: 'confirmed',
        confidence: 1,
        usableInChat: true,
        usableInForms: true,
        confirmedAt: '2026-03-22T08:00:00.000Z',
        lastUsedAt: null,
        metadata: {},
        createdAt: '2026-03-22T08:00:00.000Z',
        updatedAt: '2026-03-22T08:00:00.000Z',
      },
    ];

    const resolved = resolvePatientMemoryFacts(facts);

    expect(resolved.get('symptom_duration')).toMatchObject({
      id: 'form-fact',
      valueText: 'Three days',
      sourceLabel: 'From your previous answer',
    });
  });

  it('normalizes confirmed multi-select answers for memory persistence', () => {
    expect(
      buildPatientMemoryValue({
        questionType: 'multi_select',
        answerText: 'Nausea, Bloating',
        answerJson: ['Nausea', 'Bloating'],
      })
    ).toEqual({
      valueType: 'text_list',
      valueText: 'Nausea, Bloating',
      valueJson: ['Nausea', 'Bloating'],
    });
  });
});
