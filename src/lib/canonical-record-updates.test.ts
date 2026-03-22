import { describe, expect, it } from 'vitest';
import { buildPreVisitCanonicalUpdateDrafts } from './canonical-record-updates';
import type { PreVisitAnswerDraft, PreVisitAutofillContext } from './pre-visit';

const baseContext: PreVisitAutofillContext = {
  fullName: 'Patient One',
  dateOfBirth: '1990-01-01',
  gender: 'Female',
  address: 'Dubai Marina',
  phone: '+971500000001',
  city: 'Dubai',
  bloodType: 'O+',
  emergencyContactName: 'Parent One',
  emergencyContactPhone: '+971500000002',
  activeConditions: ['Diabetes'],
  allergies: ['Penicillin'],
  activeMedications: ['Metformin'],
  memoryFactsByKey: new Map(),
};

const makeAnswer = (overrides: Partial<PreVisitAnswerDraft>): PreVisitAnswerDraft => ({
  questionKey: 'question',
  questionLabel: 'Question',
  questionType: 'short_text',
  memoryKey: null,
  answerText: null,
  answerJson: null,
  autofillValue: null,
  autofillSource: null,
  autofillLabel: null,
  autofilled: false,
  confirmedByPatient: true,
  answeredAt: '2026-03-22T09:00:00.000Z',
  ...overrides,
});

describe('buildPreVisitCanonicalUpdateDrafts', () => {
  it('detects changed scalar profile fields', () => {
    const drafts = buildPreVisitCanonicalUpdateDrafts({
      patientId: 'patient-1',
      sourceRecordId: 'assessment-1',
      context: baseContext,
      answers: [
        makeAnswer({
          questionKey: 'address',
          questionLabel: 'Address',
          answerText: 'Abu Dhabi',
          autofillSource: 'profile.address',
          autofilled: true,
        }),
      ],
    });

    expect(drafts).toMatchObject([
      {
        targetField: 'profile.address',
        displayLabel: 'Address',
        applyStrategy: 'user_profile_scalar',
        currentValue: { value: 'Dubai Marina' },
        proposedValue: { value: 'Abu Dhabi' },
      },
    ]);
  });

  it('skips unchanged canonical values', () => {
    const drafts = buildPreVisitCanonicalUpdateDrafts({
      patientId: 'patient-1',
      sourceRecordId: 'assessment-1',
      context: baseContext,
      answers: [
        makeAnswer({
          questionKey: 'city',
          questionLabel: 'City',
          answerText: 'Dubai',
          autofillSource: 'profile.city',
          autofilled: true,
        }),
      ],
    });

    expect(drafts).toEqual([]);
  });

  it('detects condition list replacements', () => {
    const drafts = buildPreVisitCanonicalUpdateDrafts({
      patientId: 'patient-1',
      sourceRecordId: 'assessment-1',
      context: baseContext,
      answers: [
        makeAnswer({
          questionKey: 'conditions',
          questionLabel: 'Current conditions',
          questionType: 'multi_select',
          answerText: 'Diabetes, Hypertension',
          answerJson: ['Diabetes', 'Hypertension'],
          autofillSource: 'medical_conditions.active',
          autofilled: true,
        }),
      ],
    });

    expect(drafts).toMatchObject([
      {
        targetField: 'medical_conditions.active',
        applyStrategy: 'medical_conditions_replace',
        currentValue: { values: ['Diabetes'] },
        proposedValue: { values: ['Diabetes', 'Hypertension'] },
      },
    ]);
  });

  it('routes medication changes through doctor-reviewed patient-reported storage', () => {
    const drafts = buildPreVisitCanonicalUpdateDrafts({
      patientId: 'patient-1',
      sourceRecordId: 'assessment-1',
      context: baseContext,
      answers: [
        makeAnswer({
          questionKey: 'medications',
          questionLabel: 'Current medications',
          questionType: 'multi_select',
          answerText: 'Metformin, Omeprazole',
          answerJson: ['Metformin', 'Omeprazole'],
          autofillSource: 'prescriptions.active',
          autofilled: true,
        }),
      ],
    });

    expect(drafts).toMatchObject([
      {
        targetField: 'medications.current',
        applyStrategy: 'patient_reported_medications_replace',
        requiresDoctorReview: true,
        currentValue: { values: ['Metformin'] },
        proposedValue: { values: ['Metformin', 'Omeprazole'] },
      },
    ]);
  });
});
