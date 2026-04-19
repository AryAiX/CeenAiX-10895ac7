import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Filter, HeartHandshake, Inbox, Timer } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useLabReferralsStub } from '../../hooks';

export const LabReferrals = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useLabReferralsStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={Inbox}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('lab.referrals.title')}
        subtitle={t('lab.referrals.subtitle')}
        features={[
          {
            icon: Filter,
            title: t('lab.referrals.featureFilterTitle'),
            description: t('lab.referrals.featureFilterBody'),
          },
          {
            icon: HeartHandshake,
            title: t('lab.referrals.featurePatientTitle'),
            description: t('lab.referrals.featurePatientBody'),
          },
          {
            icon: Timer,
            title: t('lab.referrals.featureSlaTitle'),
            description: t('lab.referrals.featureSlaBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/lab/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('lab.referrals.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
