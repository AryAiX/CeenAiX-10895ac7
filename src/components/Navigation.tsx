import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, X, Heart } from 'lucide-react';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const getNavLinks = () => {
    if (!userProfile) return [];

    switch (userProfile.role) {
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

  const navLinks = getNavLinks();

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Heart className="w-8 h-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">CeenAiX</span>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-sm text-gray-600">
              {userProfile?.full_name}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>

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
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};
