import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { TermsModal } from '../components/TermsModal';
import { PrivacyModal } from '../components/PrivacyModal';
import { OnboardingCarousel } from '../components/OnboardingCarousel';

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset link sent! Check your email.');
        setEmail('');
      } else if (isSignUp) {
        if (!firstName.trim() || !lastName.trim()) {
          throw new Error('First name and last name are required');
        }
        if (!termsAccepted) {
          throw new Error('You must accept the terms and conditions');
        }
        await signUp(email, password, firstName, lastName, role);
        navigate('/complete-profile');
      } else {
        const userRole = await signIn(email, password);
        const redirectPath = userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string }[] = [
    { value: 'patient', label: 'Patient' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'laboratory', label: 'Laboratory' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 md:p-12 bg-white relative overflow-y-auto order-2 lg:order-1">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/30 pointer-events-none" />

        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tl from-teal-200 to-emerald-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        </div>

        <div className="w-full max-w-md relative z-10 my-8">
          <button
            onClick={() => navigate('/')}
            className="group flex items-center space-x-2 text-gray-500 hover:text-cyan-600 mb-8 transition-all duration-300 transform hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-semibold">Back to Home</span>
          </button>

          <div className="text-center mb-10">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                alt="CeenAiX Logo"
                className="h-16 w-auto drop-shadow-xl transform transition-all duration-500 hover:scale-110 hover:drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent mb-3">
              {isSignUp ? 'Create Account' : isForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base font-medium">
              {isSignUp ? 'Join the future of healthcare' : isForgotPassword ? 'We\'ll send you a reset link' : 'Sign in to your account'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 transform transition-all duration-300 hover:shadow-2xl hover:border-cyan-100">
          {error && (
            <div className="mb-5 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl flex items-start space-x-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl flex items-start space-x-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && !isForgotPassword && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isSignUp && !isForgotPassword && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-3.5 rounded-xl border-2 transition-all duration-300 text-sm font-semibold transform hover:scale-[1.02] ${
                          role === r.value
                            ? 'border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50 text-cyan-700 shadow-lg shadow-cyan-100/50'
                            : 'border-gray-200 bg-gray-50/50 text-gray-700 hover:border-cyan-300 hover:bg-white hover:shadow-md'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-2 focus:ring-cyan-500 transition-all cursor-pointer"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline decoration-cyan-300 underline-offset-2 transition-colors"
                    >
                      Terms and Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyModal(true);
                      }}
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline decoration-cyan-300 underline-offset-2 transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-600 hover:from-cyan-600 hover:via-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3.5 rounded-xl transition-all duration-300 mt-6 transform hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/30 active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing...'
                : isForgotPassword
                ? 'Send Reset Link'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>

          {!isForgotPassword && !isSignUp && (
            <div className="mt-5 text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-semibold underline decoration-cyan-300 underline-offset-2 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-600 text-sm">
              {isForgotPassword ? (
                <>
                  Remember your password?{' '}
                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsSignUp(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-cyan-600 hover:text-cyan-700 font-bold underline decoration-cyan-300 underline-offset-2 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              ) : isSignUp ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-cyan-600 hover:text-cyan-700 font-bold underline decoration-cyan-300 underline-offset-2 transition-colors"
                  >
                    Sign In
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-cyan-600 hover:text-cyan-700 font-bold underline decoration-cyan-300 underline-offset-2 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

          <div className="text-center mt-8">
            <p className="text-gray-400 text-xs font-medium tracking-wide">
              Secure Healthcare Platform with AI-Powered Insights
            </p>
          </div>
        </div>

        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </div>

      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative order-1 lg:order-2">
        <OnboardingCarousel />
      </div>
    </div>
  );
};
