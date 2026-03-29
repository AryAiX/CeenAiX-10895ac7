import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { GeometricBackground } from './GeometricBackground';
import { LanguageSwitcher } from './LanguageSwitcher';

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthShell = ({ badge, title, description, children, footer }: AuthShellProps) => {
  const { t } = useTranslation('common');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100/80">
      <GeometricBackground />

      <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex max-w-7xl justify-end lg:mb-0 lg:absolute lg:right-8 lg:top-8 lg:z-20">
          <LanguageSwitcher />
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-ceenai-navy to-ceenai-blue p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/favicon.svg" alt="CeenAiX" className="h-11 w-11 rounded-xl" />
                <div>
                  <span className="block text-2xl font-bold tracking-tight">CeenAiX</span>
                  <span className="block text-[11px] font-medium uppercase tracking-[0.24em] text-white/55">
                    {t('brand.tagline')}
                  </span>
                </div>
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>{badge}</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">{t('auth.shell.headline')}</h1>
                <p className="max-w-xl text-base text-white/80">{t('auth.shell.subhead')}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <HeartPulse className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">{t('auth.shell.cardPatient')}</p>
                <p className="mt-2 text-sm text-white/70">{t('auth.shell.cardPatientDesc')}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <Stethoscope className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">{t('auth.shell.cardDoctor')}</p>
                <p className="mt-2 text-sm text-white/70">{t('auth.shell.cardDoctorDesc')}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <ShieldCheck className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">{t('auth.shell.cardSecure')}</p>
                <p className="mt-2 text-sm text-white/70">{t('auth.shell.cardSecureDesc')}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-ceenai-blue">
                  <Sparkles className="h-4 w-4" />
                  <span>{badge}</span>
                </div>
                <div className="lg:hidden">
                  <LanguageSwitcher />
                </div>
              </div>

              <div className="mb-8 space-y-3">
                <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                <p className="text-base leading-relaxed text-slate-600">{description}</p>
              </div>

              <div className="space-y-6">{children}</div>

              {footer ? <div className="mt-8 border-t border-slate-100 pt-6">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
