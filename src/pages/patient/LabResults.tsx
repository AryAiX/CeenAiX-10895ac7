import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Beaker, CalendarDays, FlaskConical, Sparkles, Stethoscope } from 'lucide-react';
import { Skeleton } from '../../components/Skeleton';
import { usePatientLabResults } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { dateTimeFormatWithNumerals, labOrderStatusLabel, resolveLocale } from '../../lib/i18n-ui';
import type { LabOrderItem } from '../../types';

const ORDER_STATUS_TONE: Record<string, string> = {
  ordered: 'bg-slate-100 text-slate-700',
  collected: 'bg-sky-50 text-sky-700',
  processing: 'bg-amber-50 text-amber-700',
  resulted: 'bg-emerald-50 text-emerald-700',
  reviewed: 'bg-teal-50 text-teal-700',
};

function formatOrderedAt(language: string, iso: string): string {
  try {
    return new Intl.DateTimeFormat(
      resolveLocale(language),
      dateTimeFormatWithNumerals(language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    ).format(new Date(iso));
  } catch {
    return iso;
  }
}

function renderResultValue(item: LabOrderItem, noResult: string): string {
  if (item.result_value == null || item.result_value.trim() === '') {
    return noResult;
  }
  return item.result_unit ? `${item.result_value} ${item.result_unit}` : item.result_value;
}

export const PatientLabResults: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data, loading, error } = usePatientLabResults(user?.id);

  if (loading) {
    return (
      <>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('patient.labResults.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('patient.labResults.subtitle')}</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
        </div>
      </>
    );
  }

  const labOrders = data ?? [];

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('patient.labResults.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('patient.labResults.subtitle')}</p>
      </div>

      <div className="space-y-6">
        {error ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {t('patient.labResults.loadError')}
          </div>
        ) : null}

        {labOrders.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50">
              <FlaskConical className="h-7 w-7 text-teal-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {t('patient.labResults.emptyTitle')}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {t('patient.labResults.emptyBody')}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {labOrders.map((order) => {
              const pendingCount = order.items.length - order.resultedCount;
              const toneClass = ORDER_STATUS_TONE[order.status] ?? 'bg-slate-100 text-slate-700';

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-teal-200 hover:shadow-md"
                >
                  <header className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-white p-5 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>
                          {t('patient.labResults.orderedOn', {
                            date: formatOrderedAt(i18n.language, order.ordered_at),
                          })}
                        </span>
                      </div>
                      <h3 className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                        <Beaker className="h-5 w-5 text-teal-600" />
                        <span>
                          {t('patient.labResults.orderedBy', {
                            name: order.doctorName ?? t('patient.labResults.orderedByFallback'),
                          })}
                        </span>
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
                        <Stethoscope className="h-3.5 w-3.5" />
                        <span>{t('patient.labResults.statusLabel')}:</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${toneClass}`}
                        >
                          {labOrderStatusLabel(t, order.status)}
                        </span>
                        {order.abnormalCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                            <AlertTriangle className="h-3 w-3" />
                            {t('patient.labResults.abnormalBadge')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-start gap-2 text-sm text-slate-600 md:items-end">
                      <span className="font-semibold text-teal-700">
                        {t('patient.labResults.resultedCount', { count: order.resultedCount })}
                      </span>
                      {pendingCount > 0 ? (
                        <span className="text-xs text-slate-500">
                          {t('patient.labResults.pendingCount', { count: pendingCount })}
                        </span>
                      ) : null}
                    </div>
                  </header>

                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => {
                      const isAbnormal = item.is_abnormal === true;
                      return (
                        <div
                          key={item.id}
                          className={`p-5 ${isAbnormal ? 'bg-red-50/40' : ''}`}
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{item.test_name}</p>
                              {item.test_code ? (
                                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                                  {item.test_code}
                                </p>
                              ) : null}
                              {item.reference_range ? (
                                <p className="mt-2 text-xs text-slate-500">
                                  <span className="font-semibold text-slate-600">
                                    {t('patient.labResults.referenceRange')}:
                                  </span>{' '}
                                  {item.reference_range}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm md:flex-nowrap">
                              <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-right">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  {t('patient.labResults.testStatus')}
                                </p>
                                <p className="text-sm font-semibold text-slate-700">
                                  {labOrderStatusLabel(t, item.status)}
                                </p>
                              </div>
                              <div
                                className={`rounded-xl border px-3 py-2 text-right ${
                                  isAbnormal
                                    ? 'border-red-200 bg-white text-red-700'
                                    : 'border-slate-200 bg-white text-slate-900'
                                }`}
                              >
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                  {t('patient.labResults.testResult')}
                                </p>
                                <p className="text-sm font-semibold">
                                  {renderResultValue(item, t('patient.labResults.noResultYet'))}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/60 px-5 py-3">
                    <button
                      type="button"
                      onClick={() => navigate('/patient/ai-chat')}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:shadow-md"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{t('patient.labResults.explainWithAi')}</span>
                    </button>
                    {order.appointment_id ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/patient/appointments/${order.appointment_id}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
                      >
                        {t('patient.labResults.openAppointment')}
                      </button>
                    ) : null}
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
