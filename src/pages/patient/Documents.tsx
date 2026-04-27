import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Share2, Sparkles, ShieldCheck } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { PatientReferenceShell } from '../../components/PatientReferenceShell';

export const PatientDocuments = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  return (
    <PatientReferenceShell activeTab="documents">
      <PhaseStub
        accent="cyan"
        icon={FolderOpen}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('patient.documents.title')}
        subtitle={t('patient.documents.subtitle')}
        features={[
          {
            icon: ShieldCheck,
            title: t('patient.documents.featureVaultTitle'),
            description: t('patient.documents.featureVaultBody'),
          },
          {
            icon: Share2,
            title: t('patient.documents.featureSharingTitle'),
            description: t('patient.documents.featureSharingBody'),
          },
          {
            icon: Sparkles,
            title: t('patient.documents.featureOcrTitle'),
            description: t('patient.documents.featureOcrBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/patient/records')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <span>{t('patient.documents.actionBackHealth')}</span>
          </button>
        }
      />
    </PatientReferenceShell>
  );
};
