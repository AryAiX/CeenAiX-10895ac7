import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';
import { Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
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
    <div className="min-h-screen bg-white flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5">
        <OnboardingCarousel />
      </div>

      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-gradient-to-br from-white via-ceenai-cyan/5 to-ceenai-blue/5 relative overflow-y-auto">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-ceenai-cyan/10 to-ceenai-blue/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-tl from-ceenai-blue/10 to-ceenai-cyan/10 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10 my-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                alt="CeenAiX Logo"
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
              {isSignUp ? 'Create Account' : isForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isSignUp ? 'Join CeenAiX today' : isForgotPassword ? 'We\'ll send you a reset link' : 'Sign in to continue'}
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-ceenai-cyan/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && !isForgotPassword && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ceenai-cyan"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm ${
                          role === r.value
                            ? 'border-ceenai-cyan bg-ceenai-cyan/10 font-medium text-ceenai-blue-dark'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-ceenai-cyan/40'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-ceenai-blue border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700">
                    I accept the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTermsModal(true);
                      }}
                      className="text-ceenai-blue hover:text-ceenai-blue-dark font-medium underline"
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
                      className="text-ceenai-blue hover:text-ceenai-blue-dark font-medium underline"
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
              className="w-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
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
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setSuccess('');
                }}
                className="text-sm text-ceenai-blue hover:text-ceenai-blue-dark"
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
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
                    className="text-ceenai-blue hover:text-ceenai-blue-dark font-medium"
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
                    className="text-ceenai-blue hover:text-ceenai-blue-dark font-medium"
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
                    className="text-ceenai-blue hover:text-ceenai-blue-dark font-medium"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            Secure healthcare platform with AI-powered insights
          </p>
        </div>

        <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
        <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
      </div>
    </div>
  );
};
