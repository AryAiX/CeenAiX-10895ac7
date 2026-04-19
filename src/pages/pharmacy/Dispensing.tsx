import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { HandHelping, Pill, ShieldAlert, Users } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { usePharmacyDispensingStub } from '../../hooks';

export const PharmacyDispensing = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  usePharmacyDispensingStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={Pill}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('pharmacy.dispensing.title')}
        subtitle={t('pharmacy.dispensing.subtitle')}
        features={[
          {
            icon: ShieldAlert,
            title: t('pharmacy.dispensing.featureVerifyTitle'),
            description: t('pharmacy.dispensing.featureVerifyBody'),
          },
          {
            icon: Users,
            title: t('pharmacy.dispensing.featureCounselTitle'),
            description: t('pharmacy.dispensing.featureCounselBody'),
          },
          {
            icon: HandHelping,
            title: t('pharmacy.dispensing.featureHandoverTitle'),
            description: t('pharmacy.dispensing.featureHandoverBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/pharmacy/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('pharmacy.dispensing.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
