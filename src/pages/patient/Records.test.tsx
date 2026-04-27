import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientRecords } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import { createSupabaseQueryBuilder } from '../../test/supabase-mock';
import { PatientRecords } from './Records';

vi.mock('../../components/Navigation', () => ({
  Navigation: () => <div data-testid="patient-navigation" />,
}));

vi.mock('../../hooks', () => ({
  usePatientRecords: vi.fn(),
}));

vi.mock('../../lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('PatientRecords', () => {
  const usePatientRecordsMock = vi.mocked(usePatientRecords);
  const useAuthMock = vi.mocked(useAuth);
  const fromMock = vi.mocked(supabase.from);

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { id: 'patient-1' },
    } as never);
  });

  it('renders canonical record counts and supports filtering', async () => {
    usePatientRecordsMock.mockReturnValue({
      data: {
        conditions: [
          {
            id: 'condition-1',
            patient_id: 'patient-1',
            condition_name: 'Hypertension',
            icd_code: 'I10',
            diagnosed_date: '2024-09-14',
            status: 'active',
            notes: 'Monitor at home',
            is_deleted: false,
            deleted_at: null,
            created_at: '2024-09-14T00:00:00Z',
            updated_at: '2024-09-14T00:00:00Z',
          },
        ],
        allergies: [
          {
            id: 'allergy-1',
            patient_id: 'patient-1',
            allergen: 'Shellfish',
            severity: 'moderate',
            reaction: 'Rash',
            confirmed_by_doctor: false,
            is_deleted: false,
            deleted_at: null,
            created_at: '2026-03-21T00:00:00Z',
            updated_at: '2026-03-21T00:00:00Z',
          },
        ],
        vaccinations: [
          {
            id: 'vaccination-1',
            patient_id: 'patient-1',
            vaccine_name: 'Influenza',
            dose_number: 1,
            administered_date: '2025-10-02',
            administered_by: 'Clinic',
            next_dose_due: '2026-10-02',
            is_deleted: false,
            deleted_at: null,
            created_at: '2025-10-02T00:00:00Z',
            updated_at: '2025-10-02T00:00:00Z',
          },
        ],
      },
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PatientRecords />);

    expect(screen.getByText('Medical Records')).toBeInTheDocument();
    expect(screen.getByText('Tracked diagnoses')).toBeInTheDocument();
    expect(screen.getByText('Severity-aware alerts')).toBeInTheDocument();
    expect(screen.getByText('Immunization history')).toBeInTheDocument();
    expect(
      screen.getByText((_, element) => element?.textContent === 'Showing 3 of 3 records')
    ).toBeInTheDocument();

    expect(screen.getByText('Hypertension')).toBeInTheDocument();
    expect(screen.getByText('Shellfish')).toBeInTheDocument();
    expect(screen.getByText('Influenza')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.type(
      screen.getByPlaceholderText('Search conditions, allergies, or vaccines...'),
      'shellfish'
    );

    expect(screen.queryByText('Hypertension')).not.toBeInTheDocument();
    expect(screen.getByText('Shellfish')).toBeInTheDocument();
  });

  it('submits a new condition and refetches the records', async () => {
    const refetch = vi.fn();
    const insertBuilder = createSupabaseQueryBuilder({
      data: null,
      error: null,
    });

    usePatientRecordsMock.mockReturnValue({
      data: {
        conditions: [],
        allergies: [],
        vaccinations: [],
      },
      loading: false,
      error: null,
      refetch,
    });
    fromMock.mockImplementation(
      ((table: string) => {
        if (table === 'medical_conditions') {
          return insertBuilder;
        }

        throw new Error(`Unexpected table ${table}`);
      }) as never
    );

    render(<PatientRecords />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.type(screen.getByRole('textbox', { name: 'Condition name' }), 'Asthma');
    await user.type(screen.getByRole('textbox', { name: 'ICD code' }), 'J45');
    await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Triggered by dust exposure.');
    await user.click(screen.getByRole('button', { name: 'Save condition' }));

    await waitFor(() => {
      expect(fromMock).toHaveBeenCalledWith('medical_conditions');
    });

    expect(insertBuilder.insert).toHaveBeenCalledWith({
      patient_id: 'patient-1',
      condition_name: 'Asthma',
      icd_code: 'J45',
      diagnosed_date: null,
      status: 'active',
      notes: 'Triggered by dust exposure.',
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });

    expect(screen.getByText('Condition added to your medical record.')).toBeInTheDocument();
  });
});
