import { type ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  useInsurancePortal,
  type InsuranceClaim,
  type InsurancePortalData,
  type InsurancePreAuthorization,
} from '../../hooks';
import { useAuth } from '../../lib/auth-context';

type BadgeTone = 'red' | 'amber' | 'blue';
type PillTone = 'red' | 'amber' | 'emerald' | 'blue' | 'violet' | 'slate';

interface InsuranceNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  section: 'main' | 'intelligence' | 'admin';
  badge?: number;
  badgeTone?: BadgeTone;
  pulse?: boolean;
}

const formatNumber = (value: number | null | undefined) =>
  typeof value === 'number' ? value.toLocaleString() : '—';

const formatCurrency = (value: number | null | undefined) =>
  typeof value === 'number' ? `AED ${value.toLocaleString()}` : 'AED —';

const titleCase = (value: string) =>
  value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const routeTitles: Record<string, string> = {
  '/insurance/portal': 'Insurance Dashboard',
  '/insurance/dashboard': 'Insurance Dashboard',
  '/insurance/preauth': 'Pre-Authorizations',
  '/insurance/pre-authorizations': 'Pre-Authorizations',
  '/insurance/claims': 'Claims',
  '/insurance/members': 'Members',
  '/insurance/fraud': 'Fraud Detection',
  '/insurance/analytics': 'Risk Analytics',
  '/insurance/risk-analytics': 'Risk Analytics',
  '/insurance/network': 'Network Providers',
  '/insurance/reports': 'Reports',
  '/insurance/settings': 'Settings',
};

const badgeClasses: Record<BadgeTone, string> = {
  red: 'border-red-400/30 bg-red-500/15 text-red-300',
  amber: 'border-amber-400/30 bg-amber-500/15 text-amber-200',
  blue: 'border-blue-400/30 bg-blue-500/15 text-blue-300',
};

const pillClasses: Record<PillTone, string> = {
  red: 'bg-red-50 text-red-700',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  blue: 'bg-blue-50 text-blue-700',
  violet: 'bg-violet-50 text-violet-700',
  slate: 'bg-slate-100 text-slate-600',
};

const statusTone = (status: string): PillTone => {
  if (['overdue', 'denied', 'open', 'high'].includes(status)) return 'red';
  if (['review', 'under_review', 'investigating', 'medium'].includes(status)) return 'amber';
  if (['approved', 'resolved', 'ready'].includes(status)) return 'emerald';
  if (['appealed'].includes(status)) return 'violet';
  if (['submitted', 'routine', 'low'].includes(status)) return 'blue';
  return 'slate';
};

const formatSla = (slaDueAt: string) => {
  const deltaMinutes = Math.round((new Date(slaDueAt).getTime() - Date.now()) / 60_000);
  const absolute = Math.abs(deltaMinutes);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;
  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes} min`;
  return deltaMinutes < 0 ? `${label} overdue` : `${label} remaining`;
};

const StatusPill = ({ children, tone }: { children: ReactNode; tone: PillTone }) => (
  <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${pillClasses[tone]}`}>
    {children}
  </span>
);

const SectionCard = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 px-5 py-4">
      <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p> : null}
    </div>
    <div className="p-5">{children}</div>
  </article>
);

const KpiCard = ({ label, value, helper, tone }: { label: string; value: string | number; helper: string; tone: 'blue' | 'emerald' | 'amber' | 'red' }) => {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  }[tone];

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className={`mb-3 inline-flex rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${toneClass}`}>
        {label}
      </div>
      <div className="font-mono text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{helper}</div>
    </article>
  );
};

const navItemsForData = (data: InsurancePortalData | null): InsuranceNavItem[] => {
  const overduePreAuths = data?.preAuthorizations.filter((item) => item.status === 'overdue').length ?? 0;
  const pendingPreAuths = data?.preAuthorizations.filter((item) => item.status === 'review' || item.status === 'overdue').length ?? 0;
  const openClaims = data?.claims.filter((item) => item.status === 'submitted' || item.status === 'under_review').length ?? 0;
  const openFraud = data?.fraudAlerts.filter((item) => item.status !== 'resolved').length ?? 0;

  return [
    { href: '/insurance/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main', badge: overduePreAuths || undefined, badgeTone: 'red', pulse: overduePreAuths > 0 },
    { href: '/insurance/preauth', label: 'Pre-Authorizations', icon: ClipboardList, section: 'main', badge: pendingPreAuths || undefined, badgeTone: 'amber', pulse: pendingPreAuths > 0 },
    { href: '/insurance/claims', label: 'Claims', icon: FileText, section: 'main', badge: openClaims || undefined, badgeTone: 'blue' },
    { href: '/insurance/members', label: 'Members', icon: Users, section: 'main' },
    { href: '/insurance/fraud', label: 'Fraud Detection', icon: AlertOctagon, section: 'intelligence', badge: openFraud || undefined, badgeTone: 'red', pulse: openFraud > 0 },
    { href: '/insurance/analytics', label: 'Risk Analytics', icon: BarChart3, section: 'intelligence' },
    { href: '/insurance/network', label: 'Network Providers', icon: Building2, section: 'intelligence' },
    { href: '/insurance/reports', label: 'Reports', icon: BookOpen, section: 'admin' },
    { href: '/insurance/settings', label: 'Settings', icon: Settings, section: 'admin' },
  ];
};

const InsuranceShell = ({ data, children }: { data: InsurancePortalData | null; children: ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const currentPath =
    location.pathname === '/insurance/portal'
      ? '/insurance/dashboard'
      : location.pathname === '/insurance/pre-authorizations'
        ? '/insurance/preauth'
        : location.pathname === '/insurance/risk-analytics'
          ? '/insurance/analytics'
          : location.pathname;
  const title = routeTitles[location.pathname] ?? 'Insurance Dashboard';
  const navItems = navItemsForData(data);
  const navSections = [
    { id: 'main', title: 'MAIN', items: navItems.filter((item) => item.section === 'main') },
    { id: 'intelligence', title: 'INTELLIGENCE', items: navItems.filter((item) => item.section === 'intelligence') },
    { id: 'admin', title: 'ADMIN', items: navItems.filter((item) => item.section === 'admin') },
  ];
  const payerName = data?.profile?.displayName ?? data?.organization?.name ?? 'Insurance payer';
  const officerName = data?.profile?.officerName ?? 'Claims officer';
  const officerInitials = officerName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const urgentPreAuth = data?.preAuthorizations.find((item) => item.status === 'overdue') ?? data?.preAuthorizations[0] ?? null;
  const openFraud = data?.fraudAlerts.filter((item) => item.status !== 'resolved').length ?? 0;
  const claimValue = data?.claims.reduce((sum, claim) => sum + claim.amountAed, 0) ?? 0;

  const signOutAndLeave = async () => {
    await signOut();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className={`flex shrink-0 flex-col bg-[#0F2D4A] transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-[260px]'}`}>
        <div className="flex h-16 items-center justify-between border-b border-white/[0.06] px-4">
          {!collapsed ? (
            <div>
              <div className="text-lg font-bold text-white">CeenAiX</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-[#7BAFD4]">Insurance Portal</div>
            </div>
          ) : (
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E3A5F] to-teal-600 text-lg font-bold text-white">
              C
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[#7BAFD4] transition hover:bg-white/10"
            aria-label={collapsed ? 'Expand insurance sidebar' : 'Collapse insurance sidebar'}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!collapsed ? (
          <div className="mx-3 my-3 rounded-xl border border-[#1E3A5F]/80 bg-[#1E3A5F]/60 p-3">
            <div className="mb-2 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-[#1E3A5F] text-sm font-bold text-white">
                {payerName.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold leading-tight text-white">{payerName}</div>
                <div className="text-[10px] text-[#93C5E8]">{data?.organization?.city ?? 'UAE'}</div>
              </div>
            </div>
            <div className="mb-1 text-[9px] text-blue-400">{data?.profile?.regulatorName ?? 'Regulator pending'}</div>
            <div className="mb-1 text-[9px] text-white/40">{formatNumber(data?.profile?.activeMembers)} active members · CeenAiX</div>
            <div className="text-[9px] text-white/45">
              {officerName} · {data?.profile?.officerTitle ?? 'Claims officer'}
            </div>
          </div>
        ) : null}

        <nav className="flex-1 overflow-y-auto py-3">
          {navSections.map((section) => (
            <div key={section.id} className="mb-5">
              {!collapsed ? <div className="mb-1 px-4 font-mono text-[9px] uppercase tracking-[0.18em] text-[#4A7AA8]">{section.title}</div> : null}
              <div className="flex flex-col gap-0.5 px-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = currentPath === item.href;
                  const badgeClass = item.badgeTone ? badgeClasses[item.badgeTone] : '';
                  return (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={`flex h-[39px] items-center rounded-xl border-l-[3px] transition-all duration-150 ${
                        collapsed ? 'justify-center px-0' : 'gap-2.5 px-3'
                      } ${active ? 'border-teal-300 bg-[#1E3A5F]/70' : 'border-transparent hover:bg-white/[0.05]'}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-teal-300' : 'text-[#7BAFD4]'}`} />
                      {!collapsed ? (
                        <>
                          <span className={`flex-1 text-left text-[13px] ${active ? 'font-semibold text-[#E2F0FF]' : 'text-[#93C5E8]'}`}>{item.label}</span>
                          {item.badge ? (
                            <span className={`flex h-[18px] min-w-5 items-center justify-center rounded-full border px-1.5 font-mono text-[10px] font-bold ${badgeClass} ${item.pulse ? 'animate-pulse' : ''}`}>
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {!collapsed ? (
          <div className="mx-3 mb-3 rounded-xl border border-white/[0.05] bg-black/20 p-3">
            <div className="mb-1 font-mono text-[10px] text-[#93C5E8]">{formatCurrency(claimValue)} claims · current seed period</div>
            <div className="mb-1.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-red-300">{openFraud} fraud alerts open</span>
            </div>
            <div className="mb-1.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              <span className="text-[9px] text-amber-200">
                {data?.preAuthorizations.filter((item) => item.status === 'overdue').length ?? 0} pre-auth overdue
              </span>
            </div>
            <div className="text-[9px] text-white/40">
              {data?.preAuthorizations.filter((item) => item.status === 'review' || item.status === 'overdue').length ?? 0} pre-auths pending review
            </div>
          </div>
        ) : null}

        <div className="px-2 pb-3">
          <button
            type="button"
            onClick={() => void signOutAndLeave()}
            className={`flex h-[38px] w-full items-center rounded-xl text-red-300 transition hover:bg-red-500/10 ${collapsed ? 'justify-center' : 'gap-2.5 px-3'}`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed ? <span className="text-[13px]">Sign Out</span> : null}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-slate-200 bg-white px-5">
          <div className="flex min-w-0 shrink-0 items-center gap-3 lg:basis-[280px]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1E3A5F] text-base font-bold text-white">
              {payerName.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[17px] font-bold leading-tight text-slate-900">{title}</div>
              <div className="truncate text-[13px] text-slate-400">
                {payerName} · {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="hidden flex-1 justify-center px-6 xl:flex">
            {urgentPreAuth ? (
              <button
                type="button"
                onClick={() => navigate('/insurance/preauth')}
                className="flex max-w-xl items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 transition hover:bg-red-100"
              >
                <AlertOctagon className="h-[15px] w-[15px] shrink-0 animate-pulse text-red-600" />
                <span className="text-xs font-semibold text-red-600">{urgentPreAuth.status === 'overdue' ? '1 pre-auth SLA OVERDUE' : 'Pre-auth pending'}</span>
                <span className="truncate text-xs text-red-900">
                  — {urgentPreAuth.externalRef} · {urgentPreAuth.procedureName} · {urgentPreAuth.patientName}
                </span>
                <span className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white">Review Now</span>
              </button>
            ) : null}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button className="hidden items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 transition hover:bg-red-100 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-red-600">{openFraud} Fraud Alerts</span>
            </button>
            <button className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 transition hover:bg-slate-200 md:flex">
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">Export</span>
            </button>
            <button className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition hover:bg-slate-200">
              <Bell className="h-4 w-4 text-slate-600" />
              {urgentPreAuth ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /> : null}
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 transition hover:bg-slate-200">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1E3A5F] text-xs font-bold text-white">{officerInitials || 'IO'}</div>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">{children}</div>
        </main>
      </div>
    </div>
  );
};

const PreAuthAlert = ({ item }: { item: InsurancePreAuthorization | null }) => {
  if (!item) return null;

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-600" />
          <div>
            <div className="text-[13px] font-bold uppercase tracking-wide text-red-700">
              {item.status === 'overdue' ? 'Pre-auth SLA breached' : 'Pre-auth requires review'}
            </div>
            <div className="mt-1 text-sm text-red-900">DHA requires response within the configured SLA window for urgent pre-authorizations</div>
            <div className="mt-2 text-xs text-red-800">
              {item.externalRef} · {item.procedureName} — {item.patientName}
            </div>
          </div>
        </div>
        <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Review urgent case</button>
      </div>
    </section>
  );
};

const PreAuthTable = ({ rows }: { rows: InsurancePreAuthorization[] }) => (
  <div className="overflow-hidden rounded-xl border border-slate-100">
    <div className="overflow-x-auto">
      <div className="min-w-[860px] divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-[1.2fr_1.4fr_1fr_90px_120px_110px] items-center gap-4 px-4 py-3 text-sm">
            <div>
              <div className="font-mono text-xs font-bold text-slate-700">{row.externalRef}</div>
              <div className="text-xs text-slate-400">{row.providerName}</div>
            </div>
            <div>
              <div className="font-semibold text-slate-900">{row.procedureName}</div>
              <div className="text-xs text-slate-500">{row.patientName}</div>
            </div>
            <div className="text-xs text-slate-500">{row.clinicianName}</div>
            <StatusPill tone={statusTone(row.priority)}>{titleCase(row.priority)}</StatusPill>
            <div className="font-mono text-sm font-bold text-slate-800">{formatCurrency(row.requestedAmountAed)}</div>
            <div className={row.status === 'overdue' ? 'text-xs font-semibold text-red-700' : 'text-xs text-slate-500'}>{formatSla(row.slaDueAt)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ClaimsList = ({ claims }: { claims: InsuranceClaim[] }) => (
  <div className="overflow-hidden rounded-xl border border-slate-100">
    <div className="divide-y divide-slate-100">
      {claims.map((claim) => (
        <div key={claim.id} className="grid grid-cols-[minmax(0,1fr)_130px_120px] items-center gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-slate-900">{claim.patientName}</div>
            <div className="truncate text-xs text-slate-500">
              {claim.externalRef} · {claim.planName} · {claim.providerName}
            </div>
          </div>
          <div className="font-mono text-sm font-bold text-slate-800">{formatCurrency(claim.amountAed)}</div>
          <StatusPill tone={statusTone(claim.status)}>{titleCase(claim.status)}</StatusPill>
        </div>
      ))}
    </div>
  </div>
);

const ClaimsTodayCard = ({ claims, activeMembers }: { claims: InsuranceClaim[]; activeMembers: number | null | undefined }) => {
  const groups = [
    {
      key: 'approved',
      label: 'Auto-approved',
      count: claims.filter((claim) => claim.status === 'approved').length,
      amount: claims.filter((claim) => claim.status === 'approved').reduce((sum, claim) => sum + claim.amountAed, 0),
      color: '#10b981',
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
    },
    {
      key: 'pending',
      label: 'Pending',
      count: claims.filter((claim) => claim.status === 'submitted' || claim.status === 'under_review').length,
      amount: claims
        .filter((claim) => claim.status === 'submitted' || claim.status === 'under_review')
        .reduce((sum, claim) => sum + claim.amountAed, 0),
      color: '#f59e0b',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
    },
    {
      key: 'denied',
      label: 'Denied',
      count: claims.filter((claim) => claim.status === 'denied').length,
      amount: claims.filter((claim) => claim.status === 'denied').reduce((sum, claim) => sum + claim.amountAed, 0),
      color: '#ef4444',
      text: 'text-red-700',
      bg: 'bg-red-50',
    },
    {
      key: 'appealed',
      label: 'Appealed',
      count: claims.filter((claim) => claim.status === 'appealed').length,
      amount: claims.filter((claim) => claim.status === 'appealed').reduce((sum, claim) => sum + claim.amountAed, 0),
      color: '#8b5cf6',
      text: 'text-violet-700',
      bg: 'bg-violet-50',
    },
  ];
  const totalCount = groups.reduce((sum, group) => sum + group.count, 0);
  const totalAmount = groups.reduce((sum, group) => sum + group.amount, 0);
  const exposurePerMember = activeMembers && activeMembers > 0 ? Math.round(totalAmount / activeMembers) : 0;
  const circumference = 2 * Math.PI * 42;
  let offset = 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold text-slate-900">Claims Today</h2>
          <div className="mt-1 font-mono text-2xl font-bold text-slate-900">{formatCurrency(totalAmount)}</div>
          <div className="text-xs text-slate-400">{formatNumber(totalCount)} claims from insurance_claims</div>
        </div>
        <FileText className="h-5 w-5 text-blue-500" />
      </div>

      <div className="mb-5 flex items-center justify-center">
        <svg width="176" height="176" viewBox="0 0 112 112" role="img" aria-label="Claims status breakdown chart">
          <circle cx="56" cy="56" r="42" fill="none" stroke="#e2e8f0" strokeWidth="14" />
          {groups.map((group) => {
            const ratio = totalAmount > 0 ? group.amount / totalAmount : 0;
            const dash = ratio * circumference;
            const element = (
              <circle
                key={group.key}
                cx="56"
                cy="56"
                r="42"
                fill="none"
                stroke={group.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                transform="rotate(-90 56 56)"
              />
            );
            offset += dash;
            return element;
          })}
          <circle cx="56" cy="56" r="29" fill="#ffffff" />
          <text x="56" y="53" textAnchor="middle" className="fill-slate-900 text-[13px] font-bold">
            {formatNumber(totalCount)}
          </text>
          <text x="56" y="66" textAnchor="middle" className="fill-slate-400 text-[7px]">
            claims
          </text>
        </svg>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div key={group.key} className={`rounded-xl px-3 py-2 ${group.bg}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                <span className={`truncate text-sm font-semibold ${group.text}`}>{group.label}</span>
              </div>
              <div className="text-right">
                <div className={`font-mono text-sm font-bold ${group.text}`}>{formatNumber(group.count)}</div>
                <div className="font-mono text-[11px] text-slate-500">{formatCurrency(group.amount)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Total claim value</span>
          <span className="font-mono font-bold text-slate-800">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Daman exposure per active member</span>
          <span className="font-mono font-bold text-slate-800">{formatCurrency(exposurePerMember)}</span>
        </div>
      </div>
    </div>
  );
};

const useInsurancePageData = () => {
  const query = useInsurancePortal();
  const data = query.data;
  const pendingPreAuths = data?.preAuthorizations.filter((item) => item.status === 'review' || item.status === 'overdue') ?? [];
  const overduePreAuth = pendingPreAuths.find((item) => item.status === 'overdue') ?? pendingPreAuths[0] ?? null;
  const claimTotal = data?.claims.reduce((sum, claim) => sum + claim.amountAed, 0) ?? 0;
  const approvedClaims = data?.claims.filter((claim) => claim.status === 'approved') ?? [];
  const openFraud = data?.fraudAlerts.filter((item) => item.status !== 'resolved') ?? [];

  return {
    ...query,
    data,
    pendingPreAuths,
    overduePreAuth,
    claimTotal,
    approvedClaims,
    openFraud,
  };
};

export const InsurancePortal = () => {
  const { data, loading, pendingPreAuths, overduePreAuth, claimTotal, approvedClaims, openFraud } = useInsurancePageData();

  return (
    <InsuranceShell data={data}>
      <PreAuthAlert item={overduePreAuth} />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Active Members" value={loading ? '...' : formatNumber(data?.profile?.activeMembers ?? data?.members.length)} helper={`${formatNumber(data?.members.length ?? 0)} seeded member records`} tone="blue" />
        <KpiCard label="Pre-Auth Pending" value={loading ? '...' : pendingPreAuths.length} helper={`${data?.preAuthorizations.filter((item) => item.status === 'overdue').length ?? 0} overdue`} tone="amber" />
        <KpiCard label="Claims Value" value={loading ? '...' : formatCurrency(claimTotal)} helper={`${approvedClaims.length} approved claims`} tone="emerald" />
        <KpiCard label="Fraud Alerts" value={loading ? '...' : openFraud.length} helper="Open fraud_alerts records" tone="red" />
      </section>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <SectionCard title="Urgent Pre-Authorization Queue" subtitle="DHA SLA monitored queue">
            <PreAuthTable rows={pendingPreAuths} />
          </SectionCard>
        </div>
        <div className="space-y-5 xl:col-span-2">
          <ClaimsTodayCard claims={data?.claims ?? []} activeMembers={data?.profile?.activeMembers} />
          <SectionCard title="AI Risk Insights" subtitle="Fraud alert records from Supabase">
            <div className="space-y-3">
              {(data?.fraudAlerts ?? []).slice(0, 3).map((alert) => (
                <div key={alert.id} className="rounded-xl border border-red-100 bg-red-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-700">{alert.severity.toUpperCase()}</span>
                    <span className="font-mono text-xs text-red-600">{alert.score}%</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900">{alert.subjectName}</div>
                  <div className="mt-1 text-xs text-slate-500">{alert.reason}</div>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Recent Claims">
            <ClaimsList claims={data?.claims ?? []} />
          </SectionCard>
        </div>
      </section>
    </InsuranceShell>
  );
};

export const InsurancePreAuthorizations = () => {
  const { data, overduePreAuth } = useInsurancePageData();
  return (
    <InsuranceShell data={data}>
      <PreAuthAlert item={overduePreAuth} />
      <SectionCard title="Pre-Authorizations" subtitle="Review urgent, high, and routine authorization requests">
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-400" placeholder="Search request, member, provider..." />
          </div>
          <button className="rounded-xl bg-[#1E3A5F] px-4 py-2.5 text-sm font-semibold text-white">Run AI triage</button>
        </div>
        <PreAuthTable rows={data?.preAuthorizations ?? []} />
      </SectionCard>
    </InsuranceShell>
  );
};

export const InsuranceClaims = () => {
  const { data, loading } = useInsurancePageData();
  const submitted = data?.claims.filter((claim) => claim.status === 'submitted').length ?? 0;
  const review = data?.claims.filter((claim) => claim.status === 'under_review').length ?? 0;
  const approved = data?.claims.filter((claim) => claim.status === 'approved').length ?? 0;

  return (
    <InsuranceShell data={data}>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Submitted" value={loading ? '...' : submitted} helper="Awaiting adjudication" tone="blue" />
        <KpiCard label="Under Review" value={loading ? '...' : review} helper="Clinical review needed" tone="amber" />
        <KpiCard label="Approved" value={loading ? '...' : approved} helper="Current seed period" tone="emerald" />
      </section>
      <SectionCard title="Claims Worklist" subtitle="Claims oversight and payment decisions">
        <ClaimsList claims={data?.claims ?? []} />
      </SectionCard>
    </InsuranceShell>
  );
};

export const InsuranceMembers = () => {
  const { data } = useInsurancePageData();
  return (
    <InsuranceShell data={data}>
      <SectionCard title="Members" subtitle="Active plan members and utilization risk">
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {(data?.members ?? []).map((member) => (
            <div key={member.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{member.patientName}</div>
                  <div className="text-xs text-slate-500">
                    {member.externalMemberId} · {member.planName}
                  </div>
                </div>
                <StatusPill tone={statusTone(member.riskLevel)}>{member.riskLevel} risk</StatusPill>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${member.utilizationPercent}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>{member.utilizationPercent}% utilization</span>
                <span>{member.claimCount} claims YTD</span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </InsuranceShell>
  );
};

export const InsuranceFraudDetection = () => {
  const { data } = useInsurancePageData();
  return (
    <InsuranceShell data={data}>
      <SectionCard title="Fraud Detection" subtitle="AI flagged providers and claim patterns">
        <div className="space-y-3">
          {(data?.fraudAlerts ?? []).map((alert) => (
            <div key={alert.id} className="grid grid-cols-[minmax(0,1fr)_90px_140px_110px] items-center gap-4 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div>
                <div className="text-sm font-bold text-slate-900">{alert.subjectName}</div>
                <div className="text-xs text-slate-500">{alert.reason}</div>
              </div>
              <StatusPill tone={statusTone(alert.severity)}>{alert.severity}</StatusPill>
              <div className="font-mono text-sm font-bold text-slate-800">{formatCurrency(alert.exposureAmountAed)}</div>
              <button className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white">Investigate</button>
            </div>
          ))}
        </div>
      </SectionCard>
    </InsuranceShell>
  );
};

export const InsuranceRiskAnalytics = () => {
  const { data } = useInsurancePageData();
  const maxLossRatio = Math.max(...(data?.riskSegments.map((item) => item.lossRatioPercent) ?? [1]), 1);
  const savingsFound = data?.fraudAlerts.reduce((sum, alert) => sum + alert.exposureAmountAed, 0) ?? 0;
  const averageLossRatio = data?.riskSegments.length
    ? Math.round(data.riskSegments.reduce((sum, item) => sum + item.lossRatioPercent, 0) / data.riskSegments.length)
    : 0;

  return (
    <InsuranceShell data={data}>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SectionCard title="Risk Analytics" subtitle="Plan utilization and cost trend signals">
          <div className="space-y-4">
            {(data?.riskSegments ?? []).map((segment) => (
              <div key={segment.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-semibold text-slate-600">{segment.segmentName}</span>
                  <span className="font-mono text-slate-500">{segment.utilizationPercent}% utilization</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100">
                  <div className="h-3 rounded-full bg-[#1E3A5F]" style={{ width: `${Math.min(100, (segment.lossRatioPercent / maxLossRatio) * 100)}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-slate-400">{segment.forecastNote}</div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Loss Ratio Forecast" subtitle="Current seeded period">
          <div className="grid grid-cols-2 gap-3">
            <KpiCard label="Medical loss" value={`${averageLossRatio}%`} helper="Average risk segment loss ratio" tone="amber" />
            <KpiCard label="Savings found" value={formatCurrency(savingsFound)} helper="Open fraud alert exposure" tone="emerald" />
          </div>
        </SectionCard>
      </section>
    </InsuranceShell>
  );
};

export const InsuranceNetworkProviders = () => {
  const { data } = useInsurancePageData();
  return (
    <InsuranceShell data={data}>
      <SectionCard title="Network Providers" subtitle="Provider performance, approvals, and cost outliers">
        <div className="overflow-hidden rounded-xl border border-slate-100">
          <div className="divide-y divide-slate-100">
            {(data?.networkProviders ?? []).map((provider) => (
              <div key={provider.id} className="grid grid-cols-[minmax(0,1fr)_120px_100px_120px] items-center gap-4 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">{provider.providerName}</div>
                  <div className="truncate text-xs text-slate-500">
                    {provider.specialty} · {provider.performanceFlag}
                  </div>
                </div>
                <div className="font-mono text-sm text-slate-700">{provider.claimsCount} claims</div>
                <StatusPill tone={provider.approvalRatePercent >= 94 ? 'emerald' : provider.approvalRatePercent >= 90 ? 'blue' : 'amber'}>{provider.approvalRatePercent}%</StatusPill>
                <div className="font-mono text-sm font-bold text-slate-800">{formatCurrency(provider.averageCostAed)}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </InsuranceShell>
  );
};

export const InsuranceReports = () => {
  const { data, claimTotal, openFraud } = useInsurancePageData();
  const fraudExposure = openFraud.reduce((sum, alert) => sum + alert.exposureAmountAed, 0);

  return (
    <InsuranceShell data={data}>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.85fr]">
        <SectionCard title="Reports" subtitle="Regulatory, finance, and utilization exports">
          {(data?.reportRuns ?? []).map((report) => (
            <div key={report.id} className="mb-3 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4 last:mb-0">
              <div>
                <div className="text-sm font-semibold text-slate-900">{report.reportName}</div>
                <div className="text-xs text-slate-400">
                  {titleCase(report.status)} · {report.periodLabel}
                </div>
              </div>
              <button className="rounded-xl bg-[#1E3A5F] px-3 py-2 text-xs font-semibold text-white">Download</button>
            </div>
          ))}
        </SectionCard>
        <SectionCard title="Period Summary">
          <div className="space-y-3">
            <KpiCard label="Claims value" value={formatCurrency(claimTotal)} helper="From insurance_claims" tone="blue" />
            <KpiCard label="Fraud exposure" value={formatCurrency(fraudExposure)} helper="Open investigations" tone="red" />
          </div>
        </SectionCard>
      </section>
    </InsuranceShell>
  );
};

export const InsuranceSettings = () => {
  const { data } = useInsurancePageData();
  return (
    <InsuranceShell data={data}>
      <SectionCard title="Settings" subtitle="Payer portal preferences and compliance controls">
        <div className="space-y-3">
          {(data?.settings ?? []).map((setting) => (
            <div key={setting.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">{setting.title}</div>
                <div className="text-xs text-slate-500">{setting.description}</div>
              </div>
              <div className={`relative h-6 w-12 rounded-full ${setting.enabled ? 'bg-[#1E3A5F]' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${setting.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </InsuranceShell>
  );
};
