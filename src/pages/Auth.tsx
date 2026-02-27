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
        if (!firstName.trim()) {
          throw new Error('Full name is required');
        }
        if (!termsAccepted) {
          throw new Error('You must accept the terms and conditions');
        }
        const nameParts = firstName.trim().split(' ');
        const fName = nameParts[0];
        const lName = nameParts.slice(1).join(' ') || nameParts[0];
        await signUp(email, password, fName, lName, role);
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
    <div className="min-h-screen flex overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative order-1">
        <OnboardingCarousel />
      </div>

      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 relative overflow-y-auto order-2">
        <div className="w-full max-w-md relative z-10 my-8 bg-gradient-to-br from-amber-50/80 via-orange-50/70 to-yellow-50/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 sm:p-10 border border-white/60">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 hover:bg-white rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 mb-8 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>CeenAiX</span>
          </button>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create an account' : isForgotPassword ? 'Reset Password' : 'Welcome back'}
            </h1>
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Sign up and get 30 day free trial' : isForgotPassword ? 'We\'ll send you a reset link' : 'Sign in to continue to your account'}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-lg border border-white/80">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Amélie Laurent"
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="amelielaurent7622@gmail.com"
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••••••••"
                    className="w-full pl-4 pr-12 py-3 bg-white/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 text-gray-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
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
                {lastName && (
                  <input type="hidden" value={lastName} />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          role === r.value
                            ? 'bg-yellow-400 text-gray-900 shadow-md'
                            : 'bg-white/70 text-gray-700 hover:bg-white border border-gray-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 disabled:from-gray-300 disabled:to-gray-400 text-gray-900 font-bold py-3.5 rounded-full transition-all duration-300 mt-6 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {loading
                ? 'Processing...'
                : isForgotPassword
                ? 'Send Reset Link'
                : isSignUp
                ? 'Submit'
                : 'Sign In'}
            </button>

            {isSignUp && !isForgotPassword && (
              <div className="flex items-start gap-3 pt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-2 focus:ring-yellow-400 transition-all cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                    className="text-gray-900 hover:text-gray-700 font-medium underline underline-offset-2 transition-colors"
                  >
                    Terms & Conditions
                  </button>
                </label>
              </div>
            )}
          </form>

          {!isForgotPassword && !isSignUp && (
            <div className="text-center text-sm text-gray-600 mt-4">
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                className="hover:text-gray-900 transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="text-center text-sm text-gray-600 mt-6">
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
                  className="text-gray-900 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : isSignUp ? (
              <>
                Have any account?{' '}
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-gray-900 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Sign in
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
                  className="text-gray-900 hover:text-gray-700 font-semibold underline underline-offset-2 transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

          <div className="text-center mt-8">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors underline underline-offset-2"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
            >
              Terms & Conditions
            </button>
          </div>
        </div>

        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </div>
    </div>
  );
};
