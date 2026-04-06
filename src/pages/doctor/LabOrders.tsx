import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, Search, TestTube2 } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useDoctorLabOrders } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { dateTimeFormatWithNumerals, formatLocaleDigits, labOrderStatusLabel, resolveLocale } from '../../lib/i18n-ui';

export const DoctorLabOrders: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = useDoctorLabOrders(user?.id);
  const labOrders = useMemo(() => data ?? [], [data]);
  const locale = resolveLocale(i18n.language);
  const uiLang = i18n.language ?? 'en';
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(uiLang, options);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredLabOrders = useMemo(
    () =>
      labOrders.filter((labOrder) => {
        if (statusFilter !== 'all' && labOrder.status !== statusFilter) {
          return false;
        }

        const searchValue = searchQuery.trim().toLowerCase();
        if (!searchValue) {
          return true;
        }

        const haystack = [
          labOrder.patientName,
          labOrder.patientEmail,
          labOrder.status,
          ...labOrder.items.map((item) => `${item.test_name} ${item.test_code ?? ''}`),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchValue);
      }),
    [labOrders, searchQuery, statusFilter]
  );

  const uniquePatients = useMemo(
    () => new Set(labOrders.map((labOrder) => labOrder.patient_id)).size,
    [labOrders]
  );
  const pendingResults = useMemo(
    () => labOrders.filter((labOrder) => labOrder.status !== 'reviewed').length,
    [labOrders]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
        <Navigation role="doctor" />
        <PageHeader
          title={t('doctor.labOrders.title')}
          subtitle={t('doctor.labOrders.subtitle')}
          icon={<TestTube2 className="w-6 h-6 text-white" />}
          backTo="/doctor/dashboard"
        />
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-8">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="doctor" />
      <PageHeader
        title={t('doctor.labOrders.title')}
        subtitle={t('doctor.labOrders.subtitle')}
        icon={<TestTube2 className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        {error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{t('doctor.labOrders.totalOrders')}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {formatLocaleDigits(labOrders.length, uiLang)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{t('doctor.labOrders.pendingResults')}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {formatLocaleDigits(pendingResults, uiLang)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-600">{t('doctor.labOrders.linkedPatients')}</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">
              {formatLocaleDigits(uniquePatients, uiLang)}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t('doctor.labOrders.searchPlaceholder')}
                  className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rtl:pl-4 rtl:pr-12"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="all">{t('doctor.labOrders.allStatuses')}</option>
                <option value="ordered">{t('shared.labOrderStatus.ordered')}</option>
                <option value="collected">{t('shared.labOrderStatus.collected')}</option>
                <option value="processing">{t('shared.labOrderStatus.processing')}</option>
                <option value="resulted">{t('shared.labOrderStatus.resulted')}</option>
                <option value="reviewed">{t('shared.labOrderStatus.reviewed')}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => navigate('/doctor/lab-orders/new')}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t('doctor.labOrders.create')}</span>
            </button>
          </div>
        </div>

        {filteredLabOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <TestTube2 className="mx-auto mb-4 h-10 w-10 text-slate-400" />
            <h3 className="text-xl font-bold text-slate-900">{t('doctor.labOrders.emptyTitle')}</h3>
            <p className="mt-2 text-sm text-slate-600">{t('doctor.labOrders.emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredLabOrders.map((labOrder) => (
              <div key={labOrder.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-slate-900 to-cyan-800 p-5 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">{labOrder.patientName}</p>
                      <p className="mt-1 text-sm text-white/85">
                        {labOrder.patientEmail ?? t('doctor.prescriptions.noEmail')}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800">
                      {labOrderStatusLabel(t, labOrder.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      {t('doctor.labOrders.orderedAt', {
                        date: new Date(labOrder.ordered_at).toLocaleDateString(
                          locale,
                          dtOpts({ year: 'numeric', month: 'short', day: 'numeric' })
                        ),
                      })}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/messages?patient=${labOrder.patient_id}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>{t('doctor.messages.messagePatient')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/lab-orders/new?patient=${labOrder.patient_id}&appointment=${labOrder.appointment_id ?? ''}`)}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{t('doctor.labOrders.reorder')}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {labOrder.items.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">{item.test_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.test_code ?? t('doctor.labOrders.noCode')}</p>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {labOrderStatusLabel(t, item.status)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
