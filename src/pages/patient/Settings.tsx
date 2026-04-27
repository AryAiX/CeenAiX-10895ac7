import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { PatientReferenceShell } from '../../components/PatientReferenceShell';
import { useSettingsStub } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

export const PatientSettings = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  useSettingsStub(user?.id ?? null);

  return (
    <PatientReferenceShell activeTab="settings">
      <PhaseStub
        accent="cyan"
        icon={SettingsIcon}
        phaseLabel={t('system.phaseStub.phasePlanned')}
        title={t('patient.settings.title')}
        subtitle={t('patient.settings.subtitle')}
        features={[
          {
            icon: Bell,
            title: t('patient.settings.featureNotificationsTitle'),
            description: t('patient.settings.featureNotificationsBody'),
          },
          {
            icon: ShieldCheck,
            title: t('patient.settings.featurePrivacyTitle'),
            description: t('patient.settings.featurePrivacyBody'),
          },
          {
            icon: Globe,
            title: t('patient.settings.featureLanguageTitle'),
            description: t('patient.settings.featureLanguageBody'),
          },
        ]}
        actions={
          <button
            type="button"
            onClick={() => navigate('/patient/profile')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            <span>{t('patient.settings.actionManageProfile')}</span>
          </button>
        }
      />
    </PatientReferenceShell>
  );
};
