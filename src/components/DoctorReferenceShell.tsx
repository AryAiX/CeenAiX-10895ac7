import type { ReactNode } from 'react';
import {
  Banknote,
  Bell,
  CalendarDays,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Pill,
  Search,
  Settings,
  UserCircle2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

type BadgeTone = 'red' | 'amber' | 'blue' | 'teal';

interface DoctorReferenceNavItem {
  id?: string;
  href?: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeTone?: BadgeTone;
  disabled?: boolean;
  action?: () => void;
}

interface DoctorReferenceStats {
  todayAppointments?: number;
  completedTodayAppointments?: number;
  criticalAlerts?: number;
}

interface DoctorReferenceShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  activeTab?: string;
  clinicNav?: DoctorReferenceNavItem[];
  analyticsNav?: DoctorReferenceNavItem[];
  accountNav?: DoctorReferenceNavItem[];
  stats?: DoctorReferenceStats;
  rightActions?: ReactNode;
}

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'DR';

const badgeClassName = (tone: BadgeTone | undefined) => {
  switch (tone) {
    case 'red':
      return 'bg-red-500 text-white';
    case 'amber':
      return 'bg-amber-500 text-white';
    case 'blue':
      return 'bg-blue-500 text-white';
    case 'teal':
      return 'bg-teal-500 text-white';
    default:
      return 'bg-white/10 text-slate-200';
  }
};

const defaultClinicNav: DoctorReferenceNavItem[] = [
  { id: 'dashboard', href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', href: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'patients', href: '/doctor/patients', label: 'Patient Records', icon: Users },
  { id: 'prescriptions', href: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { id: 'labs', href: '/doctor/lab-orders', label: 'Lab Referrals', icon: FlaskConical },
  { id: 'messages', href: '/doctor/messages', label: 'Messages', icon: MessageSquare },
  { id: 'notifications', href: '/doctor/notifications', label: 'Notifications', icon: Bell },
];

const defaultAnalyticsNav: DoctorReferenceNavItem[] = [
  { id: 'earnings', href: '/doctor/earnings', label: 'Earnings', icon: Banknote },
];

const defaultAccountNav: DoctorReferenceNavItem[] = [
  { id: 'profile', href: '/doctor/profile', label: 'My Profile', icon: UserCircle2 },
];

export const DoctorReferenceShell = ({
  children,
  title = 'Doctor Portal',
  subtitle = 'Clinical workflow workspace',
  activeTab,
  clinicNav = defaultClinicNav,
  analyticsNav = defaultAnalyticsNav,
  accountNav = defaultAccountNav,
  stats,
  rightActions,
}: DoctorReferenceShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, user, signOut } = useAuth();

  const displayName =
    profile?.full_name?.trim() || profile?.first_name?.trim() || user?.email?.split('@')[0] || 'Doctor';
  const initials = getInitials(displayName);
  const todayAppointments = stats?.todayAppointments ?? 0;
  const completedTodayAppointments = stats?.completedTodayAppointments ?? 0;
  const criticalAlerts = stats?.criticalAlerts ?? 0;

  const renderNavItem = (item: DoctorReferenceNavItem, key: string) => {
    const Icon = item.icon;
    const pathMatch = item.href
      ? location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
      : false;
    const tabMatch = Boolean(activeTab && item.id && item.id === activeTab);
    const isActive = pathMatch || tabMatch;

    return (
      <button
        key={key}
        type="button"
        disabled={item.disabled}
        onClick={() => {
          if (item.disabled) {
            return;
          }
          item.action?.();
          if (item.href) {
            navigate(item.href);
          }
        }}
        className={`flex w-full items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
          item.disabled
            ? 'cursor-not-allowed text-slate-500'
            : isActive
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-700/30'
              : 'text-slate-300 hover:bg-white/10 hover:text-white'
        }`}
      >
        <span className="flex min-w-0 items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{item.label}</span>
        </span>
        {item.badge ? (
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${badgeClassName(item.badgeTone)}`}>
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <aside className="w-[260px] shrink-0 bg-[#0A1628] text-slate-200 shadow-2xl">
        <div className="border-b border-white/10 px-6 py-5">
          <button type="button" onClick={() => navigate('/doctor/dashboard')} className="text-left">
            <p className="text-lg font-bold text-white">CeenAiX</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">Doctor Portal</p>
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-cyan-200">Doctor</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="space-y-3 px-3 pb-4">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Clinic</p>
            {clinicNav.map((item, index) => renderNavItem(item, `clinic-${item.id ?? index}`))}
          </div>
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Analytics
            </p>
            {analyticsNav.map((item, index) => renderNavItem(item, `analytics-${item.id ?? index}`))}
          </div>
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Account</p>
            {accountNav.map((item, index) => renderNavItem(item, `account-${item.id ?? index}`))}
            {renderNavItem(
              { id: 'settings', label: 'Settings', icon: Settings, disabled: true },
              'account-settings'
            )}
          </div>
        </nav>

        <div className="mt-auto border-t border-white/10 px-4 py-4">
          <div className="space-y-2 rounded-xl bg-white/[0.03] p-3 text-xs text-slate-300">
            <div className="flex items-center justify-between">
              <span>Today</span>
              <span className="font-semibold text-cyan-300">{todayAppointments} appts</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Completed</span>
              <span className="font-semibold text-emerald-300">
                {completedTodayAppointments}/{todayAppointments}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Critical alerts</span>
              <span className="font-semibold text-red-300">{criticalAlerts}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-bold text-slate-900">{title}</h1>
              <p className="text-sm text-slate-500">{subtitle}</p>
            </div>
            {rightActions ?? (
              <div className="relative w-full max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  readOnly
                  value=""
                  placeholder="Search patients, records, orders..."
                  className="w-full rounded-xl border border-cyan-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700"
                />
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
