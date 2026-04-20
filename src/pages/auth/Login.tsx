import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  FlaskConical,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Pill,
  Shield,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
} from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { getOtpRequestErrorMessage } from '../../lib/auth-error-messages';
import { getDefaultRouteForRole, useAuth } from '../../lib/auth-context';

type LoginMode = 'password' | 'otp';
type LoginRole = 'patient' | 'doctor' | 'pharmacy' | 'lab' | 'insurance' | 'admin';

interface RolePreset {
  title: string;
  description: string;
  icon: typeof UserRound;
  iconClass: string;
  containerClass: string;
  demoEmail: string;
  demoPassword: string;
}

const getRolePresets = (t: (key: string) => string): Record<LoginRole, RolePreset> => ({
  patient: {
    title: t('auth.login.rolePatientTitle'),
    description: t('auth.login.rolePatientDesc'),
    icon: UserRound,
    iconClass: 'text-cyan-700',
    containerClass: 'border-cyan-200 bg-cyan-50',
    demoEmail: 'patient1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
  doctor: {
    title: t('auth.login.roleDoctorTitle'),
    description: t('auth.login.roleDoctorDesc'),
    icon: Stethoscope,
    iconClass: 'text-blue-700',
    containerClass: 'border-blue-200 bg-blue-50',
    demoEmail: 'doctor1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
  pharmacy: {
    title: t('auth.login.rolePharmacyTitle'),
    description: t('auth.login.rolePharmacyDesc'),
    icon: Pill,
    iconClass: 'text-emerald-700',
    containerClass: 'border-emerald-200 bg-emerald-50',
    demoEmail: 'pharmacy1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
  lab: {
    title: t('auth.login.roleLabTitle'),
    description: t('auth.login.roleLabDesc'),
    icon: FlaskConical,
    iconClass: 'text-teal-700',
    containerClass: 'border-teal-200 bg-teal-50',
    demoEmail: 'lab1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
  insurance: {
    title: t('auth.login.roleInsuranceTitle'),
    description: t('auth.login.roleInsuranceDesc'),
    icon: Shield,
    iconClass: 'text-violet-700',
    containerClass: 'border-violet-200 bg-violet-50',
    demoEmail: 'insurance1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
  admin: {
    title: t('auth.login.roleAdminTitle'),
    description: t('auth.login.roleAdminDesc'),
    icon: Building2,
    iconClass: 'text-slate-700',
    containerClass: 'border-slate-200 bg-slate-100',
    demoEmail: 'admin1@aryaix.com',
    demoPassword: 'P@ssw0rd!',
  },
});

const isLoginRole = (value: string | null): value is LoginRole =>
  value === 'patient' ||
  value === 'doctor' ||
  value === 'pharmacy' ||
  value === 'lab' ||
  value === 'insurance' ||
  value === 'admin';

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

  const rolePresets = useMemo(() => getRolePresets(t), [t]);
  const requestedRole = searchParams.get('role');
  const selectedRole: LoginRole | null = isLoginRole(requestedRole) ? requestedRole : null;
  const rolePreset = selectedRole ? rolePresets[selectedRole] : null;

  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState(rolePreset?.demoEmail ?? '');
  const [password, setPassword] = useState(rolePreset?.demoPassword ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (rolePreset) {
      setEmail((current) => (current ? current : rolePreset.demoEmail));
      setPassword((current) => (current ? current : rolePreset.demoPassword));
    }
  }, [rolePreset]);

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

  const RoleIcon = rolePreset?.icon ?? UserRound;

  const shellTitle = isRecoveryMode
    ? t('auth.login.titleRecovery')
    : rolePreset
      ? t('auth.login.signIn')
      : t('auth.login.title');

  const shellDescription = isRecoveryMode
    ? t('auth.login.descriptionRecovery')
    : rolePreset
      ? t('auth.login.demoCredsLead')
      : t('auth.login.description');

  return (
    <AuthShell
      badge={t('auth.login.badge')}
      title={shellTitle}
      description={shellDescription}
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

      {!isRecoveryMode && rolePreset ? (
        <>
          <Link
            to="/auth/portal-access?intent=login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t('auth.login.backToRoleSelection')}</span>
          </Link>

          <div
            className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${rolePreset.containerClass}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ${rolePreset.iconClass}`}
            >
              <RoleIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${rolePreset.iconClass}`}>
                {rolePreset.title}
              </p>
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
      ) : mode === 'password' ? (
        <form className="space-y-5" onSubmit={handlePasswordLogin}>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">{t('auth.login.email')}</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
                placeholder={t('auth.login.emailPlaceholder')}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">{t('auth.login.password')}</label>
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
            <button
              type="button"
              onClick={() => {
                resetFeedback();
                setMode('otp');
              }}
              className="inline-flex items-center gap-2 text-slate-500 transition-colors hover:text-cyan-600"
            >
              <Smartphone className="h-4 w-4" />
              <span>{t('auth.login.switchToOtp')}</span>
            </button>
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
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>{t('auth.login.signingIn')}</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>
                  {rolePreset
                    ? t('auth.login.signInAs').replace('{role}', rolePreset.title)
                    : t('auth.login.signIn')}
                </span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </>
            )}
          </button>

          {rolePreset ? (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">{t('auth.login.demoMode')}:</span>{' '}
              {t('auth.login.demoModeBody').replace('{role}', rolePreset.title)}
            </div>
          ) : null}
        </form>
      ) : (
        <form className="space-y-5" onSubmit={handleOtpLogin}>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">{t('auth.login.mobile')}</label>
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

          <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {t('auth.login.otpHint')}
          </p>

          <button
            type="button"
            onClick={() => {
              resetFeedback();
              setMode('password');
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-cyan-600"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t('auth.login.switchToPassword')}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl hover:shadow-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
          >
            <Smartphone className="h-4 w-4" />
            <span>{isSubmitting ? t('auth.login.sendingCode') : t('auth.login.sendCode')}</span>
          </button>
        </form>
      )}
    </AuthShell>
  );
};
