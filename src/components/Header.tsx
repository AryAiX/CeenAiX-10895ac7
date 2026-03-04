import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Doctors', path: '/find-doctor' },
    { label: 'Clinics', path: '/find-clinic' },
    { label: 'Pharmacy', path: '/pharmacy' },
    { label: 'Laboratories', path: '/laboratories' },
    { label: 'Insurance', path: '/insurance' },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy bg-clip-text text-transparent">
              CeenAiX
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative text-gray-700 hover:text-ceenai-blue font-medium transition-colors py-2"
                >
                  {item.label}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/patient/profile')}
              className="px-6 py-2.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              Patient
            </button>
            <button
              onClick={() => navigate('/doctor/profile')}
              className="px-6 py-2.5 border-2 border-ceenai-navy text-ceenai-navy hover:bg-ceenai-navy hover:text-white font-semibold rounded-xl transition-all"
            >
              Doctor
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
