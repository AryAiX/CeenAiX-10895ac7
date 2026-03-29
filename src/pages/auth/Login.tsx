import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { KeyRound, LogIn, Smartphone } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { getOtpRequestErrorMessage } from '../../lib/auth-error-messages';
import { getDefaultRouteForRole, useAuth } from '../../lib/auth-context';

type LoginMode = 'password' | 'otp';

export const Login = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    isAuthenticated,
    isLoading,
    role,
    requestOtp,
    signInWithPassword,
    updatePassword,
  } = useAuth();

  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRecoveryMode = useMemo(() => {
    if (searchParams.get('mode') === 'recovery') {
      return true;
    }

    if (typeof window === 'undefined') {
      return false;
    }

    return window.location.hash.includes('type=recovery');
  }, [searchParams]);

  const redirectTarget = searchParams.get('redirect') ?? undefined;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isRecoveryMode) {
      navigate(redirectTarget ?? getDefaultRouteForRole(role), { replace: true });
    }
  }, [isAuthenticated, isLoading, isRecoveryMode, navigate, redirectTarget, role]);

  const resetFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handlePasswordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsSubmitting(true);

    const { error } = await signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(error.message);
    }

    setIsSubmitting(false);
  };

  const handleOtpLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();
    setIsSubmitting(true);

    const normalizedPhone = phone.trim();
    const { error } = await requestOtp({
      phone: normalizedPhone,
      shouldCreateUser: false,
    });

    if (error) {
      setErrorMessage(getOtpRequestErrorMessage(error.message, { isSignUp: false }));
      setIsSubmitting(false);
      return;
    }

    navigate(
      `/auth/verify-otp?phone=${encodeURIComponent(normalizedPhone)}&type=sms${
        redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : ''
      }`
    );
  };

  const handlePasswordRecovery = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetFeedback();

    if (newPassword.length < 8) {
      setErrorMessage('Use at least 8 characters for your new password.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('The new password and confirmation do not match.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await updatePassword(newPassword);

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage('Password updated successfully. Redirecting to your account...');
    setIsSubmitting(false);
    navigate(getDefaultRouteForRole(role), { replace: true });
  };

  return (
    <AuthShell
      badge={t('auth.login.badge')}
      title={isRecoveryMode ? t('auth.login.titleRecovery') : t('auth.login.title')}
      description={
        isRecoveryMode ? t('auth.login.descriptionRecovery') : t('auth.login.description')
      }
      footer={
        <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>{t('auth.login.needAccount')}</span>
          <Link
            to="/auth/register"
            className="font-semibold text-ceenai-blue transition-colors hover:text-ceenai-navy"
          >
            {t('auth.login.createAccount')}
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

      {isRecoveryMode ? (
        <form className="space-y-5" onSubmit={handlePasswordRecovery}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">{t('auth.login.newPassword')}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
              placeholder={t('auth.login.newPasswordPlaceholder')}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">{t('auth.login.confirmNewPassword')}</span>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
              placeholder={t('auth.login.repeatPasswordPlaceholder')}
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            <span>{isSubmitting ? t('auth.login.updatingPassword') : t('auth.login.savePassword')}</span>
          </button>
        </form>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode('password');
              }}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === 'password'
                  ? 'border-ceenai-cyan bg-ceenai-cyan/10 text-ceenai-blue'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-ceenai-cyan/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <LogIn className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{t('auth.login.modePassword')}</p>
                  <p className="text-xs opacity-80">{t('auth.login.modePasswordHint')}</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode('otp');
              }}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                mode === 'otp'
                  ? 'border-ceenai-cyan bg-ceenai-cyan/10 text-ceenai-blue'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-ceenai-cyan/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5" />
                <div>
                  <p className="font-semibold">{t('auth.login.modeOtp')}</p>
                  <p className="text-xs opacity-80">{t('auth.login.modeOtpHint')}</p>
                </div>
              </div>
            </button>
          </div>

          {mode === 'password' ? (
            <form className="space-y-5" onSubmit={handlePasswordLogin}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t('auth.login.email')}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t('auth.login.password')}</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">{t('auth.login.passwordHint')}</span>
                <Link
                  to="/auth/forgot-password"
                  className="font-semibold text-ceenai-blue transition-colors hover:text-ceenai-navy"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-4 w-4" />
                <span>{isSubmitting ? t('auth.login.signingIn') : t('auth.login.signIn')}</span>
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleOtpLogin}>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">{t('auth.login.mobile')}</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:ring-4 focus:ring-ceenai-cyan/10"
                  placeholder="+971 50 123 4567"
                  autoComplete="tel"
                  required
                />
              </label>

              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {t('auth.login.otpHint')}
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 font-semibold text-white shadow-lg transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Smartphone className="h-4 w-4" />
                <span>{isSubmitting ? t('auth.login.sendingCode') : t('auth.login.sendCode')}</span>
              </button>
            </form>
          )}
        </>
      )}
    </AuthShell>
  );
};
