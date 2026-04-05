import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Calendar, ArrowRight, HeartPulse, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useDoctorPatients } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { dateTimeFormatWithNumerals, resolveLocale } from '../../lib/i18n-ui';

export const DoctorPatients: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const locale = resolveLocale(i18n.language);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(i18n.language, options);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const { data, loading, error } = useDoctorPatients(user?.id);
  const rawPatients = useMemo(() => data ?? [], [data]);

  const filteredPatients = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return rawPatients;
    }

    return rawPatients.filter((patient) =>
      [
        patient.name,
        patient.email ?? '',
        patient.phone ?? '',
        patient.bloodType ?? '',
        patient.latestChiefComplaint ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [rawPatients, searchQuery]);

  const renderConcern = (value: string | null) => {
    if (!value?.trim()) {
      return t('doctor.patients.noRecentConcern');
    }

    return i18n.language.startsWith('ar') ? (
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
      <PageHeader
        title={t('doctor.patients.title')}
        subtitle={t('doctor.patients.subtitle')}
        icon={<Users className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rtl:left-auto rtl:right-4" />
              <input
                type="text"
                placeholder={t('doctor.patients.searchPlaceholder')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border-2 border-gray-200 py-3 pl-12 pr-4 font-medium transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rtl:pl-4 rtl:pr-12"
              />
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm md:block">
              {t('doctor.patients.count', { count: filteredPatients.length })}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {t('doctor.patients.loadError')}
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <Users className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">{t('doctor.patients.emptyTitle')}</h3>
            <p className="mt-2 text-sm text-gray-600">
              {t('doctor.patients.emptyBody')}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-ceenai-blue to-ceenai-cyan p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
                      {patient.name
                        .split(' ')
                        .filter(Boolean)
                        .map((name: string) => name[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                      <p className="text-sm text-white/90">
                        {t('doctor.patients.linkedAppointments', { count: patient.totalAppointments })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-4">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">{t('doctor.patients.contact')}</h4>
                    <p className="text-sm text-gray-600">{patient.phone ?? t('doctor.patients.notProvided')}</p>
                    <p className="mt-1 text-sm text-gray-600">{patient.email ?? t('doctor.patients.notProvided')}</p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">{t('doctor.patients.lastAppointment')}</h4>
                    <p className="text-sm text-gray-600">
                      {patient.lastAppointment
                        ? new Date(patient.lastAppointment).toLocaleString(
                            locale,
                            dtOpts({
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })
                          )
                        : t('doctor.patients.noCompletedVisits')}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">{t('doctor.patients.nextAppointment')}</h4>
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span>
                        {patient.nextAppointment
                          ? new Date(patient.nextAppointment).toLocaleString(
                              locale,
                              dtOpts({
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            )
                          : t('doctor.patients.noFutureVisits')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">{t('doctor.patients.bloodType')}</h4>
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <HeartPulse className="mt-0.5 h-4 w-4 text-rose-400" />
                      <span>{patient.bloodType ?? t('doctor.patients.notProvided')}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-6 py-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {t('doctor.patients.recentConcern')}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{renderConcern(patient.latestChiefComplaint)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/messages?patient=${patient.id}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{t('doctor.messages.messagePatient')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/doctor/appointments')}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
                      >
                        {t('doctor.patients.viewAppointments')}
                        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{t('doctor.patients.footerHint')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
