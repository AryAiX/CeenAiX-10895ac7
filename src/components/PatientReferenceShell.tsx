import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  Bell,
  Bot,
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  FlaskConical,
  FolderOpen,
  Heart,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Pill,
  Scan,
  Settings,
  ShieldCheck,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth-context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface PatientReferenceShellProps {
  children: ReactNode;
  activeTab?:
    | 'dashboard'
    | 'appointments'
    | 'health'
    | 'medications'
    | 'lab-results'
    | 'imaging'
    | 'documents'
    | 'messages'
    | 'notifications'
    | 'ai-assistant'
    | 'insurance'
    | 'profile'
    | 'settings';
}

interface PatientNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  disabled?: boolean;
}

const getInitials = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2) || 'PT';

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

export const PatientReferenceShell = ({ children, activeTab }: PatientReferenceShellProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation('common');
  const { profile, user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const isArabic = i18n.language.startsWith('ar');

  useEffect(() => {
    setShowPortalMenu(false);
    setShowAccountMenu(false);
  }, [location.pathname]);

  const displayName =
    profile?.full_name?.trim() || profile?.first_name?.trim() || user?.email?.split('@')[0] || 'Patient';
  const initials = getInitials(displayName);

  const mainNav = useMemo<PatientNavItem[]>(
    () => [
      { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, href: '/patient/dashboard' },
      { id: 'appointments', label: t('nav.appointments'), icon: Calendar, href: '/patient/appointments' },
      { id: 'health', label: t('nav.myHealth'), icon: Heart, href: '/patient/records' },
      { id: 'medications', label: t('nav.medications'), icon: Pill, href: '/patient/prescriptions' },
      { id: 'lab-results', label: t('nav.labResults'), icon: FlaskConical, href: '/patient/lab-results' },
      { id: 'imaging', label: t('nav.imagingScans'), icon: Scan, href: '/patient/imaging' },
      { id: 'documents', label: t('nav.documents'), icon: FolderOpen, href: '/patient/documents' },
      { id: 'messages', label: t('nav.messages'), icon: MessageSquare, href: '/patient/messages' },
      { id: 'ai-assistant', label: t('nav.aiAssistant'), icon: Bot, href: '/patient/ai-chat' },
      { id: 'insurance', label: t('nav.insurance'), icon: ShieldCheck, href: '/patient/insurance' },
    ],
    [t]
  );

  const bottomNav = useMemo<PatientNavItem[]>(
    () => [
      { id: 'profile', label: t('nav.profile'), icon: User, href: '/patient/profile' },
      { id: 'settings', label: t('nav.settings'), icon: Settings, href: '/patient/settings' },
    ],
    [t]
  );

  const portalItems = useMemo<PatientNavItem[]>(
    () => [
      { id: 'patient', label: t('nav.patientPortal'), icon: User, href: '/patient/dashboard' },
      { id: 'doctor', label: t('nav.doctorPortal'), icon: FileText, href: '/doctor/dashboard' },
      { id: 'pharmacy', label: t('header.pharmacy'), icon: Pill, disabled: true },
      { id: 'lab', label: t('header.laboratories'), icon: FlaskConical, disabled: true },
      { id: 'insurance-public', label: t('header.insurance'), icon: ShieldCheck, href: '/insurance' },
    ],
    [t]
  );

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/auth/login', { replace: true });
    }
  };

  const renderNavItem = (item: PatientNavItem, compact = false) => {
    const Icon = item.icon;
    const active = (activeTab && activeTab === item.id) || isActivePath(location.pathname, item.href);

    return (
      <button
        key={item.id}
        type="button"
        disabled={item.disabled}
        onClick={() => {
          if (item.disabled) {
            return;
          }
          if (item.href) {
            navigate(item.href);
          }
        }}
        className={`flex w-full items-center gap-3 rounded-lg transition-all duration-300 ${
          isArabic ? 'flex-row-reverse' : ''
        } ${
          compact ? 'px-3.5 py-2.5 text-[13px]' : 'px-4 py-3 text-sm'
        } ${
          item.disabled
            ? 'cursor-not-allowed text-slate-400'
            : active
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
              : 'text-gray-700 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-cyan-700'
        }`}
      >
        <Icon className={`${compact ? 'h-[18px] w-[18px]' : 'h-5 w-5'} shrink-0`} />
        {!isCollapsed ? (
          <span className={`flex-1 font-medium ${isArabic ? 'text-right' : 'text-left'}`}>{item.label}</span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <div className="z-50 flex-shrink-0 border-b border-cyan-100 bg-white px-6 py-4 shadow-sm shadow-cyan-500/5">
        <div className={`flex items-center justify-between gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div className={`flex min-w-0 items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group rounded-lg p-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
              aria-label={t('nav.goBack')}
            >
              <ArrowLeft
                className={`h-5 w-5 text-slate-600 transition-colors duration-300 group-hover:text-cyan-600 ${
                  isArabic ? 'rotate-180' : ''
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="group rounded-lg p-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
              aria-label={t('nav.goHome')}
            >
              <Home className="h-5 w-5 text-slate-600 transition-colors duration-300 group-hover:text-cyan-600" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className={`flex min-w-0 items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}
            >
              <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 object-contain" />
              <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-xl font-bold text-transparent">
                CeenAiX
              </h1>
            </button>
          </div>

          <div className={`flex items-center gap-4 ${isArabic ? 'flex-row-reverse' : ''}`}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPortalMenu((current) => !current)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 ${isArabic ? 'flex-row-reverse' : ''}`}
              >
                <Menu className="h-5 w-5 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{t('nav.portals')}</span>
              </button>
              {showPortalMenu ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPortalMenu(false)} />
                  <div
                    className={`absolute z-50 mt-2 w-64 rounded-lg border border-cyan-100 bg-white py-2 shadow-xl shadow-cyan-500/10 ${
                      isArabic ? 'left-0' : 'right-0'
                    }`}
                  >
                    {portalItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={item.disabled}
                          onClick={() => {
                            if (!item.disabled && item.href) {
                              navigate(item.href);
                              setShowPortalMenu(false);
                            }
                          }}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ${
                            isArabic ? 'flex-row-reverse text-right' : 'text-left'
                          } ${
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
              onClick={() => navigate('/patient/notifications')}
              className="rounded-lg p-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
              aria-label={t('nav.notifications')}
            >
              <Bell className="h-5 w-5 text-slate-600 transition-colors duration-300 hover:text-cyan-600" />
            </button>

            <div className={`relative ${isArabic ? 'border-r pr-4' : 'border-l pl-4'} border-slate-200`}>
              <button
                type="button"
                onClick={() => setShowAccountMenu((current) => !current)}
                className={`flex items-center gap-2 transition-opacity hover:opacity-80 ${isArabic ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-sm font-bold text-white">
                  {initials}
                </div>
                <div className={`hidden md:block ${isArabic ? 'text-right' : 'text-left'}`}>
                  <p className="text-sm font-semibold leading-none text-slate-800">{displayName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{t('header.patient')}</p>
                </div>
              </button>

              {showAccountMenu ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAccountMenu(false)} />
                  <div
                    className={`absolute z-50 mt-2 w-56 rounded-xl border border-cyan-100 bg-white py-2 shadow-xl ${
                      isArabic ? 'left-0' : 'right-0'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/patient/profile');
                        setShowAccountMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-700 ${
                        isArabic ? 'flex-row-reverse text-right' : 'text-left'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>{t('nav.myProfile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/patient/settings');
                        setShowAccountMenu(false);
                      }}
                      className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-700 ${
                        isArabic ? 'flex-row-reverse text-right' : 'text-left'
                      }`}
                    >
                      <Settings className="h-4 w-4" />
                      <span>{t('nav.settings')}</span>
                    </button>
                    <div className="mt-1 border-t border-gray-100 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          void handleSignOut();
                          setShowAccountMenu(false);
                        }}
                        className={`flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50 ${
                          isArabic ? 'flex-row-reverse text-right' : 'text-left'
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('nav.signOut')}</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`flex flex-shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white transition-all duration-300 ${
            isCollapsed ? 'w-20' : 'w-60'
          }`}
        >
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="space-y-1 px-3">{mainNav.map((item) => renderNavItem(item))}</nav>
          </div>

          <div className="border-t border-gray-200">
            <nav className="space-y-1 px-3 py-3">{bottomNav.map((item) => renderNavItem(item, true))}</nav>

            <div className="border-t border-gray-200 p-3">
              <button
                type="button"
                onClick={() => setIsCollapsed((current) => !current)}
                className={`flex w-full items-center justify-center rounded-lg px-4 py-3 text-gray-600 transition-colors hover:bg-gray-100 ${isArabic ? 'flex-row-reverse' : ''}`}
              >
                {isCollapsed ? (
                  <ChevronRight className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                ) : (
                  <>
                    <ChevronLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
                    <span className={`${isArabic ? 'mr-2' : 'ml-2'} text-sm font-medium`}>{t('nav.collapse')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1320px] space-y-6 px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};
