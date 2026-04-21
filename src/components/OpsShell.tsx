import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, LogOut, type LucideIcon } from 'lucide-react';
import { useAuth } from '../lib/auth-context';

export interface OpsShellNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

interface OpsShellProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  navItems: OpsShellNavItem[];
  actions?: ReactNode;
  children: ReactNode;
  accent?: 'slate' | 'emerald' | 'cyan' | 'violet';
}

const ACCENT_BAR: Record<NonNullable<OpsShellProps['accent']>, string> = {
  slate: 'from-slate-600 to-slate-800',
  emerald: 'from-emerald-500 to-teal-600',
  cyan: 'from-cyan-500 to-blue-600',
  violet: 'from-violet-500 to-fuchsia-600',
};

export const OpsShell = ({
  title,
  subtitle,
  eyebrow,
  navItems,
  actions,
  children,
  accent = 'slate',
}: OpsShellProps) => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation('common');
  const isArabic = i18n.language.startsWith('ar');

  const displayName =
    profile?.full_name?.trim() || profile?.first_name?.trim() || user?.email?.split('@')[0] || 'CeenAiX';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
      </div>
      <header className={`bg-gradient-to-r ${ACCENT_BAR[accent]} text-white`}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/90 transition hover:bg-white/20"
                aria-label="Back"
              >
                <ArrowLeft className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
              </button>
              <Link
                to="/"
                className={`inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-2 text-white/90 transition hover:bg-white/20 ${
                  isArabic ? 'flex-row-reverse' : ''
                }`}
                aria-label="Home"
              >
                <img src="/favicon.svg" alt="CeenAiX" className="h-6 w-6 object-contain" />
                <span className="hidden text-xs font-semibold sm:inline">CeenAiX</span>
              </Link>
              <div>
                {eyebrow ? (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/70">
                    {eyebrow}
                  </p>
                ) : null}
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm text-white/80">{subtitle}</p> : null}
              </div>
            </div>
            <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold">{displayName}</p>
                <p className="text-xs text-white/70">{profile?.role ?? '—'}</p>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign out</span>
              </button>
              {actions}
            </div>
          </div>
          <nav className={`-mx-1 flex gap-1 overflow-x-auto ${isArabic ? 'flex-row-reverse' : ''}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.href;
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={() =>
                    `inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'bg-white text-slate-900 shadow'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
};
