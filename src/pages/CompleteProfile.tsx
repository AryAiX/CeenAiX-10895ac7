import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CreditCard, FileText, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { GeometricBackground } from '../components/GeometricBackground';

export const CompleteProfile: React.FC = () => {
  const [uaeIdNumber, setUaeIdNumber] = useState('');
  const [uaeIdExpiry, setUaeIdExpiry] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [insuranceExpiry, setInsuranceExpiry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'profile' | 'family'>('profile');
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!user) throw new Error('User not authenticated');

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          uae_id_number: uaeIdNumber,
          uae_id_expiry_date: uaeIdExpiry,
          insurance_provider: insuranceProvider || null,
          insurance_policy_number: insurancePolicyNumber || null,
          insurance_expiry_date: insuranceExpiry || null,
          profile_completed: true,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setStep('family');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipFamily = () => {
    const redirectPath = userProfile?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    navigate(redirectPath);
  };

  if (step === 'family') {
    navigate('/link-family');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ceenai-cyan/10 via-white to-ceenai-blue/10 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <GeometricBackground />
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
            Complete Your Profile
          </h1>
          <p className="text-gray-700 mt-2">Please provide your identification and insurance details</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-ceenai-cyan/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* UAE ID Section */}
            <div className="border-b border-gray-200 pb-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-ceenai-cyan" />
                <h2 className="text-lg font-semibold text-gray-900">Emirates ID Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Emirates ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={uaeIdNumber}
                    onChange={(e) => setUaeIdNumber(e.target.value)}
                    placeholder="784-YYYY-NNNNNNN-N"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 784-YYYY-NNNNNNN-N</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Emirates ID Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={uaeIdExpiry}
                      onChange={(e) => setUaeIdExpiry(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-ceenai-cyan" />
                <h2 className="text-lg font-semibold text-gray-900">Insurance Information</h2>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    placeholder="e.g., Daman, AXA, Oman Insurance"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={insurancePolicyNumber}
                    onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                    placeholder="Enter your policy number"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Policy Expiry Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={insuranceExpiry}
                      onChange={(e) => setInsuranceExpiry(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Saving...' : 'Continue to Family Linking'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <p className="text-center text-gray-600 text-xs mt-6">
            Your information is encrypted and stored securely
          </p>
        </div>
      </div>
    </div>
  );
};
