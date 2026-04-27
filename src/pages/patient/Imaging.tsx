import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Scan, Share2, Sparkles } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { PatientReferenceShell } from '../../components/PatientReferenceShell';
import { useImagingStudiesStub } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

export const PatientImaging = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  useImagingStudiesStub(user?.id ?? null);

  return (
    <PatientReferenceShell activeTab="imaging">
      <PhaseStub
        accent="violet"
        icon={Scan}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('patient.imaging.title')}
        subtitle={t('patient.imaging.subtitle')}
        features={[
          {
            icon: Scan,
            title: t('patient.imaging.featureViewerTitle'),
            description: t('patient.imaging.featureViewerBody'),
          },
          {
            icon: Sparkles,
            title: t('patient.imaging.featureAiReadingTitle'),
            description: t('patient.imaging.featureAiReadingBody'),
          },
          {
            icon: Share2,
            title: t('patient.imaging.featureShareTitle'),
            description: t('patient.imaging.featureShareBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/patient/records')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('patient.imaging.actionBackRecords')}</span>
          </button>
        }
      />
    </PatientReferenceShell>
  );
};
