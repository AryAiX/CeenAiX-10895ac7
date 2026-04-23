import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';

export const PatientMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {t('patient.messages.title')} 💬
          </h1>
          <p className="mt-2 text-[15px] text-slate-400">{t('patient.messages.subtitle')}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-700 px-6 py-3 text-white shadow-lg shadow-cyan-500/30">
          <MessageCircle className="h-4 w-4" />
          <span className="text-[13px] font-bold">{t('patient.messages.encryptedBadge')}</span>
        </div>
      </div>
      <MessagesWorkspace role="patient" />
    </>
  );
};
