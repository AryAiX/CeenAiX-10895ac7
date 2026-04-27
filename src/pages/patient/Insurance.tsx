import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FileText, ShieldCheck, Zap } from 'lucide-react';
import { PatientReferenceShell } from '../../components/PatientReferenceShell';
import { PhaseStub } from '../../components/system/PhaseStub';
import { usePatientInsuranceStub } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

export const PatientInsurance = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  usePatientInsuranceStub(user?.id ?? null);

  return (
    <PatientReferenceShell activeTab="insurance">
      <PhaseStub
        accent="emerald"
        icon={ShieldCheck}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('patient.insurance.title')}
        subtitle={t('patient.insurance.subtitle')}
        features={[
          {
            icon: ShieldCheck,
            title: t('patient.insurance.featureCoverageTitle'),
            description: t('patient.insurance.featureCoverageBody'),
          },
          {
            icon: FileText,
            title: t('patient.insurance.featureClaimsTitle'),
            description: t('patient.insurance.featureClaimsBody'),
          },
          {
            icon: Zap,
            title: t('patient.insurance.featureEligibilityTitle'),
            description: t('patient.insurance.featureEligibilityBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/insurance')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <span>{t('patient.insurance.actionFindPlans')}</span>
          </button>
        }
      />
    </PatientReferenceShell>
  );
};
