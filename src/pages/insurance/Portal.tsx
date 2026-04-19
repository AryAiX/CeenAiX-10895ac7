import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, SlidersHorizontal, Zap } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useInsurancePortalStub } from '../../hooks';

export const InsurancePortal = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useInsurancePortalStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={ShieldCheck}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('insurance.portal.title')}
        subtitle={t('insurance.portal.subtitle')}
        features={[
          {
            icon: SlidersHorizontal,
            title: t('insurance.portal.featurePlansTitle'),
            description: t('insurance.portal.featurePlansBody'),
          },
          {
            icon: Zap,
            title: t('insurance.portal.featureEligibilityTitle'),
            description: t('insurance.portal.featureEligibilityBody'),
          },
          {
            icon: FileText,
            title: t('insurance.portal.featureClaimsTitle'),
            description: t('insurance.portal.featureClaimsBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('insurance.portal.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
