import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';

interface NavigationProps {
  role?: 'patient' | 'doctor';
}

export const Navigation: React.FC<NavigationProps> = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          { label: 'Profile', href: '/patient/profile' },
        ];
      case 'doctor':
        return [
          { label: 'Dashboard', href: '/doctor/dashboard' },
          { label: 'Patients', href: '/doctor/patients' },
          { label: 'Appointments', href: '/doctor/appointments' },
          { label: 'Prescriptions', href: '/doctor/prescriptions' },
          { label: 'Messages', href: '/doctor/messages' },
          { label: 'Profile', href: '/doctor/profile' },
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

  return (
    <nav className={`${theme.bg} shadow-lg sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer space-x-3"
            onClick={() => navigate('/')}
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
            <button
              onClick={() => navigate('/')}
              className={`hidden md:flex items-center space-x-2 px-4 py-2 ${theme.text} ${theme.hoverBg} rounded-lg transition-all font-medium`}
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Portal</span>
            </button>
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
            <button
              onClick={() => {
                navigate('/');
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${theme.mobileText} ${theme.hoverBg} flex items-center space-x-2`}
            >
              <LogOut className="w-4 h-4" />
              <span>Exit Portal</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};
