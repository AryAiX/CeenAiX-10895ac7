import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardCheck, Clock, Inbox, Pill, UserCheck } from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyDispensingStub } from '../../hooks';
import type { PharmacyDispensingItem } from '../../hooks';
import { PHARMACY_NAV_ITEMS } from './navItems';

const formatNumber = (value: number | null | undefined) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const STATUS_PILL: Record<PharmacyDispensingItem['status'], string> = {
  verifying: 'bg-amber-50 text-amber-700 ring-amber-200',
  counseling: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

export const PharmacyDispensing = () => {
  const { t } = useTranslation('common');
  const stub = usePharmacyDispensingStub();
  const data = stub.data;

  const kpis = [
    {
      label: t('pharmacy.dispensing.kpiVerification'),
      value: data?.inVerification ?? 0,
      icon: ClipboardCheck,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: t('pharmacy.dispensing.kpiCounseling'),
      value: data?.readyForCounseling ?? 0,
      icon: UserCheck,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      label: t('pharmacy.dispensing.kpiHandover'),
      value: data?.handoverToday ?? 0,
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <OpsShell
      title={t('pharmacy.dispensing.title')}
      subtitle={t('pharmacy.dispensing.subtitle')}
      eyebrow={t('pharmacy.dashboard.eyebrow')}
      navItems={PHARMACY_NAV_ITEMS(t)}
      accent="emerald"
    >
      <section className="grid gap-4 md:grid-cols-3">
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
                {stub.loading ? '…' : formatNumber(kpi.value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t('pharmacy.dispensing.queueHeading')}
            </h2>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatNumber(data?.items.length ?? 0)}{' '}
              {t('pharmacy.dispensing.queueCountLabel')}
            </p>
          </div>
          <Link
            to="/pharmacy/dashboard"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Inbox className="h-3.5 w-3.5" />
            {t('pharmacy.dispensing.queueCta')}
          </Link>
        </div>

        <ul className="mt-4 divide-y divide-slate-100">
          {(data?.items ?? []).map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Pill className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {item.patientName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {item.medication} • {item.prescriptionId}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {formatNumber(item.waitMinutes)} {t('pharmacy.dispensing.minutesLabel')}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                    STATUS_PILL[item.status]
                  }`}
                >
                  {t(`pharmacy.dispensing.status.${item.status}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </OpsShell>
  );
};
