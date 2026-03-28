import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthShell } from '../../components/AuthShell';
import { useAuth } from '../../lib/auth-context';

type RegistrationMode = 'email-password' | 'phone-otp';
type RegistrationRole = 'patient' | 'doctor';

export const Register = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isAuthenticated,
    isLoading,
    requestOtp,
    resendSignupConfirmation,
    role,
    signOut,
    signUpWithPassword,
  } = useAuth();
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
  const [duplicateEmailConflict, setDuplicateEmailConflict] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
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
    setDuplicateEmailConflict(false);
  };

  const normalizedEmail = email.trim();

  const handleResendConfirmation = async () => {
    if (!normalizedEmail) {
      setErrorMessage(t('auth.register.errors.resendNeedEmail'));
      return;
    }

    setIsResendingConfirmation(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await resendSignupConfirmation(normalizedEmail);

    if (error) {
      setErrorMessage(error.message);
      setIsResendingConfirmation(false);
      return;
    }

    setSuccessMessage(t('auth.register.resendSuccess'));
    setIsResendingConfirmation(false);
  };

  const nextStep = () => {
    resetFeedback();

    if (step === 1 && fullName.trim().length < 3) {
      setErrorMessage(t('auth.register.errors.fullNameShort'));
      return;
    }

    if (step === 2) {
      if (mode === 'email-password') {
        if (!email.trim()) {
          setErrorMessage(t('auth.register.errors.emailRequired'));
          return;
        }

        if (password.length < 8) {
          setErrorMessage(t('auth.register.errors.passwordShort'));
          return;
        }

        if (password !== confirmPassword) {
          setErrorMessage(t('auth.register.errors.passwordMismatch'));
          return;
        }
      } else if (!phone.trim()) {
        setErrorMessage(t('auth.register.errors.phoneRequired'));
        return;
      }

      if (!termsAccepted) {
        setErrorMessage(t('auth.register.errors.termsRequired'));
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
        email: normalizedEmail,
        password,
        phone: phone.trim() || undefined,
        role: selectedRole,
        fullName: fullName.trim(),
        termsAccepted,
      });

      if (error) {
        if (error.message.trim().toLowerCase().includes('already registered')) {
          setDuplicateEmailConflict(true);
          setErrorMessage(t('auth.register.errors.emailAlreadyRegistered'));
        } else {
          setErrorMessage(error.message);
        }
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(t('auth.register.successAccountCreated'));
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

  const stepTitles = useMemo(
    () => [t('auth.register.step1'), t('auth.register.step2'), t('auth.register.step3')],
    [t]
  );

  return (
    <AuthShell
      badge={t('auth.register.badge')}
      title={t('auth.register.title')}
      description={t('auth.register.description')}
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('auth.register.haveAccount')}</span>
          <Link
            to="/auth/login"
            className="font-semibold text-ceenai-blue transition-colors hover:text-ceenai-navy"
          >
            {t('auth.register.signInInstead')}
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
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    completed || active
                      ? 'bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-sm font-semibold text-slate-700">{stepTitle}</span>
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

      {(successMessage || duplicateEmailConflict) && mode === 'email-password' ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-ceenai-cyan/20 bg-ceenai-cyan/10 px-4 py-3 text-sm text-ceenai-blue">
          <span>{t('auth.register.resendPrompt')}</span>
          <button
            type="button"
            onClick={() => void handleResendConfirmation()}
            disabled={isSubmitting || isResendingConfirmation || !normalizedEmail}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ceenai-blue shadow-sm transition hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isResendingConfirmation ? t('auth.register.resending') : t('auth.register.resendButton')}
          </button>
          <Link
            to="/auth/login"
            className="font-semibold underline underline-offset-2"
          >
            {t('auth.register.signInInstead')}
          </Link>
        </div>
      ) : null}

      {isResettingSession ? (
        <div className="rounded-2xl border border-ceenai-cyan/20 bg-ceenai-cyan/10 px-4 py-3 text-sm text-ceenai-blue">
          {t('auth.register.resettingSession')}
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
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('auth.register.modeEmailTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t('auth.register.modeEmailDesc')}
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
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('auth.register.modePhoneTitle')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                {t('auth.register.modePhoneDesc')}
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
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('auth.register.rolePatientTitle')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {t('auth.register.rolePatientDesc')}
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
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{t('auth.register.roleDoctorTitle')}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {t('auth.register.roleDoctorDesc')}
                </p>
              </button>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-gray-700">{t('auth.register.fullName')}</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                placeholder={t('auth.register.fullNamePlaceholder')}
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
                  <span className="text-sm font-semibold text-gray-700">{t('auth.register.email')}</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder={t('auth.register.emailPlaceholder')}
                    autoComplete="email"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">{t('auth.register.mobile')}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder={t('auth.register.mobilePlaceholder')}
                    autoComplete="tel"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">{t('auth.register.password')}</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder={t('auth.register.passwordPlaceholder')}
                    autoComplete="new-password"
                    required
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">{t('auth.register.confirmPassword')}</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder={t('auth.register.confirmPasswordPlaceholder')}
                    autoComplete="new-password"
                    required
                  />
                </label>
              </>
            ) : (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-gray-700">{t('auth.register.mobile')}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                    placeholder={t('auth.register.mobilePlaceholder')}
                    autoComplete="tel"
                    required
                  />
                </label>

                <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  {t('auth.register.otpNextHint')}
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
                {t('auth.register.termsLabel')}
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
            <span>{t('auth.register.btnBack')}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting || isResettingSession}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {step < 2
                ? t('auth.register.btnContinue')
                : isSubmitting
                  ? t('auth.register.btnProcessing')
                  : mode === 'email-password'
                    ? t('auth.register.btnCreateAccount')
                    : t('auth.register.btnSendCode')}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </AuthShell>
  );
};
