import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Flag, PenLine } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useLabResultEntryStub } from '../../hooks';

export const LabResultEntry = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useLabResultEntryStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={CheckCircle2}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('lab.resultEntry.title')}
        subtitle={t('lab.resultEntry.subtitle')}
        features={[
          {
            icon: ClipboardList,
            title: t('lab.resultEntry.featureStructuredTitle'),
            description: t('lab.resultEntry.featureStructuredBody'),
          },
          {
            icon: Flag,
            title: t('lab.resultEntry.featureFlagTitle'),
            description: t('lab.resultEntry.featureFlagBody'),
          },
          {
            icon: PenLine,
            title: t('lab.resultEntry.featureSignTitle'),
            description: t('lab.resultEntry.featureSignBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/lab/dashboard')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('lab.resultEntry.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
