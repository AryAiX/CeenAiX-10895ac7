import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

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

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-ceenai-cyan/20">
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
            <span className="text-xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
              CeenAiX
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-ceenai-cyan bg-ceenai-cyan/10 font-semibold'
                      : 'text-gray-700 hover:text-ceenai-cyan hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600"
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
                      ? 'text-ceenai-cyan bg-ceenai-cyan/10 font-semibold'
                      : 'text-gray-700 hover:text-ceenai-cyan hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};
