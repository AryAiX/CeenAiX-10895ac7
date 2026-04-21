import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const openRegistration = (role: 'patient' | 'doctor') => {
    navigate(`/auth/register?role=${role}&reset=1`);
  };

  const menuItems = useMemo(
    () => [
      { label: t('header.doctors'), path: '/find-doctor' },
      { label: t('header.clinics'), path: '/find-clinic' },
      { label: t('header.pharmacy'), path: '/pharmacy' },
      { label: t('header.laboratories'), path: '/laboratories' },
      { label: t('header.insurance'), path: '/insurance' },
    ],
    [t]
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-xl shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <div className="flex cursor-pointer items-center gap-3" onClick={() => navigate('/')}>
            <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 object-contain" />
            <div>
              <span className="block bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy bg-clip-text text-2xl font-bold text-transparent">
                CeenAiX
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-slate-400">
                {t('brand.tagline')}
              </span>
            </div>
          </div>

          <div className="hidden items-center space-x-8 lg:flex">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative py-2 text-sm font-medium text-slate-600 transition-colors hover:text-ceenai-blue"
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher dense />
            <button
              onClick={() => openRegistration('patient')}
              className="rounded-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl sm:px-5 sm:text-sm"
            >
              {t('header.patient')}
            </button>
            <button
              onClick={() => openRegistration('doctor')}
              className="hidden rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-ceenai-cyan hover:text-ceenai-blue sm:inline-flex"
            >
              {t('header.doctor')}
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
