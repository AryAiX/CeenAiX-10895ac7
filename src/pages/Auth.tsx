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
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <OnboardingCarousel />
      </div>

      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center bg-white relative overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-cyan-500 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-blue-400 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="w-full max-w-md relative z-10 px-6 py-8 animate-scale-in">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-300 mb-8 shadow-lg hover:shadow-xl border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="bg-white rounded-3xl shadow-2xl border border-cyan-100/50 overflow-hidden backdrop-blur-xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-white pointer-events-none"></div>

            <div className="relative p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 mb-6 shadow-lg animate-bounce-slow">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {isSignUp ? 'Create Account' : isForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </h1>
              <p className="text-gray-600 text-sm">
                {isSignUp ? 'Join CeenAiX today and experience healthcare reimagined' : isForgotPassword ? 'We\'ll send you a reset link' : 'Sign in to continue your health journey'}
              </p>
            </div>
            {error && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start space-x-3 animate-slide-down">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 font-medium">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && !isForgotPassword && (
                <div className="animate-slide-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder:text-gray-400 hover:border-cyan-300"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white transition-all duration-300 text-gray-900 placeholder:text-gray-400 hover:border-cyan-300"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="animate-slide-in" style={{ animationDelay: '0.2s' }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 focus:bg-white transition-all duration-300 text-gray-900 hover:border-cyan-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors duration-200"
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
                  <div className="animate-slide-in" style={{ animationDelay: '0.3s' }}>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {roles.map((r, idx) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                            role === r.value
                              ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-200'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-gray-200 hover:border-cyan-300'
                          }`}
                          style={{ animationDelay: `${0.4 + idx * 0.05}s` }}
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
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 rounded-2xl transition-all duration-300 mt-6 shadow-lg shadow-cyan-200 hover:shadow-xl hover:shadow-cyan-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {loading
                    ? 'Processing...'
                    : isForgotPassword
                    ? 'Send Reset Link'
                    : isSignUp
                    ? 'Create Account'
                    : 'Sign In'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {isSignUp && !isForgotPassword && (
                <div className="flex items-start gap-3 pt-2 animate-slide-in" style={{ animationDelay: '0.5s' }}>
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 text-cyan-500 border-gray-300 rounded focus:ring-2 focus:ring-cyan-400 transition-all cursor-pointer"
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
                      className="text-cyan-600 hover:text-cyan-700 font-semibold underline underline-offset-2 transition-colors"
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
                  className="text-cyan-600 hover:text-cyan-700 font-medium transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-200">
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
                    className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors"
                  >
                    Sign in
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
                    className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors"
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
                    className="text-cyan-600 hover:text-cyan-700 font-bold transition-colors"
                  >
                    Sign up
                  </button>
                </>
              )}
            </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-cyan-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setShowTermsModal(true);
              }}
            >
              Terms & Conditions
            </button>
            <span className="mx-2 text-gray-300">•</span>
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-cyan-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                setShowPrivacyModal(true);
              }}
            >
              Privacy Policy
            </button>
          </div>

          <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
          <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        </div>
      </div>
    </div>
  );
};
