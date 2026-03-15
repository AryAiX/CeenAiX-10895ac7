import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthShell } from '../../components/AuthShell';
import { useAuth } from '../../lib/auth-context';

type RegistrationMode = 'email-password' | 'phone-otp';
type RegistrationRole = 'patient' | 'doctor';

export const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, requestOtp, role, signOut, signUpWithPassword } = useAuth();
  const requestedRole = searchParams.get('role');
  const resetRequested = searchParams.get('reset') === '1';
  const safeRequestedRole = requestedRole === 'doctor' || requestedRole === 'patient' ? requestedRole : null;

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<RegistrationMode>('email-password');
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>('patient');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingSession, setIsResettingSession] = useState(false);

  const registerPathWithoutReset = useMemo(() => {
    return safeRequestedRole ? `/auth/register?role=${safeRequestedRole}` : '/auth/register';
  }, [safeRequestedRole]);

  useEffect(() => {
    if (safeRequestedRole) {
      setSelectedRole(safeRequestedRole);
    }
  }, [safeRequestedRole]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (isAuthenticated && resetRequested) {
      let isCancelled = false;

      setIsResettingSession(true);
      void signOut().then(() => {
        if (isCancelled) {
          return;
        }

        setIsResettingSession(false);
        navigate(registerPathWithoutReset, { replace: true });
      });

      return () => {
        isCancelled = true;
      };
    }

    if (isAuthenticated) {
      navigate('/auth/onboarding', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, registerPathWithoutReset, resetRequested, role, signOut]);

  const resetFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const nextStep = () => {
    resetFeedback();

    if (step === 1 && fullName.trim().length < 3) {
      setErrorMessage('Please enter the full name that should appear on the account.');
      return;
    }

    if (step === 2) {
      if (mode === 'email-password') {
        if (!email.trim()) {
          setErrorMessage('Email is required for email and password registration.');
          return;
        }

        if (password.length < 8) {
          setErrorMessage('Choose a password with at least 8 characters.');
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage('Password confirmation does not match.');
          return;
        }
      } else if (!phone.trim()) {
        setErrorMessage('Phone number is required for phone OTP registration.');
        return;
      }

      if (!termsAccepted) {
        setErrorMessage('You must accept the terms to continue.');
        return;
      }
    }

    setStep((current) => Math.min(current + 1, 2));
  };

  const previousStep = () => {
    resetFeedback();
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (step < 2) {
      nextStep();
      return;
    }

    setIsSubmitting(true);

    if (mode === 'email-password') {
      const { error } = await signUpWithPassword({
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
        role: selectedRole,
        fullName: fullName.trim(),
        termsAccepted,
      });

      if (error) {
        setErrorMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(
        'Account created. Check your email to confirm your account, then continue to onboarding.'
      );
      setIsSubmitting(false);
      return;
    }

    const normalizedPhone = phone.trim();
    const { error } = await requestOtp({
      phone: normalizedPhone,
      shouldCreateUser: true,
      data: {
        role: selectedRole,
        full_name: fullName.trim(),
        phone: normalizedPhone,
        terms_accepted: termsAccepted,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    navigate(
      `/auth/verify-otp?phone=${encodeURIComponent(normalizedPhone)}&type=sms&signup=1`
    );
  };

  const stepTitles = ['Choose access method', 'Choose account role', 'Create your credentials'];

  return (
    <AuthShell
      badge="Secure Registration"
      title="Create your CeenAiX account"
      description="Follow the staged sign-up flow for patients and doctors. Choose how you want to authenticate, define your role, and complete the first account setup step."
      footer={
        <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Already have an account?</span>
          <Link
            to="/auth/login"
            className="font-semibold text-ceenai-blue transition-colors hover:text-ceenai-navy"
          >
            Sign in instead
          </Link>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {stepTitles.map((stepTitle, index) => {
          const completed = step > index;
          const active = step === index;

          return (
            <div
              key={stepTitle}
              className={`rounded-2xl border px-4 py-3 transition ${
                completed || active
                  ? 'border-ceenai-cyan bg-ceenai-cyan/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    completed || active
                      ? 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-sm font-semibold text-gray-700">{stepTitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {isResettingSession ? (
        <div className="rounded-2xl border border-ceenai-cyan/20 bg-ceenai-cyan/10 px-4 py-3 text-sm text-ceenai-blue">
          Resetting the current session so you can start a new registration flow.
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {step === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode('email-password');
              }}
              className={`rounded-3xl border p-5 text-left transition ${
                mode === 'email-password'
                  ? 'border-ceenai-cyan bg-ceenai-cyan/10'
                  : 'border-gray-200 hover:border-ceenai-cyan/40'
              }`}
            >
              <ShieldCheck className="h-6 w-6 text-ceenai-blue" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Email and password</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Create your account with your email address and password.
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode('phone-otp');
              }}
              className={`rounded-3xl border p-5 text-left transition ${
                mode === 'phone-otp'
                  ? 'border-ceenai-cyan bg-ceenai-cyan/10'
                  : 'border-gray-200 hover:border-ceenai-cyan/40'
              }`}
            >
              <UserRound className="h-6 w-6 text-ceenai-blue" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Phone OTP</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Ideal for mobile-first registration with a one-time verification code.
              </p>
            </button>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`rounded-3xl border p-5 text-left transition ${
                  selectedRole === 'patient'
                    ? 'border-ceenai-cyan bg-ceenai-cyan/10'
                    : 'border-gray-200 hover:border-ceenai-cyan/40'
                }`}
              >
                <UserRound className="h-6 w-6 text-ceenai-blue" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Patient account</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Access appointments, records, prescriptions, and AI-assisted support.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`rounded-3xl border p-5 text-left transition ${
                  selectedRole === 'doctor'
                    ? 'border-ceenai-cyan bg-ceenai-cyan/10'
                    : 'border-gray-200 hover:border-ceenai-cyan/40'
                }`}
              >
                <Stethoscope className="h-6 w-6 text-ceenai-blue" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">Doctor account</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  Manage patient interactions, appointments, prescriptions, and future schedule flows.
                </p>
              </button>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">Full name</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            {mode === 'email-password' ? (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Mobile number</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Confirm password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder="Repeat the password"
                    autoComplete="new-password"
                    required
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">Mobile number</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                    required
                  />
                </label>

                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  We&apos;ll create the account and send a verification code to this number in the next step.
                </div>
              </>
            )}

            <label className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-ceenai-blue focus:ring-ceenai-cyan"
              />
              <span className="text-sm leading-relaxed text-gray-600">
                I agree to the platform terms and understand that healthcare data is handled according
                to CeenAiX privacy and consent requirements.
              </span>
            </label>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 0 || isSubmitting || isResettingSession}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 transition hover:border-ceenai-cyan hover:text-ceenai-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isResettingSession}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {step < 2
                ? 'Continue'
                : isSubmitting
                  ? 'Processing...'
                  : mode === 'email-password'
                    ? 'Create account'
                    : 'Send verification code'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AuthShell>
  );
};
