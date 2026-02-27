import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search, Building2, Shield, BookOpen, User, Stethoscope } from 'lucide-react';
import { GeometricBackground } from '../../components/GeometricBackground';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Health Chat',
      description: 'Get instant medical guidance from our AI-powered health assistant',
      action: () => navigate('/ai-chat'),
      gradient: 'from-ceenai-cyan to-ceenai-blue',
    },
    {
      icon: Search,
      title: 'Find a Doctor',
      description: 'Browse specialists by expertise, location, and availability',
      action: () => navigate('/find-doctor'),
      gradient: 'from-ceenai-blue to-ceenai-navy',
    },
    {
      icon: Building2,
      title: 'Find Clinics',
      description: 'Discover healthcare facilities near you',
      action: () => navigate('/find-clinic'),
      gradient: 'from-ceenai-cyan-light to-ceenai-cyan',
    },
    {
      icon: Shield,
      title: 'Insurance Plans',
      description: 'Compare coverage options and find the right plan',
      action: () => navigate('/insurance'),
      gradient: 'from-ceenai-blue-dark to-ceenai-blue',
    },
    {
      icon: BookOpen,
      title: 'Health Education',
      description: 'Access medical articles and preventive care guides',
      action: () => navigate('/health-education'),
      gradient: 'from-ceenai-cyan to-ceenai-blue-light',
    },
    {
      icon: User,
      title: 'Patient Profile',
      description: 'Manage your health information and medical history',
      action: () => navigate('/patient/profile'),
      gradient: 'from-ceenai-blue to-ceenai-cyan',
    },
    {
      icon: Stethoscope,
      title: 'Doctor Profile',
      description: 'Professional profile for healthcare providers',
      action: () => navigate('/doctor/profile'),
      gradient: 'from-ceenai-navy to-ceenai-blue',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ceenai-cyan/5 via-white to-ceenai-blue/5 relative overflow-hidden">
      <GeometricBackground />
      <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-ceenai-cyan/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                alt="CeenAiX Logo"
                className="h-10 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
                CeenAiX
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/patient/profile')}
                className="px-4 py-2 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Patient
              </button>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="px-4 py-2 bg-gradient-to-r from-ceenai-navy to-ceenai-blue hover:from-ceenai-navy-dark hover:to-ceenai-blue-dark text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Doctor
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-32 w-auto animate-float"
            />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health,
            <span className="bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent"> Reimagined</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Experience healthcare powered by AI. Get instant medical insights, connect with top specialists,
            and manage your health journey all in one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <button
                key={index}
                onClick={feature.action}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 text-left group border border-ceenai-cyan/20 hover:border-ceenai-cyan/50 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-ceenai-cyan group-hover:to-ceenai-blue group-hover:bg-clip-text group-hover:text-transparent transition-all">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy rounded-3xl p-12 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare?</h2>
            <p className="text-xl text-ceenai-cyan-light mb-8 max-w-2xl mx-auto">
              Join thousands of patients and healthcare providers using CeenAiX for smarter,
              faster, and more personalized care.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/patient/profile')}
                className="px-8 py-4 bg-white text-ceenai-blue hover:bg-gray-50 font-bold rounded-xl transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Patient Portal
              </button>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="px-8 py-4 bg-white text-ceenai-navy hover:bg-gray-50 font-bold rounded-xl transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Doctor Portal
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">© 2026 CeenAiX. Secure healthcare platform with AI-powered insights.</p>
            <p className="text-xs mt-2 text-gray-500">DHA-compliant healthcare technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
