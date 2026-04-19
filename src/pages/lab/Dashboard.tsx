import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Gauge, Inbox, ListChecks } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useLabDashboardStub } from '../../hooks';

export const LabDashboard = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  useLabDashboardStub();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PhaseStub
        accent="emerald"
        icon={FlaskConical}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('lab.dashboard.title')}
        subtitle={t('lab.dashboard.subtitle')}
        features={[
          {
            icon: Inbox,
            title: t('lab.dashboard.featureQueueTitle'),
            description: t('lab.dashboard.featureQueueBody'),
          },
          {
            icon: ListChecks,
            title: t('lab.dashboard.featureResultsTitle'),
            description: t('lab.dashboard.featureResultsBody'),
          },
          {
            icon: Gauge,
            title: t('lab.dashboard.featureQualityTitle'),
            description: t('lab.dashboard.featureQualityBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span>{t('lab.dashboard.actionBack')}</span>
          </button>
        }
      />
    </div>
  );
};
