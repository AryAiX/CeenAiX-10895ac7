import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-4 py-14 text-slate-300">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 rounded-xl" />
              <div>
                <span className="block text-xl font-bold text-white">CeenAiX</span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500">
                  {t('brand.tagline')}
                </span>
              </div>
            </div>
            <p className="max-w-sm leading-relaxed text-slate-400">{t('footer.blurb')}</p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('footer.services')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => navigate('/find-doctor')} className="transition-colors hover:text-ceenai-cyan">
                  {t('footer.findDoctors')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/find-clinic')} className="transition-colors hover:text-ceenai-cyan">
                  {t('footer.findClinics')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/ai-chat')} className="transition-colors hover:text-ceenai-cyan">
                  {t('footer.aiHealthChat')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('footer.resources')}
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/health-education')}
                  className="transition-colors hover:text-ceenai-cyan"
                >
                  {t('footer.healthEducation')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/insurance')} className="transition-colors hover:text-ceenai-cyan">
                  {t('header.insurance')}
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/auth/login')} className="transition-colors hover:text-ceenai-cyan">
                  {t('footer.signIn')}
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>support@ceenaix.com</li>
              <li>1-800-CEENAIX</li>
              <li>{t('footer.supportLine')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.legal')}</p>
          <p>{t('footer.legalSub')}</p>
        </div>
      </div>
    </footer>
  );
};
