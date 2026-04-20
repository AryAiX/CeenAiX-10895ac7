import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Building2, GraduationCap, Stethoscope } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useDoctorPortalStub } from '../../hooks';

export const DoctorPortal = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useDoctorPortalStub();

  return (
    <PhaseStub
      accent="cyan"
      icon={Stethoscope}
      phaseLabel={t('system.phaseStub.phaseFeaturePreview')}
      title={t('doctor.portal.title')}
      subtitle={t('doctor.portal.subtitle')}
      features={[
        {
          icon: Building2,
          title: t('doctor.portal.featureMultiClinicTitle'),
          description: t('doctor.portal.featureMultiClinicBody'),
        },
        {
          icon: GraduationCap,
          title: t('doctor.portal.featureCpdTitle'),
          description: t('doctor.portal.featureCpdBody'),
        },
        {
          icon: BarChart3,
          title: t('doctor.portal.featureReportingTitle'),
          description: t('doctor.portal.featureReportingBody'),
        },
      ]}
      actions={
        <button
          type="button"
          onClick={() => navigate('/doctor/dashboard')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          <span>{t('doctor.portal.actionOpenDashboard')}</span>
        </button>
      }
    />
  );
};
