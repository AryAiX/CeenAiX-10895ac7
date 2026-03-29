import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, ShieldCheck } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import {
  getOtpRequestErrorMessage,
  getOtpVerificationErrorMessage,
} from '../../lib/auth-error-messages';
import { getDefaultRouteForRole, useAuth } from '../../lib/auth-context';

export const VerifyOTP = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading, requestOtp, role, verifyOtp } = useAuth();

  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const phone = searchParams.get('phone') ?? '';
  const email = searchParams.get('email') ?? '';
  const type = searchParams.get('type') === 'email' ? 'email' : 'sms';
  const redirectTarget = searchParams.get('redirect') ?? undefined;
  const shouldGoToOnboarding = searchParams.get('signup') === '1';

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(
        shouldGoToOnboarding ? '/auth/onboarding' : redirectTarget ?? getDefaultRouteForRole(role),
        { replace: true }
      );
    }
  }, [
    isAuthenticated,
    isLoading,
    navigate,
    redirectTarget,
    role,
    shouldGoToOnboarding,
  ]);

  const resetFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (!phone && !email) {
      setErrorMessage('We could not identify your verification destination. Please request a new code.');
      return;
    }

    setIsSubmitting(true);

    const verificationResult =
      type === 'sms' && phone
        ? await verifyOtp({
            token: token.trim(),
            phone,
            type: 'sms',
          })
        : email
          ? await verifyOtp({
              token: token.trim(),
              email,
              type: 'email',
            })
          : { error: new Error('We could not identify your verification destination. Please request a new code.') };

    if (verificationResult.error) {
      setErrorMessage(getOtpVerificationErrorMessage(verificationResult.error.message));
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage('Verification successful. Redirecting...');
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    resetFeedback();

    if (!phone) {
      setErrorMessage('Please go back and request a new verification code.');
      return;
    }

    setIsResending(true);

    const { error } = await requestOtp({
      phone,
      shouldCreateUser: shouldGoToOnboarding,
    });

    if (error) {
      setErrorMessage(getOtpRequestErrorMessage(error.message, { isSignUp: shouldGoToOnboarding }));
      setIsResending(false);
      return;
    }

    setSuccessMessage(t('auth.otp.resentOk'));
    setIsResending(false);
  };

  return (
    <AuthShell
      badge={t('auth.otp.badge')}
      title={t('auth.otp.title')}
      description={t('auth.otp.description')}
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('auth.otp.wrongDetails')}</span>
          <Link
            to={shouldGoToOnboarding ? '/auth/register' : '/auth/login'}
            className="font-semibold text-ceenai-blue transition-colors hover:text-ceenai-navy"
          >
            {t('auth.otp.goBack')}
          </Link>
        </div>
      }
    >
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

      <div className="rounded-3xl border border-ceenai-cyan/20 bg-ceenai-cyan/5 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-ceenai-blue" />
          <div className="space-y-1 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">{t('auth.otp.verificationTarget')}</p>
            <p>{phone || email}</p>
            <p>{shouldGoToOnboarding ? t('auth.otp.signupFlow') : t('auth.otp.signinFlow')}</p>
          </div>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">{t('auth.otp.codeLabel')}</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={token}
            onChange={(event) => setToken(event.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.4em] text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
            placeholder="000000"
            autoComplete="one-time-code"
            required
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:border-ceenai-cyan hover:text-ceenai-blue disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>{isResending ? t('auth.otp.resending') : t('auth.otp.resend')}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isSubmitting ? t('auth.otp.verifying') : t('auth.otp.verify')}</span>
          </button>
        </div>
      </form>
    </AuthShell>
  );
};
