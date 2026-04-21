import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  contentWidthClass?: string;
}

export const AuthShell = ({
  badge,
  title,
  description,
  children,
  footer,
  contentWidthClass = 'max-w-md',
}: AuthShellProps) => {
  const { t } = useTranslation('common');

  return (
    <div className="relative min-h-screen bg-slate-50 lg:flex">
      <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6 lg:end-8 lg:top-8">
        <LanguageSwitcher />
      </div>

      <div className="relative hidden w-80 shrink-0 overflow-hidden lg:flex lg:w-[45%]">
        <img
          src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1400"
          alt="Healthcare"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-cyan-900/75 to-blue-900/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div
          className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl"
          style={{ animationDelay: '3s' }}
        />

        <div className="relative z-10 flex h-full w-full flex-col justify-between p-8">
          <div className="relative">
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 object-contain" />
            <div>
              <div className="text-lg font-bold text-white">CeenAiX</div>
              <div className="text-xs text-cyan-200">{badge}</div>
            </div>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold leading-tight text-white">{t('auth.shell.headline')}</h1>
              <p className="mt-3 text-sm text-slate-300">{t('auth.shell.subhead')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                  <HeartPulse className="h-3.5 w-3.5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardPatient')}</p>
                  <p className="mt-1 text-sm text-slate-300">{t('auth.shell.cardPatientDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
                  <Stethoscope className="h-3.5 w-3.5 text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardDoctor')}</p>
                  <p className="mt-1 text-sm text-slate-300">{t('auth.shell.cardDoctorDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardSecure')}</p>
                  <p className="mt-1 text-sm text-slate-300">{t('auth.shell.cardSecureDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="relative text-xs text-slate-400">© 2026 CeenAiX Healthcare Technologies, Dubai, UAE</div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-8">
        <div className={`w-full ${contentWidthClass}`}>
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 object-contain" />
              <div className="text-start">
                <div className="text-xl font-bold text-slate-900">CeenAiX</div>
                <div className="text-xs text-slate-500">{badge}</div>
              </div>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
            <div className="mb-8 space-y-2">
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">{title}</h2>
              <p className="text-sm leading-6 text-slate-600">{description}</p>
            </div>

            <div className="space-y-6">{children}</div>

            {footer ? <div className="mt-8 border-t border-slate-200 pt-6">{footer}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
};
