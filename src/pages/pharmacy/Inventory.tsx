import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Boxes, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { usePharmacyInventoryStub } from '../../hooks';

export const PharmacyInventory = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  usePharmacyInventoryStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={Package}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('pharmacy.inventory.title')}
        subtitle={t('pharmacy.inventory.subtitle')}
        features={[
          {
            icon: Boxes,
            title: t('pharmacy.inventory.featureLotsTitle'),
            description: t('pharmacy.inventory.featureLotsBody'),
          },
          {
            icon: TrendingUp,
            title: t('pharmacy.inventory.featureStockTitle'),
            description: t('pharmacy.inventory.featureStockBody'),
          },
          {
            icon: ShoppingCart,
            title: t('pharmacy.inventory.featurePurchaseTitle'),
            description: t('pharmacy.inventory.featurePurchaseBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/pharmacy/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('pharmacy.inventory.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
