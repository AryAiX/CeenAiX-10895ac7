import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Package,
  Pill,
  Receipt,
  Shield,
} from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyPrescriptionQueue } from '../../hooks';
import { PHARMACY_NAV_ITEMS } from './navItems';

const formatNumber = (value: number | null | undefined) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

export const PharmacyDashboard = () => {
  const { t } = useTranslation('common');
  const { data, loading } = usePharmacyPrescriptionQueue();

  const kpis = useMemo(
    () => [
      {
        label: t('pharmacy.dashboard.kpiQueue'),
        value: data?.pendingPrescriptions ?? 0,
        icon: Inbox,
        accent: 'from-cyan-500 to-blue-600',
      },
      {
        label: t('pharmacy.dashboard.kpiDispensed'),
        value: data?.dispensedToday ?? 0,
        icon: CheckCircle2,
        accent: 'from-emerald-500 to-teal-600',
      },
      {
        label: t('pharmacy.dashboard.kpiStockAlerts'),
        value: data?.lowStockAlerts ?? 0,
        icon: AlertCircle,
        accent: 'from-rose-500 to-orange-500',
      },
      {
        label: t('pharmacy.dashboard.kpiClaims'),
        value: data?.claimsInReview ?? 0,
        icon: Receipt,
        accent: 'from-violet-500 to-fuchsia-600',
      },
    ],
    [data, t],
  );

  const queue = data?.queue.filter((item) => !item.isDispensed) ?? [];
  const stockAlerts =
    data?.inventory
      .filter((item) => item.status === 'low' || item.status === 'out')
      .map((item) => ({
        id: item.id,
        item: item.name,
        quantity: item.stock,
        severity: item.status === 'out' ? 'critical' as const : 'low' as const,
      })) ?? [];

  return (
    <OpsShell
      title={t('pharmacy.dashboard.title')}
      subtitle={t('pharmacy.dashboard.subtitle')}
      eyebrow={t('pharmacy.dashboard.eyebrow')}
      navItems={PHARMACY_NAV_ITEMS(t)}
      accent="emerald"
    >
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article
              key={kpi.label}
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                aria-hidden
                className={`absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${kpi.accent} opacity-10`}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.accent} text-white shadow-sm`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">
                {loading ? '…' : formatNumber(kpi.value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {t('pharmacy.dashboard.queueHeading')}
              </h2>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatNumber(queue.length)} {t('pharmacy.dashboard.queueCountLabel')}
              </p>
            </div>
            <Link
              to="/pharmacy/dispensing"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Pill className="h-3.5 w-3.5" />
              {t('pharmacy.dashboard.queueCta')}
            </Link>
          </div>

          <ul className="mt-4 divide-y divide-slate-100">
            {queue.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Pill className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.patientName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.medication} • {item.prescriber}
                  </p>
                </div>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-700 ring-1 ring-cyan-200">
                  {t(`pharmacy.dashboard.priority.${item.priority}`)}
                </span>
              </li>
            ))}
            {!loading && queue.length === 0 ? (
              <li className="py-6 text-center text-sm text-slate-500">
                {t('pharmacy.dashboard.queueEmpty')}
              </li>
            ) : null}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Package className="h-4 w-4" />
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {t('pharmacy.dashboard.stockHeading')}
            </h2>
          </div>
          <ul className="mt-4 space-y-3">
            {stockAlerts.map((alert) => (
              <li
                key={alert.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{alert.item}</p>
                  <p className="truncate text-xs text-slate-500">
                    {formatNumber(alert.quantity)} {t('pharmacy.dashboard.unitsLabel')}
                  </p>
                </div>
                <span className="text-xs font-semibold text-rose-600">
                  {t(`pharmacy.dashboard.stockLevel.${alert.severity}`)}
                </span>
              </li>
            ))}
            {!loading && stockAlerts.length === 0 ? (
              <li className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <Shield className="mr-2 inline h-4 w-4" />
                {t('pharmacy.dashboard.stockAllGood')}
              </li>
            ) : null}
          </ul>
        </article>
      </section>
    </OpsShell>
  );
};
