import type { ReactNode } from 'react';
import { Sparkles, type LucideIcon } from 'lucide-react';

export interface PhaseStubFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PhaseStubProps {
  icon: LucideIcon;
  phaseLabel: string;
  eyebrow?: string;
  title: string;
  subtitle: string;
  features?: PhaseStubFeature[];
  actions?: ReactNode;
  footer?: ReactNode;
  accent?: 'cyan' | 'violet' | 'emerald' | 'amber' | 'slate';
}

const ACCENT_MAP: Record<
  NonNullable<PhaseStubProps['accent']>,
  { gradient: string; badge: string; ring: string; text: string }
> = {
  cyan: {
    gradient: 'from-cyan-500 via-blue-500 to-blue-600',
    badge: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    ring: 'ring-cyan-100',
    text: 'text-cyan-700',
  },
  violet: {
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-600',
    badge: 'bg-violet-50 text-violet-700 ring-violet-100',
    ring: 'ring-violet-100',
    text: 'text-violet-700',
  },
  emerald: {
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    ring: 'ring-emerald-100',
    text: 'text-emerald-700',
  },
  amber: {
    gradient: 'from-amber-400 via-orange-500 to-rose-500',
    badge: 'bg-amber-50 text-amber-800 ring-amber-100',
    ring: 'ring-amber-100',
    text: 'text-amber-700',
  },
  slate: {
    gradient: 'from-slate-500 via-slate-600 to-slate-700',
    badge: 'bg-slate-100 text-slate-700 ring-slate-200',
    ring: 'ring-slate-200',
    text: 'text-slate-700',
  },
};

export const PhaseStub = ({
  icon: Icon,
  phaseLabel,
  eyebrow,
  title,
  subtitle,
  features,
  actions,
  footer,
  accent = 'cyan',
}: PhaseStubProps) => {
  const palette = ACCENT_MAP[accent];

  return (
    <div className="space-y-6">
      <section
        className={`relative overflow-hidden rounded-3xl border border-white/70 bg-white p-6 shadow-sm ring-1 ${palette.ring} md:p-8`}
      >
        <div
          aria-hidden
          className={`absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br ${palette.gradient} opacity-20 blur-3xl`}
        />
        <div
          aria-hidden
          className={`absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-gradient-to-br ${palette.gradient} opacity-10 blur-3xl`}
        />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${palette.gradient} text-white shadow-md`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ${palette.badge}`}
                >
                  <Sparkles className="h-3 w-3" />
                  {phaseLabel}
                </span>
                {eyebrow ? (
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {eyebrow}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">{subtitle}</p>
            </div>
          </div>

          {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      </section>

      {features && features.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${palette.gradient} text-white shadow-sm`}
                  >
                    <FeatureIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900">{feature.title}</h2>
                    <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}

      {footer ? <div>{footer}</div> : null}
    </div>
  );
};
