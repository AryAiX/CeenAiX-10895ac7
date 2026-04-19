import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { getOtpRequestErrorMessage } from '../../lib/auth-error-messages';
import { getDefaultRouteForRole, useAuth } from '../../lib/auth-context';

type LoginMode = 'password' | 'otp';
type LoginRole = 'patient' | 'doctor';

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
  const requestedRole = searchParams.get('role');
  const selectedRole: LoginRole | null =
    requestedRole === 'doctor' || requestedRole === 'patient' ? requestedRole : null;
  const selectedRoleTitle =
    selectedRole === 'doctor' ? t('auth.login.roleDoctorTitle') : t('auth.login.rolePatientTitle');
  const SelectedRoleIcon = selectedRole === 'doctor' ? Stethoscope : UserRound;

  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      title={
        isRecoveryMode
          ? t('auth.login.titleRecovery')
          : selectedRole
            ? t('auth.login.signIn')
            : t('auth.login.title')
      }
      description={
        isRecoveryMode
          ? t('auth.login.descriptionRecovery')
          : selectedRole
            ? t('auth.login.selectedRoleLead')
            : t('auth.login.description')
      }
      footer={
        <div className="space-y-5">
          <div className="flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{t('auth.login.needAccount')}</span>
            <Link
              to={selectedRole ? `/auth/register?role=${selectedRole}` : '/auth/register'}
              className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700"
            >
              {t('auth.login.createAccount')}
            </Link>
          </div>
          {!isRecoveryMode ? (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span>{t('auth.login.trustDha')}</span>
              </div>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-500" />
                <span>{t('auth.login.trustNabidh')}</span>
              </div>
              <span className="h-4 w-px bg-slate-200" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-blue-500" />
                <span>{t('auth.login.trustSsl')}</span>
              </div>
            </div>
          ) : null}
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

      {!isRecoveryMode && selectedRole ? (
        <>
          <Link
            to="/auth/portal-access?intent=login"
            className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t('auth.login.backToRoleSelection')}</span>
          </Link>

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
              <SelectedRoleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{selectedRoleTitle}</p>
              <p className="text-xs text-slate-500">{t('auth.login.roleAccessBadge')}</p>
            </div>
          </div>
        </>
      ) : null}

      {isRecoveryMode ? (
        <form className="space-y-5" onSubmit={handlePasswordRecovery}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">{t('auth.login.newPassword')}</span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
              placeholder={t('auth.login.repeatPasswordPlaceholder')}
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
              className={`rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                mode === 'password'
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <LogIn className="h-5 w-5" />
                </div>
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
              className={`rounded-2xl border-2 px-5 py-4 text-left transition-all duration-200 ${
                mode === 'otp'
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm shadow-cyan-500/20'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{t('auth.login.modeOtp')}</p>
                  <p className="text-xs opacity-80">{t('auth.login.modeOtpHint')}</p>
                </div>
              </div>
            </button>
          </div>

          {mode === 'password' ? (
            <form className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5" onSubmit={handlePasswordLogin}>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">{t('auth.login.emailShort')}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">{t('auth.login.passwordShort')}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-10 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                    placeholder={t('auth.login.passwordPlaceholder')}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-slate-500">{t('auth.login.passwordHint')}</span>
                <Link
                  to="/auth/forgot-password"
                  className="font-semibold text-cyan-600 transition-colors hover:text-cyan-700"
                >
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                <LogIn className="h-4 w-4" />
                <span>{isSubmitting ? t('auth.login.signingIn') : t('auth.login.signIn')}</span>
              </button>
            </form>
          ) : (
            <form className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5" onSubmit={handleOtpLogin}>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-600">{t('auth.login.mobileShort')}</label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                    placeholder="+971 50 123 4567"
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {t('auth.login.otpHint')}
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
