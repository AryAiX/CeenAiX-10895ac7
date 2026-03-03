import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white/95 backdrop-blur-lg shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
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
            <button onClick={() => navigate('/find-doctor')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
              Doctors
            </button>
            <button onClick={() => navigate('/find-clinic')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
              Clinics
            </button>
            <button onClick={() => navigate('/pharmacy')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
              Pharmacy
            </button>
            <button onClick={() => navigate('/laboratories')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
              Laboratories
            </button>
            <button onClick={() => navigate('/insurance')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
              Insurance
            </button>
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
