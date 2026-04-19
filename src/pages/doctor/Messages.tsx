import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';

export const DoctorMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('doctor.messages.title')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('doctor.messages.subtitle')}</p>
      </div>
      <MessagesWorkspace role="doctor" />
    </>
  );
};
