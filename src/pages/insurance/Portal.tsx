import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { useInsurancePortalStub } from '../../hooks';
import type { InsuranceClaimSummary } from '../../hooks';
import { INSURANCE_NAV_ITEMS } from './navItems';

const formatNumber = (value: number | null | undefined) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const CLAIM_PILL: Record<InsuranceClaimSummary['status'], string> = {
  submitted: 'bg-slate-50 text-slate-700 ring-slate-200',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  denied: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const InsurancePortal = () => {
  const { t } = useTranslation('common');
  const stub = useInsurancePortalStub();
  const data = stub.data;

  const kpis = [
    {
      label: t('insurance.portal.kpiMembers'),
      value: data?.totalMembers ?? 0,
      icon: Users,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      label: t('insurance.portal.kpiPending'),
      value: data?.pendingClaims ?? 0,
      icon: ClipboardList,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      label: t('insurance.portal.kpiApproved'),
      value: data?.approvedThisMonth ?? 0,
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-cyan-600',
    },
    {
      label: t('insurance.portal.kpiEscalations'),
      value: data?.escalations ?? 0,
      icon: AlertCircle,
      accent: 'from-rose-500 to-orange-500',
    },
  ];

  return (
    <OpsShell
      title={t('insurance.portal.title')}
      subtitle={t('insurance.portal.subtitle')}
      eyebrow={t('insurance.portal.eyebrow')}
      navItems={INSURANCE_NAV_ITEMS(t)}
      accent="violet"
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
                {stub.loading ? '…' : formatNumber(kpi.value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1.3fr,1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t('insurance.portal.plansHeading')}
            </h2>
            <ShieldCheck className="h-4 w-4 text-slate-400" />
          </div>
          <ul className="mt-4 space-y-3">
            {(data?.plans ?? []).map((plan) => (
              <li
                key={plan.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 card-hover"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{plan.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {formatNumber(plan.members)} {t('insurance.portal.membersLabel')} •{' '}
                    {formatNumber(plan.claimsOpen)} {t('insurance.portal.claimsOpenLabel')}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-sm font-semibold text-slate-900">{plan.utilization}%</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    {t(`insurance.portal.planStatus.${plan.status}`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t('insurance.portal.claimsHeading')}
            </h2>
            <ClipboardList className="h-4 w-4 text-slate-400" />
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {(data?.claims ?? []).map((claim) => (
              <li key={claim.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {claim.patientName}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {claim.plan} • AED {formatNumber(claim.amountAed)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                    CLAIM_PILL[claim.status]
                  }`}
                >
                  {t(`insurance.portal.claimStatus.${claim.status}`)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </OpsShell>
  );
};
