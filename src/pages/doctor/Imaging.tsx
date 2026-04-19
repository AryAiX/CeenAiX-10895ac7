import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Layers, ListChecks, Scan, Workflow } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useImagingStudiesStub } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

export const DoctorImaging = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  useImagingStudiesStub(user?.id ?? null);

  return (
    <PhaseStub
      accent="violet"
      icon={Scan}
      phaseLabel={t('system.phaseStub.phasePlanned')}
      title={t('doctor.imaging.title')}
      subtitle={t('doctor.imaging.subtitle')}
      features={[
        {
          icon: ListChecks,
          title: t('doctor.imaging.featureQueueTitle'),
          description: t('doctor.imaging.featureQueueBody'),
        },
        {
          icon: Layers,
          title: t('doctor.imaging.featureViewerTitle'),
          description: t('doctor.imaging.featureViewerBody'),
        },
        {
          icon: Workflow,
          title: t('doctor.imaging.featureHandoffTitle'),
          description: t('doctor.imaging.featureHandoffBody'),
        },
      ]}
      actions={
        <button
          type="button"
          onClick={() => navigate('/doctor/patients')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <span>{t('doctor.imaging.actionBackPatients')}</span>
        </button>
      }
    />
  );
};
