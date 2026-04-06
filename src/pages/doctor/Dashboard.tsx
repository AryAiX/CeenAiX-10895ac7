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
  formatLocaleDigits,
  preVisitStatusLabel,
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
  const uiLang = i18n.language ?? 'en';
  const locale = resolveLocale(uiLang);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(uiLang, options);
  const { profile, user } = useAuth();
  const { data, loading, error } = useDoctorDashboard(user?.id);

  const quickActions = useMemo(
    () => [
      { labelKey: 'nav.appointments', href: '/doctor/appointments' },
      { labelKey: 'nav.schedule', href: '/doctor/schedule' },
      { labelKey: 'nav.patients', href: '/doctor/patients' },
      { labelKey: 'nav.prescriptions', href: '/doctor/prescriptions' },
      { labelKey: 'doctor.labOrders.title', href: '/doctor/lab-orders' },
      { labelKey: 'nav.messages', href: '/doctor/messages' },
      { labelKey: 'doctor.notifications.title', href: '/doctor/notifications' },
      { labelKey: 'nav.profile', href: '/doctor/profile' },
    ],
    []
  );

  const displayName = getDisplayName(profile?.full_name, profile?.first_name) || t('shared.doctor');

  const renderComplaint = (value: string | null | undefined, emptyLabel: string) => {
    if (!value?.trim()) {
      return emptyLabel;
    }

    return uiLang.startsWith('ar') ? (
      <span dir="ltr" className="block text-start" translate="no">
        {value}
      </span>
    ) : (
      value
    );
  };

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
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatLocaleDigits(data?.totalPatients ?? 0, uiLang)}
                    </p>
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
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {formatLocaleDigits(data?.todayAppointments ?? 0, uiLang)}
                    </p>
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
                    <p className="text-3xl font-bold text-orange-600 mt-2">
                      {formatLocaleDigits(data?.pendingReviews ?? 0, uiLang)}
                    </p>
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
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {formatLocaleDigits(data?.unreadMessages ?? 0, uiLang)}
                    </p>
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
                    {renderComplaint(data.nextAppointment.chiefComplaint, t('shared.scheduledConsultation'))}
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
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/doctor/appointments/${data.nextAppointment?.id}`)}
                      className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      {t('doctor.appointmentDetail.openDetail')}
                    </button>
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

          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('doctor.dashboard.todayQueue')}</h2>
                <p className="mt-1 text-sm text-gray-600">{t('doctor.dashboard.todayQueueSub')}</p>
              </div>
              <button
                onClick={() => navigate('/doctor/appointments')}
                className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
              >
                {t('nav.appointments')}
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : data && data.todayQueue.length > 0 ? (
              <div className="space-y-4">
                {data.todayQueue.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-semibold text-slate-900">{appointment.patientName}</p>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-700 shadow-sm">
                            {appointmentStatusLabel(t, appointment.status)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-700 shadow-sm">
                            {appointmentTypeLabel(t, appointment.type)}
                          </span>
                          {appointment.preVisitStatus ? (
                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">
                              {t('doctor.dashboard.preVisitLabel')}:{' '}
                              {preVisitStatusLabel(t, appointment.preVisitStatus)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {renderComplaint(appointment.chiefComplaint, t('doctor.dashboard.noChiefComplaint'))}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                        <p className="font-semibold text-slate-900">
                          {new Date(appointment.scheduledAt).toLocaleTimeString(
                            locale,
                            dtOpts({
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          )}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {new Date(appointment.scheduledAt).toLocaleDateString(
                            locale,
                            dtOpts({
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        {t('doctor.appointmentDetail.openDetail')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="font-semibold text-gray-900">{t('doctor.dashboard.noQueueTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('doctor.dashboard.noQueueBody')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
