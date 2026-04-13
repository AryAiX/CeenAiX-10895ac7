import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  backTo,
  icon,
  actions
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="ceenai-card ceenai-soft-shadow mb-6 rounded-[2rem] border border-white/70 p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          {showBack ? (
            <button
              onClick={handleBack}
              className="group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:bg-slate-50"
              aria-label={t('pageHeader.goBack')}
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-900" />
            </button>
          ) : null}
          <div className="flex min-w-0 items-start gap-4">
            {icon ? (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-500 text-white shadow-lg">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.9rem]">{title}</h1>
              {subtitle ? (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">{subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </div>
  );
};
