import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  monthlyPremium: number;
  coverageLimit: string;
  features: string[];
  popular: boolean;
}

export const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const plans: InsurancePlan[] = [
    {
      id: '1',
      name: 'Essential Care',
      provider: 'DHA Approved Provider',
      monthlyPremium: 299,
      coverageLimit: 'AED 150,000',
      features: [
        'Inpatient hospitalization',
        'Emergency care',
        'Basic diagnostics',
        'GP consultations',
        'Pharmacy coverage (50%)',
      ],
      popular: false,
    },
    {
      id: '2',
      name: 'Premium Health',
      provider: 'DHA Approved Provider',
      monthlyPremium: 599,
      coverageLimit: 'AED 500,000',
      features: [
        'Inpatient & outpatient care',
        'Emergency services',
        'Advanced diagnostics & imaging',
        'Specialist consultations',
        'Pharmacy coverage (80%)',
        'Maternity care',
        'Dental & optical',
      ],
      popular: true,
    },
    {
      id: '3',
      name: 'Elite Wellness',
      provider: 'DHA Approved Provider',
      monthlyPremium: 999,
      coverageLimit: 'AED 1,000,000',
      features: [
        'Comprehensive inpatient & outpatient',
        'Priority emergency services',
        'Full diagnostics & imaging',
        'Unlimited specialist access',
        'Pharmacy coverage (100%)',
        'Maternity & newborn care',
        'Dental, optical & preventive',
        'International coverage',
        'Wellness programs',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Health Insurance</h1>
          <p className="text-gray-600">DHA-compliant plans with comprehensive coverage</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-center">
          <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-900">
            All plans are approved by Dubai Health Authority (DHA) and include coverage at CeenAiX partner facilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                plan.popular ? 'ring-4 ring-blue-500 relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-2 text-sm font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600">{plan.provider}</p>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      AED {plan.monthlyPremium}
                    </span>
                    <span className="text-gray-600 ml-2">/month</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Coverage up to <span className="font-semibold">{plan.coverageLimit}</span>
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => navigate('/auth')}
                  className={`w-full py-3 font-medium rounded-lg transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  Get Started
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Why Choose CeenAiX Insurance?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">DHA Compliant</h3>
              <p className="text-sm text-gray-600">
                All plans meet Dubai Health Authority requirements
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Wide Network</h3>
              <p className="text-sm text-gray-600">
                Access to 200+ healthcare facilities across UAE
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Smart health tracking and personalized recommendations
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
