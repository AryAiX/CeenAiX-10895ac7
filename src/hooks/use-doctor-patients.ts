import { supabase } from '../lib/supabase';
import type { AppointmentStatus } from '../types';
import { useQuery } from './use-query';

const UPCOMING_STATUSES = new Set<AppointmentStatus>(['scheduled', 'confirmed', 'in_progress']);

export interface DoctorPatientSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bloodType: string | null;
  totalAppointments: number;
  upcomingAppointments: number;
  nextAppointment: string | null;
  lastAppointment: string | null;
  latestChiefComplaint: string | null;
}

interface AppointmentRow {
  id: string;
  patient_id: string;
  scheduled_at: string;
  status: AppointmentStatus;
  chief_complaint: string | null;
}

interface UserProfileRow {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
}

interface PatientProfileRow {
  user_id: string;
  blood_type: string | null;
}

const compareNullableDateAsc = (left: string | null, right: string | null) => {
  if (left && right) {
    return new Date(left).getTime() - new Date(right).getTime();
  }
  if (left) {
    return -1;
  }
  if (right) {
    return 1;
  }
  return 0;
};

const compareNullableDateDesc = (left: string | null, right: string | null) => {
  if (left && right) {
    return new Date(right).getTime() - new Date(left).getTime();
  }
  if (left) {
    return -1;
  }
  if (right) {
    return 1;
  }
  return 0;
};

export function useDoctorPatients(userId: string | null | undefined) {
  return useQuery<DoctorPatientSummary[]>(async () => {
    if (!userId) {
      return [];
    }

    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select('id, patient_id, scheduled_at, status, chief_complaint')
      .eq('doctor_id', userId)
      .eq('is_deleted', false)
      .order('scheduled_at', { ascending: false });

    if (appointmentsError) {
      throw appointmentsError;
    }

    const safeAppointments = (appointments ?? []) as AppointmentRow[];
    const patientIds = Array.from(new Set(safeAppointments.map((appointment) => appointment.patient_id)));

    if (patientIds.length === 0) {
      return [];
    }

    const [
      { data: userProfiles, error: userProfilesError },
      { data: patientProfiles, error: patientProfilesError },
    ] = await Promise.all([
      supabase
        .from('user_profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', patientIds),
      supabase.from('patient_profiles').select('user_id, blood_type').in('user_id', patientIds),
    ]);

    if (userProfilesError) {
      throw userProfilesError;
    }

    if (patientProfilesError) {
      throw patientProfilesError;
    }

    const profileById = new Map(
      ((userProfiles ?? []) as UserProfileRow[]).map((profile) => [profile.user_id, profile])
    );
    const patientProfileById = new Map(
      ((patientProfiles ?? []) as PatientProfileRow[]).map((profile) => [profile.user_id, profile])
    );

    const now = Date.now();

    const summaries = patientIds.map((patientId) => {
      const appointmentsForPatient = safeAppointments.filter((appointment) => appointment.patient_id === patientId);
      const ascendingAppointments = [...appointmentsForPatient].sort((left, right) =>
        left.scheduled_at.localeCompare(right.scheduled_at)
      );

      const nextAppointment =
        ascendingAppointments.find((appointment) => {
          if (!UPCOMING_STATUSES.has(appointment.status)) {
            return false;
          }
          return new Date(appointment.scheduled_at).getTime() >= now || appointment.status === 'in_progress';
        }) ?? null;

      const lastAppointment =
        [...ascendingAppointments]
          .reverse()
          .find((appointment) => new Date(appointment.scheduled_at).getTime() < now) ?? null;

      const profile = profileById.get(patientId);
      const patientProfile = patientProfileById.get(patientId);
      const latestAppointment = appointmentsForPatient[0] ?? null;

      return {
        id: patientId,
        name: profile?.full_name?.trim() || 'Patient',
        email: profile?.email ?? null,
        phone: profile?.phone ?? null,
        bloodType: patientProfile?.blood_type ?? null,
        totalAppointments: appointmentsForPatient.length,
        upcomingAppointments: appointmentsForPatient.filter((appointment) => UPCOMING_STATUSES.has(appointment.status))
          .length,
        nextAppointment: nextAppointment?.scheduled_at ?? null,
        lastAppointment: lastAppointment?.scheduled_at ?? null,
        latestChiefComplaint: latestAppointment?.chief_complaint?.trim() || null,
      };
    });

    summaries.sort((left, right) => {
      const nextCompare = compareNullableDateAsc(left.nextAppointment, right.nextAppointment);
      if (nextCompare !== 0) {
        return nextCompare;
      }

      const lastCompare = compareNullableDateDesc(left.lastAppointment, right.lastAppointment);
      if (lastCompare !== 0) {
        return lastCompare;
      }

      return left.name.localeCompare(right.name);
    });

    return summaries;
  }, [userId]);
}
