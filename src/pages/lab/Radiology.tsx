import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, FileText, Layers, Scan } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useLabRadiologyStub } from '../../hooks';

export const LabRadiology = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useLabRadiologyStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="violet"
        icon={Scan}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('lab.radiology.title')}
        subtitle={t('lab.radiology.subtitle')}
        features={[
          {
            icon: ClipboardList,
            title: t('lab.radiology.featureWorklistTitle'),
            description: t('lab.radiology.featureWorklistBody'),
          },
          {
            icon: Layers,
            title: t('lab.radiology.featureViewerTitle'),
            description: t('lab.radiology.featureViewerBody'),
          },
          {
            icon: FileText,
            title: t('lab.radiology.featureReportsTitle'),
            description: t('lab.radiology.featureReportsBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/lab/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('lab.radiology.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
