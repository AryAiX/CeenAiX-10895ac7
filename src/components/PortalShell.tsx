import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  AlertTriangle,
  Banknote,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  FolderOpen,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Pill,
  Scan,
  Settings,
  ShieldCheck,
  Stethoscope,
  UserCircle2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useDoctorPortalChrome } from '../hooks';
import { usePatientDashboardAlert } from '../hooks/use-patient-dashboard-alert';
import { LanguageSwitcher } from './LanguageSwitcher';

type PortalRole = 'patient' | 'doctor';

interface PortalShellProps {
  role: PortalRole;
  children: ReactNode;
}

interface PortalNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  badge?: number;
  disabled?: boolean;
  action?: () => void;
}

const isActivePath = (pathname: string, href?: string) => {
  if (!href) {
    return false;
  }

  if (pathname === href) {
    return true;
  }

  if (href.endsWith('/dashboard')) {
    return false;
  }

  return pathname.startsWith(`${href}/`);
};

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'CX';

export const PortalShell = ({ role, children }: PortalShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation('common');
  const { profile, doctorProfile, user, signOut } = useAuth();
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [portalMenuOpen, setPortalMenuOpen] = useState(false);
  const [patientSidebarCollapsed, setPatientSidebarCollapsed] = useState(false);
  const [patientAlertDismissed, setPatientAlertDismissed] = useState(false);

  useEffect(() => {
    setAccountMenuOpen(false);
    setPortalMenuOpen(false);
    setPatientAlertDismissed(false);
  }, [location.pathname]);

  const isArabic = i18n.language.startsWith('ar');
  const accountDisplayName =
    profile?.full_name?.trim() || profile?.first_name?.trim() || user?.email?.split('@')[0] || 'Account';
  const accountDisplayEmail = profile?.email ?? user?.email ?? null;
  const accountPath = role === 'patient' ? '/patient/profile' : '/doctor/profile';
  const portalLabel = role === 'patient' ? t('nav.patientPortal') : t('nav.doctorPortal');
  const showPatientDashboardAlert =
    role === 'patient' && location.pathname === '/patient/dashboard' && !patientAlertDismissed;
  const { data: patientDashboardAlerts } = usePatientDashboardAlert(showPatientDashboardAlert ? user?.id : null);
  const { data: doctorChromeData } = useDoctorPortalChrome(role === 'doctor' ? user?.id : null);

  const handleSignOut = async () => {
    const { error } = await signOut();

    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  if (role === 'patient') {
    const patientNavItems: PortalNavItem[] = [
      { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, href: '/patient/dashboard' },
      { id: 'appointments', label: t('nav.appointments'), icon: Calendar, href: '/patient/appointments' },
      { id: 'my-health', label: t('nav.myHealth'), icon: Heart, disabled: true },
      { id: 'medications', label: t('nav.medications'), icon: Pill, href: '/patient/prescriptions' },
      { id: 'lab-results', label: t('nav.labResults'), icon: Activity, disabled: true },
      { id: 'imaging', label: t('nav.imagingScans'), icon: Scan, disabled: true },
      { id: 'documents', label: t('nav.documents'), icon: FolderOpen, badge: 3, disabled: true },
      { id: 'messages', label: t('nav.messages'), icon: MessageSquare, href: '/patient/messages', badge: 2 },
      { id: 'ai-assistant', label: t('nav.aiAssistant'), icon: Bot, href: '/patient/ai-chat' },
      { id: 'insurance', label: t('nav.insurance'), icon: ShieldCheck, disabled: true },
    ];

    const patientBottomItems: PortalNavItem[] = [
      { id: 'profile', label: t('nav.profile'), icon: UserCircle2, href: '/patient/profile' },
      { id: 'settings', label: t('nav.settings'), icon: Settings, disabled: true },
      { id: 'signout', label: t('nav.logOut'), icon: LogOut, action: () => void handleSignOut() },
    ];

    const portalItems: PortalNavItem[] = [
      { id: 'patient', label: t('nav.patientPortal'), icon: UserCircle2, href: '/patient/dashboard' },
      { id: 'doctor', label: t('nav.doctorPortal'), icon: Stethoscope, href: '/doctor/dashboard' },
      { id: 'pharmacy', label: t('header.pharmacy'), icon: Pill, disabled: true },
      { id: 'lab', label: t('header.laboratories'), icon: FlaskConical, disabled: true },
      { id: 'insurance', label: t('header.insurance'), icon: ShieldCheck, disabled: true },
      { id: 'admin', label: t('auth.roleAccess.roles.admin.title'), icon: Settings, disabled: true },
    ];

    const renderPatientNavItem = (item: PortalNavItem, compact = false) => {
      const Icon = item.icon;
      const active = isActivePath(location.pathname, item.href);
      const sharedClass = compact ? 'px-3.5 py-2.5 text-[13px]' : 'px-4 py-3 text-sm';
      const alignmentClass = isArabic ? 'flex-row-reverse' : '';

      return (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            if (item.disabled) {
              return;
            }

            item.action?.();

            if (item.href) {
              navigate(item.href);
            }
          }}
          disabled={item.disabled}
          className={`flex w-full items-center gap-3 rounded-lg transition-all duration-300 ${alignmentClass} ${sharedClass} ${
            item.disabled
              ? 'cursor-not-allowed text-slate-400'
              : active
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : compact
                  ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700'
          }`}
        >
          <Icon className={`${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'} shrink-0`} />
          {!patientSidebarCollapsed ? (
            <span className={`flex-1 font-medium ${isArabic ? 'text-right' : 'text-left'}`}>{item.label}</span>
          ) : null}
          {!patientSidebarCollapsed && item.badge ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {item.badge}
            </span>
          ) : null}
        </button>
      );
    };

    return (
      <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
        <div className="z-50 flex-shrink-0 border-b border-cyan-100 bg-white px-6 py-4 shadow-sm shadow-cyan-500/5">
          <div className={`flex items-center justify-between gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className={`flex min-w-0 items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}
            >
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_29_01_AM.png"
                alt="CeenAiX"
                className="h-10 w-10 object-contain"
              />
              <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
                CeenAiX
              </h1>
            </button>

            <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPortalMenuOpen((current) => !current)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 ${isArabic ? 'flex-row-reverse' : ''}`}
                >
                  <Menu className="h-5 w-5 text-slate-600 transition-colors duration-300" />
                  <span className="text-sm font-medium text-slate-700">{t('nav.portals')}</span>
                </button>

                {portalMenuOpen ? (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setPortalMenuOpen(false)} />
                    <div className={`absolute z-50 mt-2 w-64 rounded-lg border border-cyan-100 bg-white py-2 shadow-xl shadow-cyan-500/10 ${isArabic ? 'left-0' : 'right-0'}`}>
                      {portalItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (item.disabled) {
                                return;
                              }

                              setPortalMenuOpen(false);

                              if (item.href) {
                                navigate(item.href);
                              }
                            }}
                            disabled={item.disabled}
                            className={`flex w-full items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${isArabic ? 'flex-row-reverse text-right' : 'text-left'} ${
                              item.disabled
                                ? 'cursor-not-allowed text-slate-400'
                                : 'text-slate-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : null}
              </div>

              <LanguageSwitcher dense />

              <button
                type="button"
                onClick={() => navigate('/patient/profile')}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-sm font-bold text-white"
              >
                {getInitials(accountDisplayName)}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div
            className={`flex flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 ${
              patientSidebarCollapsed ? 'w-20' : 'w-60'
            }`}
          >
            <div className="flex-1 overflow-y-auto py-6">
              <nav className="space-y-1 px-3">{patientNavItems.map((item) => renderPatientNavItem(item))}</nav>
            </div>

            <div className="border-t border-gray-200">
              <nav className="space-y-1 px-3 py-3">
                {patientBottomItems.map((item) => renderPatientNavItem(item, true))}
              </nav>

              <div className="border-t border-gray-200 p-3">
                <button
                  type="button"
                  onClick={() => setPatientSidebarCollapsed((current) => !current)}
                  className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-gray-100 ${isArabic ? 'flex-row-reverse' : ''}`}
                >
                  {patientSidebarCollapsed ? (
                    <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                  ) : (
                    <>
                      <ChevronLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                      <span className={`${isArabic ? 'mr-2' : 'ml-2'} text-sm font-medium`}>
                        {t('nav.collapse')}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <main className="flex-1 overflow-y-auto">
            {showPatientDashboardAlert ? (
              <div
                className={`flex items-center justify-between border-b border-red-100 bg-red-50 px-6 py-2.5 ${
                  isArabic ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`flex items-center gap-2.5 text-sm text-red-700 ${isArabic ? 'flex-row-reverse' : ''}`}>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{isArabic ? 'تنبيه حساسية:' : 'Allergy Alert:'}</span>
                  <span className="text-red-600">
                    {patientDashboardAlerts && patientDashboardAlerts.length > 0
                      ? patientDashboardAlerts
                          .map((alert) =>
                            alert.reaction
                              ? `${alert.allergen} (${alert.reaction})`
                              : alert.allergen
                          )
                          .join(' · ')
                      : isArabic
                        ? 'لا توجد تنبيهات حساسية حالية'
                        : 'No current allergy alerts'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPatientAlertDismissed(true)}
                  className="ml-4 text-red-400 transition-colors hover:text-red-600"
                  aria-label={isArabic ? 'إغلاق التنبيه' : 'Dismiss alert'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : null}
            <div className="max-w-[1320px] mx-auto px-6 py-6 space-y-6">{children}</div>
          </main>
        </div>
      </div>
    );
  }

  const doctorTopNavGroups: Array<{
    id: string;
    title?: string;
    items: Array<{ href?: string; label: string; icon: LucideIcon; badge?: number; disabled?: boolean; action?: () => void }>;
  }> = [
    {
      id: 'clinic',
      title: 'CLINIC',
      items: [
        { href: '/doctor/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, badge: doctorChromeData?.todayAppointmentsCount ?? undefined },
        { href: '/doctor/appointments', label: "Today's Appointments", icon: Calendar, badge: doctorChromeData?.todayAppointmentsCount ?? undefined },
        { href: '/doctor/appointments', label: t('nav.appointments'), icon: Calendar },
        { href: '/doctor/patients', label: 'Patient Records', icon: Users },
      ],
    },
    {
      id: 'workflow',
      items: [
        { href: '/doctor/prescriptions/new', label: 'Write Prescription', icon: ClipboardList, badge: 1 },
        { href: '/doctor/lab-orders/new', label: 'Lab Referrals', icon: FlaskConical, badge: doctorChromeData?.criticalResultsCount ?? undefined },
        { label: 'Imaging Center', icon: Scan, badge: 1, disabled: true },
        { href: '/doctor/messages', label: t('nav.messages'), icon: MessageSquare, badge: doctorChromeData?.unreadMessagesCount ?? undefined },
      ],
    },
    {
      id: 'analytics',
      title: 'ANALYTICS',
      items: [{ label: 'Earnings', icon: Banknote, disabled: true }],
    },
    {
      id: 'account',
      title: 'ACCOUNT',
      items: [{ href: '/doctor/profile', label: 'My Profile', icon: UserCircle2 }],
    },
  ];

  const doctorStatusChips = [
    doctorChromeData?.activeConsultationPatientName
      ? {
          id: 'consulting',
          label: `Consulting: ${doctorChromeData.activeConsultationPatientName}`,
          className: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
        }
      : null,
    (doctorChromeData?.criticalResultsCount ?? 0) > 0
      ? {
          id: 'critical',
          label: `${doctorChromeData?.criticalResultsCount} critical result${doctorChromeData?.criticalResultsCount === 1 ? '' : 's'}`,
          className: 'border border-rose-200 bg-rose-50 text-rose-700',
        }
      : null,
  ].filter(Boolean) as Array<{ id: string; label: string; className: string }>;

  const formatDoctorNow = new Date().toLocaleString(i18n.language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const doctorSpecialty = doctorProfile?.specialization?.trim() || t('shared.doctor');
  const doctorLocation = profile?.city?.trim() || 'Dubai Healthcare City';
  const doctorFacility = profile?.address?.trim() || doctorLocation;
  const doctorLicense = doctorProfile?.license_number?.trim() || 'License pending';
  const todayAppointmentsCount = doctorChromeData?.todayAppointmentsCount ?? 0;
  const completedTodayAppointmentsCount = doctorChromeData?.completedTodayAppointmentsCount ?? 0;
  const estimatedRevenueToday =
    doctorProfile?.consultation_fee && todayAppointmentsCount > 0
      ? doctorProfile.consultation_fee * todayAppointmentsCount
      : null;

  const renderDoctorNavItem = (
    item: { href?: string; label: string; icon: LucideIcon; badge?: number; disabled?: boolean; action?: () => void },
    key: string
  ) => {
    const active = item.href ? isActivePath(location.pathname, item.href) : false;
    const Icon = item.icon;
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
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[12.5px] leading-5 font-medium transition ${
          item.disabled
            ? 'cursor-not-allowed text-slate-500'
            : active
              ? 'bg-white/10 text-white'
              : 'text-slate-300 hover:bg-white/[0.04] hover:text-white'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <Icon className={`h-[15px] w-[15px] shrink-0 ${active ? 'text-white' : item.disabled ? 'text-slate-600' : 'text-slate-400'}`} />
          <span className="truncate">{item.label}</span>
        </span>
        {item.badge ? (
          <span
            className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold ${
              active ? 'bg-teal-500 text-white' : 'bg-white/10 text-slate-200'
            }`}
          >
            {item.badge}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <aside className="w-[260px] bg-[#0A1628] flex flex-col transition-all duration-300 shadow-2xl">
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="flex items-center gap-3 text-left"
          >
            <div>
              <p className="text-lg font-bold text-white">CeenAiX</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{portalLabel}</p>
            </div>
          </button>
        </div>

        <div className="px-4 py-4">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-xl p-3">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
                {getInitials(accountDisplayName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{accountDisplayName}</p>
                <p className="truncate text-xs text-slate-200">{doctorSpecialty}</p>
                <p className="mt-1 truncate text-xs text-slate-300">{doctorFacility}</p>
                <p className="mt-1 text-[11px] font-medium text-teal-300">
                  {doctorProfile?.dha_license_verified ? 'DHA Licensed ✓' : 'DHA verification pending'}
                </p>
                <p className="mt-1 text-[11px] text-slate-300">{doctorLicense}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {doctorTopNavGroups.map((group) => (
            <div key={group.id} className="space-y-0.5">
              {group.title ? (
                <div className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500/90">
                  {group.title}
                </div>
              ) : null}
              {group.items.map((item, index) => renderDoctorNavItem(item, `${group.id}-${index}`))}
            </div>
          ))}
        </nav>

        <div className="px-3 pb-2 border-t border-white/[0.06] pt-2 mt-1">
          {renderDoctorNavItem({ label: t('nav.settings'), icon: Settings, disabled: true }, 'doctor-settings')}
        </div>

        <div className="border-t border-white/[0.06] p-3.5 space-y-2.5">
          <div className="space-y-1.5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-slate-500/90">TODAY</p>
            <div className="space-y-1.5 text-[12.5px] text-slate-200">
              <div className="flex items-center gap-2">
                <Calendar className="h-[14px] w-[14px] shrink-0 text-slate-400" />
                <p>{todayAppointmentsCount} appointments</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-[14px] w-[14px] shrink-0 text-teal-300" />
                <p>{completedTodayAppointmentsCount}/{todayAppointmentsCount} done</p>
              </div>
              <div className="flex items-center gap-2">
                <Banknote className="h-[14px] w-[14px] shrink-0 text-slate-400" />
                <p>
                  Revenue today{' '}
                  <span className="font-semibold text-white">
                    {estimatedRevenueToday !== null ? `AED ${estimatedRevenueToday.toLocaleString()}` : 'AED --'}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-[14px] w-[14px] shrink-0 text-rose-300" />
                <p>
                  Critical alerts{' '}
                  <span className="font-semibold text-rose-300">
                    {doctorChromeData?.criticalResultsCount ?? 0} {doctorChromeData?.criticalResultsCount ? 'URGENT' : ''}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium text-slate-300 transition hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-base font-semibold text-slate-900">{t('nav.dashboard')}</p>
              <p className="hidden text-xs text-slate-500 sm:block">{formatDoctorNow}</p>
            </div>
          </div>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 px-6 lg:flex">
            {doctorStatusChips.map((chip) => (
              <span
                key={chip.id}
                className={`truncate rounded-lg px-3 py-1.5 text-[13px] font-medium ${chip.className}`}
              >
                {chip.label}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher dense variant="light" />
            <button
              type="button"
              onClick={() => navigate('/doctor/notifications')}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700"
            >
              <MessageSquare className="h-4 w-4" />
              {(doctorChromeData?.unreadMessagesCount ?? 0) > 0 ? (
                <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {doctorChromeData?.unreadMessagesCount}
                </span>
              ) : null}
            </button>
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((current) => !current)}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white">
                  {getInitials(accountDisplayName)}
                </div>
                <div className="hidden min-w-0 md:block">
                  <p className="truncate text-sm font-semibold text-slate-900">{accountDisplayName}</p>
                  <p className="truncate text-xs text-slate-500">{doctorSpecialty}</p>
                </div>
              </button>

              {accountMenuOpen ? (
                <div className="absolute end-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">{accountDisplayName}</p>
                    <p className="mt-1 text-xs text-slate-500">{accountDisplayEmail ?? doctorSpecialty}</p>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        navigate(accountPath);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('nav.profile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setAccountMenuOpen(false);
                        await handleSignOut();
                      }}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t('nav.logOut')}</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-5">{children}</main>
      </div>
    </div>
  );
};
