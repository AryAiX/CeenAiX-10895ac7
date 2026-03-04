import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, Heart, X, ArrowLeftRight } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface InsurancePlan {
  id: string;
  name: string;
  provider: string;
  monthlyPremium: number;
  coverageLimit: string;
  inpatientCoverage: string;
  outpatientCoverage: string;
  emergencyCare: string;
  maternityCare: string;
  dentalOptical: string;
  pharmacyCoverage: string;
  features: string[];
  popular: boolean;
}

export const Insurance: React.FC = () => {
  const navigate = useNavigate();
  const [showComparison, setShowComparison] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  const plans: InsurancePlan[] = [
    {
      id: '1',
      name: 'Basic Shield',
      provider: 'NextCare Insurance',
      monthlyPremium: 299,
      coverageLimit: 'AED 150,000',
      inpatientCoverage: 'Full coverage',
      outpatientCoverage: 'Not included',
      emergencyCare: '24/7 Coverage',
      maternityCare: 'Not included',
      dentalOptical: 'Not included',
      pharmacyCoverage: '50%',
      features: [
        'Inpatient hospitalization',
        'Emergency care 24/7',
        'Basic diagnostics',
        'GP consultations',
        'Pharmacy coverage (50%)',
      ],
      popular: false,
    },
    {
      id: '2',
      name: 'Silver Plus',
      provider: 'Oman Insurance',
      monthlyPremium: 450,
      coverageLimit: 'AED 300,000',
      inpatientCoverage: 'Full coverage',
      outpatientCoverage: 'Up to AED 10,000',
      emergencyCare: '24/7 Coverage',
      maternityCare: 'Normal delivery',
      dentalOptical: 'AED 500',
      pharmacyCoverage: '60%',
      features: [
        'Inpatient & limited outpatient',
        'Emergency services',
        'Diagnostics & imaging',
        'Specialist consultations (limited)',
        'Pharmacy coverage (60%)',
        'Normal delivery maternity',
      ],
      popular: false,
    },
    {
      id: '3',
      name: 'Gold Premium',
      provider: 'Daman Insurance',
      monthlyPremium: 599,
      coverageLimit: 'AED 500,000',
      inpatientCoverage: 'Full coverage',
      outpatientCoverage: 'Up to AED 25,000',
      emergencyCare: '24/7 Priority',
      maternityCare: 'Full coverage',
      dentalOptical: 'AED 2,000',
      pharmacyCoverage: '80%',
      features: [
        'Inpatient & outpatient care',
        'Priority emergency services',
        'Advanced diagnostics & imaging',
        'Specialist consultations',
        'Pharmacy coverage (80%)',
        'Full maternity care',
        'Dental & optical',
      ],
      popular: true,
    },
    {
      id: '4',
      name: 'Platinum Elite',
      provider: 'AXA Insurance',
      monthlyPremium: 899,
      coverageLimit: 'AED 1,000,000',
      inpatientCoverage: 'Unlimited',
      outpatientCoverage: 'Unlimited',
      emergencyCare: '24/7 VIP',
      maternityCare: 'Full coverage + complications',
      dentalOptical: 'AED 5,000',
      pharmacyCoverage: '100%',
      features: [
        'Unlimited inpatient & outpatient',
        'VIP emergency services',
        'Full diagnostics & imaging',
        'Unlimited specialist access',
        'Pharmacy coverage (100%)',
        'Comprehensive maternity',
        'Premium dental & optical',
        'International coverage',
      ],
      popular: false,
    },
    {
      id: '5',
      name: 'Diamond Executive',
      provider: 'Cigna Insurance',
      monthlyPremium: 1299,
      coverageLimit: 'AED 2,000,000',
      inpatientCoverage: 'Unlimited',
      outpatientCoverage: 'Unlimited',
      emergencyCare: '24/7 VIP + Air ambulance',
      maternityCare: 'Full coverage + IVF',
      dentalOptical: 'Unlimited',
      pharmacyCoverage: '100%',
      features: [
        'Comprehensive global coverage',
        'VIP emergency + air ambulance',
        'Premium diagnostics worldwide',
        'Concierge medical service',
        'Full pharmacy coverage',
        'Maternity + fertility treatments',
        'Premium dental, optical & preventive',
        'Wellness & mental health programs',
        'Second medical opinion globally',
      ],
      popular: false,
    },
    {
      id: '6',
      name: 'Family Wellness',
      provider: 'MetLife Insurance',
      monthlyPremium: 750,
      coverageLimit: 'AED 750,000',
      inpatientCoverage: 'Full coverage',
      outpatientCoverage: 'Up to AED 30,000',
      emergencyCare: '24/7 Coverage',
      maternityCare: 'Full coverage',
      dentalOptical: 'AED 3,000',
      pharmacyCoverage: '85%',
      features: [
        'Family-focused coverage',
        'Pediatric care included',
        'Preventive health checkups',
        'Vaccination coverage',
        'Pharmacy coverage (85%)',
        'Maternity & newborn care',
        'Dental & optical for family',
        'Wellness programs',
      ],
      popular: false,
    },
  ];

  const togglePlanSelection = (planId: string) => {
    setSelectedPlans((prev) => {
      if (prev.includes(planId)) {
        return prev.filter((id) => id !== planId);
      }
      if (prev.length < 3) {
        return [...prev, planId];
      }
      return prev;
    });
  };

  const selectedPlanObjects = plans.filter((plan) => selectedPlans.includes(plan.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Health Insurance Plans</h1>
          <p className="text-gray-600">Compare and choose from top insurance providers in UAE</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-center">
          <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-blue-900">
            All plans are approved by Dubai Health Authority (DHA) and include coverage at CeenAiX partner facilities
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              showComparison
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5" />
            {showComparison ? 'Hide Comparison' : 'Compare Plans'}
            {selectedPlans.length > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-sm font-bold">
                {selectedPlans.length}
              </span>
            )}
          </button>
        </div>

        {showComparison && (
          <div className="mb-8 bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4">
              <h2 className="text-2xl font-bold text-center">Plan Comparison</h2>
              <p className="text-center text-sm mt-1">Click "Compare" on any plan card below to add it (up to 3 plans)</p>
            </div>

            {selectedPlans.length === 0 ? (
              <div className="p-12 text-center">
                <ArrowLeftRight className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Selected</h3>
                <p className="text-gray-600">Click the "Compare" button on the plan cards below to start comparing</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Features</th>
                      {selectedPlanObjects.map((plan) => (
                        <th key={plan.id} className="px-6 py-4 text-center min-w-[200px]">
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-gray-900">{plan.name}</span>
                            <span className="text-xs text-gray-600 mt-1">{plan.provider}</span>
                            <button
                              onClick={() => togglePlanSelection(plan.id)}
                              className="mt-2 text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              <span className="text-xs">Remove</span>
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr className="bg-blue-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Monthly Premium</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center">
                          <span className="text-2xl font-bold text-blue-600">AED {plan.monthlyPremium}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Coverage Limit</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.coverageLimit}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Inpatient Coverage</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.inpatientCoverage}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Outpatient Coverage</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.outpatientCoverage}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Emergency Care</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.emergencyCare}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Maternity Care</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.maternityCare}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-900">Dental & Optical</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.dentalOptical}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 font-semibold text-gray-900">Pharmacy Coverage</td>
                      {selectedPlanObjects.map((plan) => (
                        <td key={plan.id} className="px-6 py-4 text-center text-gray-700">
                          {plan.pharmacyCoverage}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlans.includes(plan.id);
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                  plan.popular ? 'ring-2 ring-blue-500' : ''
                } ${isSelected ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-2 text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-600">{plan.provider}</p>
                    </div>
                    <button
                      onClick={() => togglePlanSelection(plan.id)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-green-100 text-green-700 border-2 border-green-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Compare'}
                    </button>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-gray-900">
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
                      {plan.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-sm text-gray-500 ml-7">
                          +{plan.features.length - 5} more benefits
                        </li>
                      )}
                    </ul>
                  </div>

                  <button
                    onClick={() => navigate('/patient/profile')}
                    className={`w-full py-3 font-semibold rounded-xl transition-all shadow-md hover:shadow-lg ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            );
          })}
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
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-cyan-600" />
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
