import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const DoctorMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90">
      <Navigation role="doctor" />
      <PageHeader
        title={t('doctor.messages.title')}
        subtitle={t('doctor.messages.subtitle')}
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <MessagesWorkspace role="doctor" />
      </div>
    </div>
  );
};
