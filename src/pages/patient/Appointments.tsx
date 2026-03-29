import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Calendar, ClipboardList, Clock, MapPin, Plus, User } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAppointments, usePatientPreVisitAssessments, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import {
  appointmentStatusLabel,
  dateTimeFormatWithNumerals,
  preVisitStatusLabel,
  resolveLocale,
} from '../../lib/i18n-ui';
import { supabase } from '../../lib/supabase';

interface DoctorAppointmentProfile {
  userId: string;
  fullName: string;
  specialty: string | null;
  city: string | null;
  address: string | null;
}

const UPCOMING_STATUSES = new Set(['scheduled', 'confirmed', 'in_progress']);

export const PatientAppointments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation('common');
  const locale = resolveLocale(i18n.language);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(i18n.language, options);
  const { user } = useAuth();
  const {
    data: appointmentsData,
    loading,
    error,
    refetch,
  } = useAppointments({ role: 'patient', userId: user?.id ?? '' });
  const appointments = useMemo(() => appointmentsData ?? [], [appointmentsData]);
  const [busyAppointmentId, setBusyAppointmentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const { data: preVisitAssessmentsData } = usePatientPreVisitAssessments(user?.id);
  const preVisitAssessments = useMemo(
    () => preVisitAssessmentsData ?? [],
    [preVisitAssessmentsData]
  );

  const doctorIds = useMemo(
    () => Array.from(new Set(appointments.map((appointment) => appointment.doctor_id))),
    [appointments]
  );

  const {
    data: doctorProfilesData,
    loading: doctorProfilesLoading,
    error: doctorProfilesError,
  } = useQuery<DoctorAppointmentProfile[]>(
    async () => {
      if (doctorIds.length === 0) {
        return [];
      }

      const [{ data: userProfiles, error: userProfilesError }, { data: doctorProfilesData, error: doctorProfilesDataError }] =
        await Promise.all([
          supabase.from('user_profiles').select('user_id, full_name, city, address').in('user_id', doctorIds),
          supabase.from('doctor_profiles').select('user_id, specialization').in('user_id', doctorIds),
        ]);

      if (userProfilesError) {
        throw userProfilesError;
      }

      if (doctorProfilesDataError) {
        throw doctorProfilesDataError;
      }

      const doctorProfileById = new Map(
        (doctorProfilesData ?? []).map((doctorProfile) => [doctorProfile.user_id, doctorProfile])
      );

      return (userProfiles ?? []).map((userProfile) => ({
        userId: userProfile.user_id,
        fullName: userProfile.full_name ?? t('shared.doctor'),
        specialty: doctorProfileById.get(userProfile.user_id)?.specialization ?? null,
        city: userProfile.city ?? null,
        address: userProfile.address ?? null,
      }));
    },
    [doctorIds.join(',')]
  );
  const doctorProfiles = useMemo(() => doctorProfilesData ?? [], [doctorProfilesData]);

  const doctorProfileById = useMemo(
    () => new Map(doctorProfiles.map((doctorProfile) => [doctorProfile.userId, doctorProfile])),
    [doctorProfiles]
  );
  const preVisitAssessmentByAppointmentId = useMemo(
    () => new Map(preVisitAssessments.map((assessment) => [assessment.appointmentId, assessment])),
    [preVisitAssessments]
  );

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (!UPCOMING_STATUSES.has(appointment.status)) {
          return false;
        }

        return new Date(appointment.scheduled_at).getTime() >= Date.now();
      }),
    [appointments]
  );

  const pastAppointments = useMemo(
    () =>
      appointments.filter((appointment) => {
        if (UPCOMING_STATUSES.has(appointment.status)) {
          return new Date(appointment.scheduled_at).getTime() < Date.now();
        }

        return true;
      }),
    [appointments]
  );

  const handleCancelAppointment = async (appointmentId: string) => {
    setFeedback(null);
    setBusyAppointmentId(appointmentId);

    const { error: updateError } = await supabase.rpc('cancel_patient_appointment', {
      p_appointment_id: appointmentId,
    });

    setBusyAppointmentId(null);

    if (updateError) {
      setFeedback({ type: 'error', message: updateError.message });
      return;
    }

    setFeedback({ type: 'success', message: t('patient.appointments.cancelSuccess') });
    refetch();
  };

  const renderAppointmentCard = (appointmentId: string) => {
    const appointment = appointments.find((currentAppointment) => currentAppointment.id === appointmentId);

    if (!appointment) {
      return null;
    }

    const doctorProfile = doctorProfileById.get(appointment.doctor_id);
    const location =
      [doctorProfile?.city, doctorProfile?.address].filter(Boolean).join(' • ') ||
      t('shared.clinicPending');
    const isUpcoming = upcomingAppointments.some((currentAppointment) => currentAppointment.id === appointment.id);
    const preVisitAssessment = preVisitAssessmentByAppointmentId.get(appointment.id);

    return (
      <div
        key={appointment.id}
        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
      >
        <div
          className={`p-5 ${isUpcoming ? 'bg-gradient-to-r from-ceenai-navy via-ceenai-blue to-ceenai-cyan text-white' : 'bg-gray-50'}`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-3 ${isUpcoming ? 'bg-white/15' : 'bg-white shadow-sm'}`}>
                <User className={`h-5 w-5 ${isUpcoming ? 'text-white' : 'text-cyan-600'}`} />
              </div>
              <div>
                <p className="text-lg font-semibold">{doctorProfile?.fullName ?? t('shared.doctor')}</p>
                <p className={`text-sm ${isUpcoming ? 'text-cyan-100' : 'text-gray-600'}`}>
                  {doctorProfile?.specialty ?? t('shared.careVisit')}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                isUpcoming ? 'bg-white/15 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              {appointmentStatusLabel(t, appointment.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{t('patient.appointments.date')}</span>
            </div>
            <p className="mt-2 font-semibold text-gray-900">
              {new Date(appointment.scheduled_at).toLocaleDateString(
                locale,
                dtOpts({
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              )}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{t('patient.appointments.time')}</span>
            </div>
            <p className="mt-2 font-semibold text-gray-900">
              {new Date(appointment.scheduled_at).toLocaleTimeString(
                locale,
                dtOpts({
                  hour: 'numeric',
                  minute: '2-digit',
                })
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t('shared.minutesUnit', { count: appointment.duration_minutes })}
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{t('patient.appointments.location')}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900">{location}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase text-gray-500">{t('patient.appointments.reason')}</p>
          <p className="mt-2 text-sm text-gray-700">
            {appointment.chief_complaint ?? t('shared.scheduledConsultation')}
          </p>

          {preVisitAssessment ? (
            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-cyan-700" />
                  <p className="text-sm font-semibold text-cyan-900">
                    {t('patient.appointments.preVisitPrefix')}{' '}
                    {preVisitStatusLabel(t, preVisitAssessment.status)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/patient/pre-visit/${preVisitAssessment.id}`)}
                  className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-cyan-800 shadow-sm transition hover:shadow"
                >
                  {preVisitAssessment.status === 'completed' || preVisitAssessment.status === 'reviewed'
                    ? t('patient.appointments.reviewIntake')
                    : t('patient.appointments.continueIntake')}
                </button>
              </div>
            </div>
          ) : null}

          {isUpcoming ? (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/patient/appointments/book')}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {t('patient.appointments.bookAnother')}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/patient/appointments/book?reschedule=${appointment.id}`)}
                disabled={busyAppointmentId === appointment.id}
                className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {t('patient.appointments.reschedule')}
              </button>
              <button
                type="button"
                onClick={() => handleCancelAppointment(appointment.id)}
                disabled={busyAppointmentId === appointment.id}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyAppointmentId === appointment.id
                  ? t('patient.appointments.cancelling')
                  : t('patient.appointments.cancel')}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  const showSuccessBanner = searchParams.get('booked') === '1';
  const showRescheduledBanner = searchParams.get('rescheduled') === '1';
  const showPreVisitCompletedBanner = searchParams.get('previsit') === 'completed';
  const isLoadingPage = loading || doctorProfilesLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="patient" />
      <PageHeader
        title={t('patient.appointments.title')}
        subtitle={t('patient.appointments.subtitle')}
        icon={<Calendar className="h-6 w-6 text-white" />}
        backTo="/patient/dashboard"
        actions={
          <button
            type="button"
            onClick={() => navigate('/patient/appointments/book')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ceenai-navy via-ceenai-blue to-ceenai-cyan px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            <span>{t('patient.appointments.book')}</span>
          </button>
        }
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showSuccessBanner ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {t('patient.appointments.bannerBooked')}
          </div>
        ) : null}

        {showRescheduledBanner ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {t('patient.appointments.bannerRescheduled')}
          </div>
        ) : null}

        {showPreVisitCompletedBanner ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {t('patient.appointments.bannerPreVisit')}
          </div>
        ) : null}

        {feedback ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {error || doctorProfilesError ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('patient.appointments.loadError')}
          </div>
        ) : null}

        {isLoadingPage ? (
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        ) : upcomingAppointments.length === 0 && pastAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h2 className="text-xl font-bold text-gray-900">{t('patient.appointments.emptyTitle')}</h2>
            <p className="mt-2 text-sm text-gray-600">{t('patient.appointments.emptyBody')}</p>
            <button
              type="button"
              onClick={() => navigate('/patient/appointments/book')}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-ceenai-navy via-ceenai-blue to-ceenai-cyan px-5 py-3 font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>{t('patient.appointments.book')}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('patient.appointments.upcomingTitle')}</h2>
                  <p className="text-sm text-gray-600">{t('patient.appointments.upcomingSub')}</p>
                </div>
                <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm font-semibold text-cyan-700">
                  {t('patient.appointments.upcomingBadge', { count: upcomingAppointments.length })}
                </span>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                  <p className="font-semibold text-gray-900">{t('patient.appointments.noUpcomingTitle')}</p>
                  <p className="mt-1 text-sm text-gray-600">{t('patient.appointments.noUpcomingBody')}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {upcomingAppointments.map((appointment) => renderAppointmentCard(appointment.id))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{t('patient.appointments.pastTitle')}</h2>
                <p className="text-sm text-gray-600">{t('patient.appointments.pastSub')}</p>
              </div>

              {pastAppointments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                  <p className="font-semibold text-gray-900">{t('patient.appointments.noPastTitle')}</p>
                  <p className="mt-1 text-sm text-gray-600">{t('patient.appointments.noPastBody')}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {pastAppointments.map((appointment) => renderAppointmentCard(appointment.id))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
