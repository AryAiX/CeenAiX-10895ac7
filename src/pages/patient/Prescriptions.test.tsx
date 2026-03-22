import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePatientPrescriptions } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { PatientPrescriptions } from './Prescriptions';

vi.mock('../../components/Navigation', () => ({
  Navigation: () => <div data-testid="patient-navigation" />,
}));

vi.mock('../../hooks', () => ({
  usePatientPrescriptions: vi.fn(),
}));

vi.mock('../../lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

describe('PatientPrescriptions', () => {
  const usePatientPrescriptionsMock = vi.mocked(usePatientPrescriptions);
  const useAuthMock = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      user: { id: 'patient-1' },
    } as never);
  });

  it('renders active and historical prescriptions from normalized data', () => {
    usePatientPrescriptionsMock.mockReturnValue({
      data: [
        {
          id: 'prescription-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          appointment_id: 'appointment-1',
          status: 'active',
          prescribed_at: '2026-02-10T05:15:00Z',
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-02-10T05:15:00Z',
          updated_at: '2026-02-10T05:15:00Z',
          doctorName: 'Doctor 1',
          doctorSpecialty: 'General Surgery',
          items: [
            {
              id: 'item-1',
              prescription_id: 'prescription-1',
              medication_name: 'Losartan',
              dosage: '50 mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              instructions: 'Take in the morning',
              is_dispensed: true,
              created_at: '2026-02-10T05:15:00Z',
              updated_at: '2026-02-10T05:15:00Z',
            },
            {
              id: 'item-2',
              prescription_id: 'prescription-1',
              medication_name: 'Metformin',
              dosage: '500 mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              instructions: 'Take with meals',
              is_dispensed: false,
              created_at: '2026-02-10T05:15:00Z',
              updated_at: '2026-02-10T05:15:00Z',
            },
          ],
        },
        {
          id: 'prescription-2',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          appointment_id: 'appointment-2',
          status: 'completed',
          prescribed_at: '2026-01-18T07:45:00Z',
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-01-18T07:45:00Z',
          updated_at: '2026-01-18T07:45:00Z',
          doctorName: 'Doctor 1',
          doctorSpecialty: 'General Surgery',
          items: [
            {
              id: 'item-3',
              prescription_id: 'prescription-2',
              medication_name: 'Vitamin D3',
              dosage: '2000 IU',
              frequency: 'Once daily',
              duration: '60 days',
              quantity: 60,
              instructions: 'Completed course',
              is_dispensed: true,
              created_at: '2026-01-18T07:45:00Z',
              updated_at: '2026-01-18T07:45:00Z',
            },
          ],
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PatientPrescriptions />);

    expect(screen.getByText('My Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getByText('Active Medications')).toBeInTheDocument();
    expect(screen.getByText('Pending Pickup')).toBeInTheDocument();
    expect(screen.getByText('Losartan + 1 more')).toBeInTheDocument();
    expect(screen.getByText('Metformin')).toBeInTheDocument();
    expect(screen.getAllByText('Vitamin D3').length).toBeGreaterThan(0);
    expect(screen.getByText('Prescription History')).toBeInTheDocument();
  });

  it('supports refill follow-up selection and text filtering', async () => {
    usePatientPrescriptionsMock.mockReturnValue({
      data: [
        {
          id: 'prescription-1',
          patient_id: 'patient-1',
          doctor_id: 'doctor-1',
          appointment_id: 'appointment-1',
          status: 'active',
          prescribed_at: '2026-02-10T05:15:00Z',
          is_deleted: false,
          deleted_at: null,
          created_at: '2026-02-10T05:15:00Z',
          updated_at: '2026-02-10T05:15:00Z',
          doctorName: 'Doctor 1',
          doctorSpecialty: 'General Surgery',
          items: [
            {
              id: 'item-1',
              prescription_id: 'prescription-1',
              medication_name: 'Losartan',
              dosage: '50 mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              instructions: 'Take in the morning',
              is_dispensed: true,
              created_at: '2026-02-10T05:15:00Z',
              updated_at: '2026-02-10T05:15:00Z',
            },
            {
              id: 'item-2',
              prescription_id: 'prescription-1',
              medication_name: 'Metformin',
              dosage: '500 mg',
              frequency: 'Twice daily',
              duration: '30 days',
              quantity: 60,
              instructions: 'Take with meals',
              is_dispensed: false,
              created_at: '2026-02-10T05:15:00Z',
              updated_at: '2026-02-10T05:15:00Z',
            },
          ],
        },
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PatientPrescriptions />);

    const user = userEvent.setup();
    await user.click(screen.getAllByRole('button', { name: 'Mark for refill follow-up' })[1]);

    expect(
      screen.getByText((_, element) =>
        element?.textContent === 'Selected medication: Metformin'
      )
    ).toBeInTheDocument();

    await user.type(
      screen.getByPlaceholderText('Search medications, dosage, or prescribing doctor...'),
      'metformin'
    );

    expect(screen.getAllByText('Metformin').length).toBeGreaterThan(0);
    expect(screen.queryByText('Vitamin D3')).not.toBeInTheDocument();
  });
});
