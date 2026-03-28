import React from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';

export const PatientMessages: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

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
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <h2 className="text-lg font-bold text-white">{t('patient.messages.conversations')}</h2>
              </div>

              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <p className="font-semibold text-gray-900">{t('patient.messages.noneTitle')}</p>
                <p className="mt-2 text-sm text-gray-600">{t('patient.messages.noneBody')}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[600px] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <h3 className="font-bold text-white">{t('patient.messages.detail')}</h3>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                  <MessageSquare className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{t('patient.messages.placeholderTitle')}</h3>
                <p className="mt-3 max-w-md text-sm text-gray-600">{t('patient.messages.placeholderBody')}</p>
                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg"
                >
                  {t('patient.messages.backDashboard')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
