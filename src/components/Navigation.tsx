import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, ChevronDown, UserCircle2, Settings } from 'lucide-react';
import { getDefaultRouteForRole, useAuth } from '../lib/auth-context';

interface NavigationProps {
  role?: 'patient' | 'doctor';
}

export const Navigation: React.FC<NavigationProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const getNavLinks = () => {
    if (!role) return [];

    switch (role) {
      case 'patient':
        return [
          { label: 'Dashboard', href: '/patient/dashboard' },
          { label: 'Appointments', href: '/patient/appointments' },
          { label: 'Prescriptions', href: '/patient/prescriptions' },
          { label: 'Records', href: '/patient/records' },
          { label: 'Messages', href: '/patient/messages' },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', href: '/doctor/dashboard' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: 'Appointments', href: '/doctor/appointments' },
          { label: 'Prescriptions', href: '/doctor/prescriptions' },
          { label: 'Messages', href: '/doctor/messages' },
        ];
      default:
        return [];
    }
  };

  const getTheme = () => {
    if (role === 'doctor') {
      return {
        bg: 'bg-gradient-to-r from-teal-600 to-emerald-600',
        text: 'text-white',
        activeText: 'text-white',
        activeBg: 'bg-white/20',
        hoverBg: 'hover:bg-white/10',
        underline: 'bg-white',
        logoText: 'text-white',
        mobileActiveBg: 'bg-white/20',
        mobileActiveText: 'text-white',
        mobileText: 'text-white/90',
      };
    }
    return {
      bg: 'bg-white/95 backdrop-blur-sm border-b border-ceenai-cyan/20',
      text: 'text-gray-700',
      activeText: 'text-ceenai-cyan',
      activeBg: 'bg-ceenai-cyan/10',
      hoverBg: 'hover:bg-gray-50',
      underline: 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue',
      logoText: 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent',
      mobileActiveBg: 'bg-ceenai-cyan/10',
      mobileActiveText: 'text-ceenai-cyan',
      mobileText: 'text-gray-700',
    };
  };

  const navLinks = getNavLinks();
  const theme = getTheme();
  const portalHomePath = role ? getDefaultRouteForRole(role) : '/';
  const accountInfoPath = role ? `/${role}/profile` : '/auth/onboarding';
  const accountDisplayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Account';
  const accountDisplayEmail = profile?.email ?? user?.email ?? null;

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  const accountMenuText = useMemo(
    () => (role === 'doctor' ? 'Doctor account' : role === 'patient' ? 'Patient account' : 'Account'),
    [role]
  );

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <nav className={`${theme.bg} shadow-lg sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer space-x-3"
            onClick={() => navigate(portalHomePath)}
          >
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-10 w-auto"
            />
            <span className={`text-xl font-bold ${theme.logoText}`}>
              CeenAiX {role === 'doctor' ? '| Doctor Portal' : role === 'patient' ? '| Patient Portal' : ''}
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${theme.activeText} ${theme.activeBg} font-semibold`
                      : `${theme.text} ${theme.hoverBg} hover:${theme.activeText}`
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme.underline} rounded-full`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountMenuOpen((open) => !open)}
                className={`flex items-center space-x-3 rounded-xl px-3 py-2 transition-all ${theme.text} ${theme.hoverBg}`}
              >
                <UserCircle2 className="h-8 w-8" />
                <div className="text-left leading-tight">
                  <p className="text-sm font-semibold">{accountDisplayName}</p>
                  <p className={`text-xs ${role === 'doctor' ? 'text-white/80' : 'text-gray-500'}`}>
                    {accountMenuText}
                  </p>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${accountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountMenuOpen ? (
                <div
                  className={`absolute right-0 mt-2 w-72 overflow-hidden rounded-2xl border shadow-xl ${
                    role === 'doctor'
                      ? 'border-white/20 bg-teal-700 text-white'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  <div className={`px-4 py-4 ${role === 'doctor' ? 'border-b border-white/10' : 'border-b border-gray-100'}`}>
                    <p className="text-sm font-semibold">{accountDisplayName}</p>
                    {accountDisplayEmail ? (
                      <p className={`mt-1 text-xs ${role === 'doctor' ? 'text-white/80' : 'text-gray-500'}`}>
                        {accountDisplayEmail}
                      </p>
                    ) : null}
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        navigate(accountInfoPath);
                      }}
                      className={`flex w-full items-center space-x-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                        role === 'doctor' ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await handleSignOut();
                      }}
                      className={`flex w-full items-center space-x-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all ${
                        role === 'doctor' ? 'hover:bg-white/10' : 'hover:bg-gray-50'
                      }`}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-md ${theme.text}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => {
                    navigate(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? `${theme.mobileActiveText} ${theme.mobileActiveBg} font-semibold`
                      : `${theme.mobileText} ${theme.hoverBg}`
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
            <div className={`mt-4 rounded-xl p-3 ${role === 'doctor' ? 'bg-white/10' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3 px-1 pb-3">
                <UserCircle2 className="h-9 w-9" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{accountDisplayName}</p>
                  {accountDisplayEmail ? (
                    <p className={`truncate text-xs ${role === 'doctor' ? 'text-white/80' : 'text-gray-500'}`}>
                      {accountDisplayEmail}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                onClick={() => {
                  navigate(accountInfoPath);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-sm font-medium ${theme.mobileText} ${theme.hoverBg}`}
              >
                <Settings className="w-4 h-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={async () => {
                  setMobileMenuOpen(false);
                  await handleSignOut();
                }}
                className={`mt-2 flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-sm font-medium ${theme.mobileText} ${theme.hoverBg}`}
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
