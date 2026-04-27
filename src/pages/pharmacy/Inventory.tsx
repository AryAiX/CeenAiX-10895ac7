import { useTranslation } from 'react-i18next';
import { AlertTriangle, Calendar, Package, TrendingDown } from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyPrescriptionQueue } from '../../hooks';
import type { PharmacyInventoryDerivedItem } from '../../hooks';
import { PHARMACY_NAV_ITEMS } from './navItems';

const formatNumber = (value: number | null | undefined) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const STATUS_PILL: Record<PharmacyInventoryDerivedItem['status'], string> = {
  healthy: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  low: 'bg-amber-50 text-amber-700 ring-amber-200',
  near_expiry: 'bg-violet-50 text-violet-700 ring-violet-200',
  out: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const PharmacyInventory = () => {
  const { t } = useTranslation('common');
  const { data, loading } = usePharmacyPrescriptionQueue();
  const items = data?.inventory ?? [];

  const kpis = [
    {
      label: t('pharmacy.inventory.kpiTotal'),
      value: items.length,
      icon: Package,
      accent: 'from-slate-600 to-slate-800',
    },
    {
      label: t('pharmacy.inventory.kpiNearExpiry'),
      value: items.filter((item) => item.status === 'near_expiry').length,
      icon: Calendar,
      accent: 'from-violet-500 to-fuchsia-600',
    },
    {
      label: t('pharmacy.inventory.kpiOutOfStock'),
      value: items.filter((item) => item.status === 'out').length,
      icon: AlertTriangle,
      accent: 'from-rose-500 to-orange-500',
    },
  ];

  return (
    <OpsShell
      title={t('pharmacy.inventory.title')}
      subtitle={t('pharmacy.inventory.subtitle')}
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
                {loading ? '…' : formatNumber(kpi.value)}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t('pharmacy.inventory.tableHeading')}
          </h2>
          <TrendingDown className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">
                  {t('pharmacy.inventory.colItem')}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {t('pharmacy.inventory.colSku')}
                </th>
                <th className="px-4 py-3 text-end font-semibold">
                  {t('pharmacy.inventory.colStock')}
                </th>
                <th className="px-4 py-3 text-end font-semibold">
                  {t('pharmacy.inventory.colReorder')}
                </th>
                <th className="px-4 py-3 text-start font-semibold">
                  {t('pharmacy.inventory.colExpiry')}
                </th>
                <th className="px-4 py-3 text-end font-semibold">
                  {t('pharmacy.inventory.colStatus')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">{item.sku}</td>
                  <td className="px-4 py-3 text-end font-semibold text-slate-900">
                    {formatNumber(item.stock)}
                  </td>
                  <td className="px-4 py-3 text-end text-slate-500">
                    {formatNumber(item.reorderPoint)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {item.expiryMonth ?? t('pharmacy.inventory.expiryNone')}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${
                        STATUS_PILL[item.status]
                      }`}
                    >
                      {t(`pharmacy.inventory.status.${item.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </OpsShell>
  );
};
