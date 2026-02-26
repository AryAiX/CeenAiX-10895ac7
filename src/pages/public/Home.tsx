import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageSquare, Search, Building2, Shield, BookOpen, Calendar } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Health Chat',
      description: 'Get instant medical guidance from our AI-powered health assistant',
      action: () => navigate('/ai-chat'),
      color: 'blue',
    },
    {
      icon: Search,
      title: 'Find a Doctor',
      description: 'Browse specialists by expertise, location, and availability',
      action: () => navigate('/find-doctor'),
      color: 'green',
    },
    {
      icon: Building2,
      title: 'Find Clinics',
      description: 'Discover healthcare facilities near you',
      action: () => navigate('/find-clinic'),
      color: 'purple',
    },
    {
      icon: Shield,
      title: 'Insurance Plans',
      description: 'Compare coverage options and find the right plan',
      action: () => navigate('/insurance'),
      color: 'orange',
    },
    {
      icon: BookOpen,
      title: 'Health Education',
      description: 'Access medical articles and preventive care guides',
      action: () => navigate('/health-education'),
      color: 'cyan',
    },
    {
      icon: Calendar,
      title: 'Book Appointment',
      description: 'Schedule consultations with healthcare providers',
      action: () => navigate('/auth'),
      color: 'red',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Heart className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CeenAiX</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Health,
            <span className="text-blue-600"> Reimagined</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience healthcare powered by AI. Get instant medical insights, connect with top specialists,
            and manage your health journey all in one intelligent platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
              green: 'bg-green-50 text-green-600 hover:bg-green-100',
              purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
              orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
              cyan: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100',
              red: 'bg-red-50 text-red-600 hover:bg-red-100',
            }[feature.color];

            return (
              <button
                key={index}
                onClick={feature.action}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-8 text-left group"
              >
                <div className={`w-14 h-14 rounded-xl ${colorClasses} flex items-center justify-center mb-4 transition-colors`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Healthcare?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare providers using CeenAiX for smarter,
            faster, and more personalized care.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors text-lg shadow-lg"
          >
            Create Free Account
          </button>
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
