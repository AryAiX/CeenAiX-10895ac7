import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Bell, CalendarRange, Settings as SettingsIcon, Stethoscope } from 'lucide-react';
import { PhaseStub } from '../../components/system/PhaseStub';
import { useSettingsStub } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

export const DoctorSettings = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  useSettingsStub(user?.id ?? null);

  return (
    <PhaseStub
      accent="cyan"
      icon={SettingsIcon}
      phaseLabel={t('system.phaseStub.phasePlanned')}
      title={t('doctor.settings.title')}
      subtitle={t('doctor.settings.subtitle')}
      features={[
        {
          icon: CalendarRange,
          title: t('doctor.settings.featureAvailabilityTitle'),
          description: t('doctor.settings.featureAvailabilityBody'),
        },
        {
          icon: Stethoscope,
          title: t('doctor.settings.featureClinicalTitle'),
          description: t('doctor.settings.featureClinicalBody'),
        },
        {
          icon: Bell,
          title: t('doctor.settings.featureNotificationsTitle'),
          description: t('doctor.settings.featureNotificationsBody'),
        },
      ]}
      actions={
        <button
          type="button"
          onClick={() => navigate('/doctor/profile')}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
        >
          <span>{t('doctor.settings.actionOpenProfile')}</span>
        </button>
      }
    />
  );
};
