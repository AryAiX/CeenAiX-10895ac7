import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, DatabaseZap, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { OpsShell } from '../../components/OpsShell';
import { usePharmacyPrescriptionQueue } from '../../hooks';
import { PHARMACY_NAV_ITEMS } from './navItems';

const initialSettings = [
  { title: 'Prescription Notifications', desc: 'Receive alerts for new ePrescriptions', on: true },
  { title: 'Stock Alert Threshold', desc: 'Alert when stock falls below reorder level', on: true },
  { title: 'Auto-submit DHA Records', desc: 'Automatically submit dispensing records to DHA', on: true },
  { title: 'NABIDH Sync', desc: 'Sync dispensing data with NABIDH HIE', on: true },
  { title: 'Insurance Pre-auth Alerts', desc: 'Notify when pre-authorization is needed', on: false },
  { title: 'Expiry Alerts', desc: 'Alert 30 days before batch expiry', on: true },
];

export const PharmacySettings = () => {
  const { t } = useTranslation('common');
  const { data } = usePharmacyPrescriptionQueue();
  const [settings, setSettings] = useState(initialSettings);

  const toggle = (title: string) => {
    setSettings((current) =>
      current.map((setting) => (setting.title === title ? { ...setting, on: !setting.on } : setting))
    );
  };

  return (
    <OpsShell
      title="Settings"
      subtitle="Notification, compliance, and sync preferences"
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
        <div className="max-w-3xl">
          <div className="mb-5">
            <h2 className="text-[20px] font-bold text-slate-900">Settings</h2>
            <div className="text-[13px] text-slate-400">Al Shifa Pharmacy portal preferences</div>
          </div>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ['Notifications', 'Live', Bell],
              ['DHA Compliance', 'Enabled', ShieldCheck],
              ['NABIDH Sync', 'Ready', DatabaseZap],
            ].map(([label, value, Icon]) => (
              <div key={label as string} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                <Icon className="mb-3 h-5 w-5 text-emerald-600" />
                <div className="font-semibold text-slate-800">{label as string}</div>
                <div className="text-xs text-slate-400">{value as string}</div>
              </div>
            ))}
          </section>

          <section className="space-y-4">
            {settings.map((setting) => (
              <article
                key={setting.title}
                className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{setting.title}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{setting.desc}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(setting.title)}
                  className={`relative h-6 w-12 shrink-0 rounded-full transition-colors ${
                    setting.on ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                  aria-pressed={setting.on}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      setting.on ? 'translate-x-6' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </article>
            ))}
          </section>
        </div>
      </div>
    </OpsShell>
  );
};
