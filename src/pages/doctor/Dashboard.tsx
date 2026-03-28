import React, { useMemo } from 'react';
import { Navigation } from '../../components/Navigation';
import { Activity, Users, Calendar, FileText, MessageSquare, ChevronRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../components/Skeleton';
import { useDoctorDashboard } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import {
  appointmentStatusLabel,
  appointmentTypeLabel,
  dateTimeFormatWithNumerals,
  resolveLocale,
} from '../../lib/i18n-ui';

const getDisplayName = (fullName: string | null | undefined, firstName: string | null | undefined) => {
  if (firstName?.trim()) return firstName.trim();
  if (fullName?.trim()) return fullName.trim();
  return '';
};

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const locale = resolveLocale(i18n.language);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(i18n.language, options);
  const { profile, user } = useAuth();
  const { data, loading, error } = useDoctorDashboard(user?.id);

  const quickActions = useMemo(
    () => [
      { labelKey: 'nav.appointments', href: '/doctor/appointments' },
      { labelKey: 'nav.schedule', href: '/doctor/schedule' },
      { labelKey: 'nav.patients', href: '/doctor/patients' },
      { labelKey: 'nav.prescriptions', href: '/doctor/prescriptions' },
      { labelKey: 'nav.messages', href: '/doctor/messages' },
      { labelKey: 'nav.profile', href: '/doctor/profile' },
    ],
    []
  );

  const displayName = getDisplayName(profile?.full_name, profile?.first_name) || t('shared.doctor');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="doctor" />
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('doctor.dashboard.welcome', { name: displayName })}
              </h1>
              <p className="mt-2 text-gray-600">{t('doctor.dashboard.sub')}</p>
            </div>
            <button
              onClick={() => navigate('/doctor/schedule')}
              className="rounded-xl bg-gradient-to-r from-slate-900 to-emerald-800 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
            >
              {t('doctor.dashboard.manageSchedule')}
            </button>
          </div>

          {error ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {t('doctor.dashboard.loadError')}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('doctor.dashboard.totalPatients')}</p>
                  {loading ? (
                    <Skeleton className="mt-2 h-9 w-12" />
                  ) : (
                    <p className="text-3xl font-bold text-blue-600 mt-2">{data?.totalPatients ?? 0}</p>
                  )}
                </div>
                <Users className="w-10 h-10 text-blue-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('doctor.dashboard.todayAppts')}</p>
                  {loading ? (
                    <Skeleton className="mt-2 h-9 w-12" />
                  ) : (
                    <p className="text-3xl font-bold text-green-600 mt-2">{data?.todayAppointments ?? 0}</p>
                  )}
                </div>
                <Calendar className="w-10 h-10 text-green-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('doctor.dashboard.pendingReviews')}</p>
                  {loading ? (
                    <Skeleton className="mt-2 h-9 w-12" />
                  ) : (
                    <p className="text-3xl font-bold text-orange-600 mt-2">{data?.pendingReviews ?? 0}</p>
                  )}
                </div>
                <FileText className="w-10 h-10 text-orange-200" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{t('doctor.dashboard.unreadMessages')}</p>
                  {loading ? (
                    <Skeleton className="mt-2 h-9 w-12" />
                  ) : (
                    <p className="text-3xl font-bold text-purple-600 mt-2">{data?.unreadMessages ?? 0}</p>
                  )}
                </div>
                <MessageSquare className="w-10 h-10 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{t('doctor.dashboard.nextAppt')}</h2>
                <button
                  onClick={() => navigate('/doctor/appointments')}
                  className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
                >
                  {t('doctor.dashboard.viewSchedule')}
                </button>
              </div>

              {loading ? (
                <Skeleton className="h-40 w-full rounded-2xl" />
              ) : data?.nextAppointment ? (
                <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-800 p-6 text-white">
                  <p className="text-lg font-bold">{data.nextAppointment.patientName}</p>
                  <p className="mt-1 text-sm text-white/85">
                    {data.nextAppointment.chiefComplaint ?? t('shared.scheduledConsultation')}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-white/15 px-3 py-1">
                      {new Date(data.nextAppointment.scheduledAt).toLocaleDateString(
                        locale,
                        dtOpts({ year: 'numeric', month: 'short', day: 'numeric' })
                      )}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1">
                      {new Date(data.nextAppointment.scheduledAt).toLocaleTimeString(
                        locale,
                        dtOpts({
                          hour: 'numeric',
                          minute: '2-digit',
                        })
                      )}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 capitalize">
                      {appointmentTypeLabel(t, data.nextAppointment.type)}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 capitalize">
                      {appointmentStatusLabel(t, data.nextAppointment.status)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Clock className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                  <p className="font-semibold text-gray-900">{t('doctor.dashboard.noUpcomingTitle')}</p>
                  <p className="mt-2 text-sm text-gray-600">{t('doctor.dashboard.noUpcomingBody')}</p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <div className="mb-5 flex items-center gap-3">
                <Activity className="h-5 w-5 text-teal-700" />
                <h2 className="text-xl font-bold text-gray-900">{t('doctor.dashboard.quickLinks')}</h2>
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <button
                    key={action.href}
                    onClick={() => navigate(action.href)}
                    className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left transition hover:border-teal-200 hover:bg-teal-50"
                  >
                    <span className="font-medium text-gray-800">{t(action.labelKey)}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
