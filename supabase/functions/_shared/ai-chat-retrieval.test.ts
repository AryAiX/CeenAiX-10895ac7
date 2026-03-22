import { describe, expect, it } from 'vitest';
import {
  buildEvidenceItems,
  createPromptContext,
  createSuggestedActions,
  planPatientRetrieval,
  type PatientRetrievalBundle,
} from './ai-chat-retrieval';

const bundle: PatientRetrievalBundle = {
  conditions: [
    {
      id: 'condition-1',
      conditionName: 'Type 2 Diabetes',
      status: 'active',
      diagnosedDate: '2024-09-14',
      notes: 'Monitor glucose trends and HbA1c.',
    },
    {
      id: 'condition-2',
      conditionName: 'Hypertension',
      status: 'active',
      diagnosedDate: '2024-11-04',
      notes: 'Home blood pressure monitoring.',
    },
  ],
  allergies: [
    {
      id: 'allergy-1',
      allergen: 'Penicillin',
      severity: 'severe',
      reaction: 'Hives and shortness of breath',
    },
  ],
  prescriptions: [
    {
      id: 'prescription-1',
      status: 'active',
      prescribedAt: '2026-02-10',
      items: [
        {
          id: 'item-1',
          medicationName: 'Metformin',
          dosage: '500 mg',
          frequency: 'Twice daily',
          duration: '30 days',
          instructions: 'Take with meals',
          isDispensed: true,
        },
      ],
    },
  ],
  appointments: [
    {
      id: 'appointment-1',
      status: 'completed',
      scheduledAt: '2026-03-01',
      chiefComplaint: 'Headache and dizziness',
      notes: 'Episodes worse late in the day',
      doctorSummary: 'Tension headache versus migraine',
      doctorPlan: 'Hydration, sleep review, and symptom tracking',
      doctorSubjective: 'Headaches three times weekly',
    },
  ],
  labResults: [
    {
      id: 'lab-1',
      orderedAt: '2026-02-14',
      status: 'completed',
      testName: 'HbA1c',
      resultValue: '7.1',
      resultUnit: '%',
      referenceRange: '< 5.7',
      isAbnormal: true,
      resultedAt: '2026-02-16',
    },
  ],
  memoryFacts: [
    {
      id: 'memory-1',
      memoryKey: 'symptom_duration',
      label: 'Duration of symptoms',
      valueText: 'Two days',
      valueJson: null,
      status: 'confirmed',
      sourceKind: 'pre_visit_answer',
      createdAt: '2026-03-20',
      confirmedAt: '2026-03-20',
    },
  ],
};

describe('ai-chat retrieval helpers', () => {
  it('plans retrieval without requiring explicit history hints', () => {
    const plan = planPatientRetrieval('Why do I keep getting headaches?');

    expect(plan.intent).toBe('symptom_question');
    expect(plan.expandedTerms).toEqual(expect.arrayContaining(['headache', 'migraine', 'neurology']));
    expect(plan.historyHintPresent).toBe(false);
    expect(plan.recommendedSpecialty).toBe('Neurology');
  });

  it('prioritizes relevant evidence for symptom questions', () => {
    const plan = planPatientRetrieval('Why do I keep getting headaches?');
    const evidence = buildEvidenceItems(bundle, plan);

    expect(evidence[0]).toMatchObject({
      sourceType: 'consultation_note',
      title: 'Headache and dizziness',
    });
    expect(evidence.some((item) => item.title === 'Metformin')).toBe(true);
  });

  it('builds booking handoff actions with specialization filters', () => {
    const plan = planPatientRetrieval('I need a doctor for my headaches and dizziness.');
    const actions = createSuggestedActions({
      plan,
      nextAppointmentId: 'appointment-2',
      recommendedSpecializationId: 'specialty-1',
      reason: 'Headaches and dizziness',
    });

    expect(actions).toEqual([
      {
        label: 'Book a Neurology visit',
        href: '/patient/appointments/book?reason=Headaches%20and%20dizziness&specialization=specialty-1',
      },
    ]);
  });

  it('creates compact prompt context from the top evidence', () => {
    const plan = planPatientRetrieval('Summarize my diabetes history.');
    const evidence = buildEvidenceItems(bundle, plan);
    const promptContext = createPromptContext({ plan, evidence, bundle });

    expect(promptContext).toContain('INTENT: history_summary');
    expect(promptContext).toContain('Type 2 Diabetes');
    expect(promptContext).toContain('HbA1c');
  });

  it('can rank reusable patient memory for matching symptom detail prompts', () => {
    const plan = planPatientRetrieval('How long has this been going on?');
    const evidence = buildEvidenceItems(bundle, plan);

    expect(evidence.some((item) => item.sourceType === 'patient_memory' && item.title === 'Duration of symptoms')).toBe(
      true
    );
  });
});
