import { useTranslation } from 'react-i18next';
import { ShieldCheck, Store, UserRound, type LucideIcon } from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyPrescriptionQueue } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { PHARMACY_NAV_ITEMS } from './navItems';

export const PharmacyProfile = () => {
  const { t } = useTranslation('common');
  const { profile, user } = useAuth();
  const { data } = usePharmacyPrescriptionQueue();
  const displayName = profile?.full_name?.trim() || profile?.first_name?.trim() || user?.email?.split('@')[0] || 'Rania Hassan';
  const operationRows: Array<[string, string | number, LucideIcon]> = [
    ['Pending prescriptions', data?.pendingPrescriptions ?? 0, UserRound],
    ['Inventory alerts', data?.lowStockAlerts ?? 0, ShieldCheck],
    ['DHA sync', 'Ready', ShieldCheck],
  ];

  return (
    <OpsShell
      title="My Pharmacy"
      subtitle="Al Shifa Pharmacy profile"
      eyebrow={t('pharmacy.dashboard.eyebrow')}
      navItems={PHARMACY_NAV_ITEMS(t, {
        prescriptions: data?.pendingPrescriptions || undefined,
        inventory: data?.lowStockAlerts || undefined,
        messages: 1,
      })}
      accent="emerald"
      variant="pharmacy"
    >
      <div className="min-h-full bg-slate-50 p-6">
        <div className="max-w-4xl">
          <h2 className="mb-5 text-[20px] font-bold text-slate-900">My Pharmacy</h2>

          <section className="mb-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-xl font-bold text-white">
                AS
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Al Shifa Pharmacy</h3>
                <div className="text-sm text-slate-500">الشفاء للصيدلة</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                    DHA Licensed ✅
                  </span>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-700">
                    NABIDH Connected ✅
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              {[
                ['DHA License', 'DHA-PHARM-2019-003481'],
                ['License Valid Until', '31 December 2026'],
                ['Location', 'Al Barsha 1, Dubai, UAE'],
                ['Operating Hours', '8 AM - 10 PM (Sun-Sat)'],
                ['Pharmacist-in-Charge', displayName],
                ['CeenAiX ePrescription', 'Connected ✅'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="mb-0.5 text-xs text-slate-400">{label}</div>
                  <div className="font-semibold text-slate-800">{value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_0.8fr]">
            <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-[15px] font-bold text-slate-800">Staff</h4>
              {[
                { name: displayName, role: 'Head Pharmacist', dha: 'DHA-PHAR-2017-001294', status: 'On shift' },
                { name: 'Khalid Al Ameri', role: 'Pharmacy Technician', dha: 'DHA-TECH-2020-007241', status: 'On shift' },
                { name: 'Maryam Ibrahim', role: 'Pharmacy Technician', dha: 'DHA-TECH-2021-008491', status: 'Off shift' },
              ].map((staff) => (
                <div key={staff.name} className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {staff.name
                      .split(/\s+/)
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-slate-800">{staff.name}</div>
                    <div className="truncate text-xs text-slate-500">
                      {staff.role} · <span className="font-mono">{staff.dha}</span>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      staff.status === 'On shift'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {staff.status}
                  </span>
                </div>
              ))}
            </article>

            <article className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <Store className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-slate-800">Operations Status</h4>
                  <div className="text-xs text-slate-400">Live from pharmacy queue</div>
                </div>
              </div>
              <div className="space-y-3">
                {operationRows.map(([label, value, Icon]) => (
                  <div key={label as string} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <Icon className="h-4 w-4 text-emerald-600" />
                      {label as string}
                    </div>
                    <div className="font-mono text-sm font-bold text-slate-800">{value as string | number}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      </div>
    </OpsShell>
  );
};
