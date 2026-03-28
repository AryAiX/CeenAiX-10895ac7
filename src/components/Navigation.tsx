import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, LogOut, ChevronDown, UserCircle2, Settings } from 'lucide-react';
import { getDefaultRouteForRole, useAuth } from '../lib/auth-context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavigationProps {
  role?: 'patient' | 'doctor';
}

export const Navigation: React.FC<NavigationProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('common');
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const navLinks = useMemo(() => {
    if (!role) {
      return [];
    }

    switch (role) {
      case 'patient':
        return [
          { label: t('nav.dashboard'), href: '/patient/dashboard' },
          { label: t('nav.appointments'), href: '/patient/appointments' },
          { label: t('nav.prescriptions'), href: '/patient/prescriptions' },
          { label: t('nav.records'), href: '/patient/records' },
          { label: t('nav.messages'), href: '/patient/messages' },
        ];
      case 'doctor':
        return [
          { label: t('nav.dashboard'), href: '/doctor/dashboard' },
          { label: t('nav.patients'), href: '/doctor/patients' },
          { label: t('nav.appointments'), href: '/doctor/appointments' },
          { label: t('nav.schedule'), href: '/doctor/schedule' },
          { label: t('nav.prescriptions'), href: '/doctor/prescriptions' },
          { label: t('nav.messages'), href: '/doctor/messages' },
        ];
      default:
        return [];
    }
  }, [role, t]);

  const theme = useMemo(() => {
    if (role === 'doctor') {
      return {
        bg: 'sticky top-0 z-40 border-b border-emerald-900/50 bg-gradient-to-r from-slate-900 to-emerald-900 shadow-md',
        text: 'text-white',
        activeText: 'text-white',
        activeBg: 'bg-white/15',
        hoverBg: 'hover:bg-white/10',
        hoverText: 'hover:text-white',
        underline: 'bg-emerald-300',
        logoText: 'text-white',
        mobileActiveBg: 'bg-white/20',
        mobileActiveText: 'text-white',
        mobileText: 'text-white/90',
        accountSub: 'text-white/80',
        dropdownBorder: 'border-white/20',
        dropdownBg: 'bg-slate-900 text-white',
        dropdownHeaderBorder: 'border-b border-white/10',
        dropdownMuted: 'text-white/80',
        dropdownHover: 'hover:bg-white/10',
        mobileCard: 'bg-white/10',
        emailMuted: 'text-white/80',
      };
    }
    return {
      bg: 'sticky top-0 z-40 border-b border-slate-200 bg-white/90 shadow-sm backdrop-blur-md',
      text: 'text-slate-700',
      activeText: 'text-ceenai-cyan',
      activeBg: 'bg-ceenai-cyan/10',
      hoverBg: 'hover:bg-slate-50',
      hoverText: 'hover:text-ceenai-cyan',
      underline: 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue',
      logoText: 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent',
      mobileActiveBg: 'bg-ceenai-cyan/10',
      mobileActiveText: 'text-ceenai-cyan',
      mobileText: 'text-slate-700',
      accountSub: 'text-slate-500',
      dropdownBorder: 'border-slate-200',
      dropdownBg: 'bg-white text-slate-900',
      dropdownHeaderBorder: 'border-b border-slate-100',
      dropdownMuted: 'text-slate-500',
      dropdownHover: 'hover:bg-slate-50',
      mobileCard: 'bg-slate-50',
      emailMuted: 'text-slate-500',
    };
  }, [role]);

  const portalHomePath = role ? getDefaultRouteForRole(role) : '/';
  const accountInfoPath = role ? `/${role}/profile` : '/auth/onboarding';
  const accountDisplayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Account';
  const accountDisplayEmail = profile?.email ?? user?.email ?? null;

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  const accountMenuText = useMemo(() => {
    if (role === 'doctor') {
      return t('nav.doctorAccount');
    }
    if (role === 'patient') {
      return t('nav.patientAccount');
    }
    return t('nav.account');
  }, [role, t]);

  const portalSuffix = useMemo(() => {
    if (role === 'doctor') {
      return `| ${t('nav.doctorPortal')}`;
    }
    if (role === 'patient') {
      return `| ${t('nav.patientPortal')}`;
    }
    return '';
  }, [role, t]);

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <nav className={theme.bg}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div
            className="flex cursor-pointer items-center gap-3"
            onClick={() => navigate(portalHomePath)}
          >
            <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 rounded-xl" />
            <span className={`text-xl font-bold ${theme.logoText}`}>
              CeenAiX {portalSuffix ? ` ${portalSuffix}` : ''}
            </span>
          </div>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${theme.activeText} ${theme.activeBg} font-semibold`
                      : `${theme.text} ${theme.hoverBg} ${theme.hoverText}`
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${theme.underline}`}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <LanguageSwitcher dense variant={role === 'doctor' ? 'dark' : 'light'} />
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 transition-all ${theme.text} ${theme.hoverBg}`}
              >
                <UserCircle2 className="h-8 w-8 shrink-0" />
                <div className="min-w-0 text-start leading-tight">
                  <p className="truncate text-sm font-semibold">{accountDisplayName}</p>
                  <p className={`truncate text-xs ${theme.accountSub}`}>{accountMenuText}</p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {accountMenuOpen ? (
                <div
                  className={`absolute end-0 mt-2 w-72 overflow-hidden rounded-2xl border shadow-xl ${theme.dropdownBorder} ${theme.dropdownBg}`}
                >
                  <div className={`px-4 py-4 ${theme.dropdownHeaderBorder}`}>
                    <p className="text-sm font-semibold">{accountDisplayName}</p>
                    {accountDisplayEmail ? (
                      <p className={`mt-1 text-xs ${theme.dropdownMuted}`}>{accountDisplayEmail}</p>
                    ) : null}
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        navigate(accountInfoPath);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium transition-all ${theme.dropdownHover}`}
                    >
                      <Settings className="h-4 w-4 shrink-0" />
                      <span>{t('nav.profile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await handleSignOut();
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-sm font-medium transition-all ${theme.dropdownHover}`}
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>{t('nav.logOut')}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`rounded-md p-2 md:hidden ${theme.text}`}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="space-y-2 pb-4 md:hidden">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  type="button"
                  onClick={() => {
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-start text-sm font-medium ${
                    isActive
                      ? `${theme.mobileActiveText} ${theme.mobileActiveBg} font-semibold`
                      : `${theme.mobileText} ${theme.hoverBg}`
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className={`mt-4 rounded-xl p-3 ${theme.mobileCard}`}>
              <div className="flex items-center gap-3 px-1 pb-3">
                <UserCircle2 className="h-9 w-9 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{accountDisplayName}</p>
                  {accountDisplayEmail ? (
                    <p className={`truncate text-xs ${theme.emailMuted}`}>{accountDisplayEmail}</p>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigate(accountInfoPath);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm font-medium ${theme.mobileText} ${theme.hoverBg}`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>{t('nav.profile')}</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleSignOut();
                }}
                className={`mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm font-medium ${theme.mobileText} ${theme.hoverBg}`}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>{t('nav.logOut')}</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </nav>
  );
};
