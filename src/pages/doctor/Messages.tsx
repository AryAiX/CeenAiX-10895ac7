import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCheck, Lock, MessageSquare } from 'lucide-react';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';

export const DoctorMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900">{t('doctor.messages.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('doctor.messages.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
            <Lock className="h-4 w-4" />
            Encrypted
          </span>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3">
          {['All', 'Patients', 'Doctors', 'Pharmacy', 'Labs'].map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`inline-flex whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                index === 0 ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {index === 0 ? <MessageSquare className="mr-2 h-4 w-4" /> : null}
              {filter}
            </button>
          ))}
        </div>
      </div>
      <MessagesWorkspace role="doctor" />
    </>
  );
};
