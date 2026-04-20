import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { usePatientPrescriptions } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { PatientPrescriptions } from './Prescriptions';

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

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

  it('renders active and historical prescriptions from normalized data', async () => {
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
              medication_name_ar: null,
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
              medication_name_ar: null,
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
              medication_name_ar: null,
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

    renderWithRouter(<PatientPrescriptions />);

    expect(screen.getByRole('heading', { name: /My Prescriptions/ })).toBeInTheDocument();
    expect(screen.getByText('Active Plans')).toBeInTheDocument();
    expect(screen.getAllByText('Active Medications').length).toBeGreaterThan(0);
    expect(screen.getByText('Pending Pickup')).toBeInTheDocument();
    expect(
      screen.getByText((_, element) =>
        element?.tagName === 'H3' && /Losartan/.test(element?.textContent ?? '') && /1 more/.test(element?.textContent ?? '')
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText('Metformin').length).toBeGreaterThan(0);

    const user = userEvent.setup();
    expect(screen.queryByText('Prescription History')).not.toBeInTheDocument();
    expect(screen.queryByText('Vitamin D3')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /Past Medications/i,
      })
    );

    expect(
      screen.getByText((_, element) =>
        element?.tagName === 'SPAN' && /Prescription History/.test(element?.textContent ?? '')
      )
    ).toBeInTheDocument();
    expect(screen.getAllByText('Vitamin D3').length).toBeGreaterThan(0);
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
              medication_name_ar: null,
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
              medication_name_ar: null,
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

    renderWithRouter(<PatientPrescriptions />);

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
