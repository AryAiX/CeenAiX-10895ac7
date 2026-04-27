import React from 'react';
import { useTranslation } from 'react-i18next';
import { DoctorReferenceShell } from '../../components/DoctorReferenceShell';
import { MessagesWorkspace } from '../../components/MessagesWorkspace';

export const DoctorMessages: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <DoctorReferenceShell title={t('doctor.messages.title')} subtitle={t('doctor.messages.subtitle')}>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-600">
            Secure messaging workspace for patient coordination and care handoffs.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <MessagesWorkspace role="doctor" />
        </div>
      </div>
    </DoctorReferenceShell>
  );
};
