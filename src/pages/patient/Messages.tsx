import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const PatientMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="patient" />
      <PageHeader
        title={t('patient.messages.title')}
        subtitle={t('patient.messages.subtitle')}
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MessagesWorkspace role="patient" />
      </div>
    </div>
  );
};
