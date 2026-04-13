import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Activity, HeartPulse, ShieldCheck, Stethoscope } from 'lucide-react';
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

      <div className="hidden w-80 shrink-0 flex-col justify-between bg-slate-900 p-8 lg:flex">
        <div>
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-white">CeenAiX</div>
              <div className="text-xs text-teal-400">{badge}</div>
            </div>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold leading-tight text-white">{t('auth.shell.headline')}</h1>
              <p className="mt-3 text-sm text-slate-400">{t('auth.shell.subhead')}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600">
                  <HeartPulse className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardPatient')}</p>
                  <p className="mt-1 text-sm text-slate-400">{t('auth.shell.cardPatientDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600">
                  <Stethoscope className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardDoctor')}</p>
                  <p className="mt-1 text-sm text-slate-400">{t('auth.shell.cardDoctorDesc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600">
                  <ShieldCheck className="h-3 w-3 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t('auth.shell.cardSecure')}</p>
                  <p className="mt-1 text-sm text-slate-400">{t('auth.shell.cardSecureDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500">© 2026 CeenAiX Healthcare Technologies, Dubai, UAE</div>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className={`w-full ${contentWidthClass}`}>
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="text-start">
                <div className="text-xl font-bold text-slate-900">CeenAiX</div>
                <div className="text-xs text-slate-500">{badge}</div>
              </div>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
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
