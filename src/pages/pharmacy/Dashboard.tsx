import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Inbox, Package, Pill, Receipt } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { usePharmacyDashboardStub } from '../../hooks';

export const PharmacyDashboard = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  usePharmacyDashboardStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={Pill}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('pharmacy.dashboard.title')}
        subtitle={t('pharmacy.dashboard.subtitle')}
        features={[
          {
            icon: Inbox,
            title: t('pharmacy.dashboard.featureQueueTitle'),
            description: t('pharmacy.dashboard.featureQueueBody'),
          },
          {
            icon: Package,
            title: t('pharmacy.dashboard.featureInventoryTitle'),
            description: t('pharmacy.dashboard.featureInventoryBody'),
          },
          {
            icon: Receipt,
            title: t('pharmacy.dashboard.featureClaimsTitle'),
            description: t('pharmacy.dashboard.featureClaimsBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('pharmacy.dashboard.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
