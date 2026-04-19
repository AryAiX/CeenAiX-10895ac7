import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Banknote, FileSpreadsheet, Receipt, Wallet } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useDoctorEarningsStub } from '../../hooks';

export const DoctorEarnings = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useDoctorEarningsStub();

  return (
    <PhaseStub
      accent="emerald"
      icon={Banknote}
      phaseLabel={t('system.phaseStub.phasePlanned')}
      title={t('doctor.earnings.title')}
      subtitle={t('doctor.earnings.subtitle')}
      features={[
        {
          icon: Wallet,
          title: t('doctor.earnings.featureSummaryTitle'),
          description: t('doctor.earnings.featureSummaryBody'),
        },
        {
          icon: Receipt,
          title: t('doctor.earnings.featureClaimsTitle'),
          description: t('doctor.earnings.featureClaimsBody'),
        },
        {
          icon: FileSpreadsheet,
          title: t('doctor.earnings.featureTaxTitle'),
          description: t('doctor.earnings.featureTaxBody'),
        },
      ]}
      actions={
        <button
          type="button"
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>{t('doctor.earnings.actionOpenDashboard')}</span>
        </button>
      }
    />
  );
};
