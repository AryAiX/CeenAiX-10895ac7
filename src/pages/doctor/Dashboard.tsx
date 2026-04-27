import React from 'react';
import { Bell, Brain, Calendar, FlaskConical, LayoutDashboard, MessageSquare, PenLine, Scan, Settings, TrendingUp, UserCircle2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { DoctorReferenceShell } from '../../components/DoctorReferenceShell';
import { useDoctorDashboard } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { formatLocaleDigits } from '../../lib/i18n-ui';

export const DoctorDashboard: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data } = useDoctorDashboard(user?.id);
  const uiLang = i18n.language ?? 'en';
  const total = data?.todayAppointments ?? 0;
  const done = data?.completedTodayAppointments ?? 0;
  const pending = data?.pendingReviews ?? 0;
  const unread = data?.unreadMessages ?? 0;
  const critical = data?.criticalResults.length ?? 0;
  const active = data?.activeConsultation;
  const next = data?.nextAppointment;

  const clinicNav = [
    { id: 'dashboard', href: '/doctor/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: total, badgeTone: 'red' as const },
    { id: 'today', href: '/doctor/appointments', label: "Today's Appointments", icon: Calendar, badge: total, badgeTone: 'amber' as const },
    { id: 'appointments', href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', href: '/doctor/patients', label: 'Patient Records', icon: Users },
    { id: 'prescribe', href: '/doctor/prescriptions/new', label: 'Write Prescription', icon: PenLine, badge: pending ? 1 : undefined, badgeTone: 'amber' as const },
    { id: 'labs', href: '/doctor/lab-orders', label: 'Lab Referrals', icon: FlaskConical, badge: critical || undefined, badgeTone: 'red' as const },
    { id: 'imaging', href: '/doctor/imaging', label: 'Imaging Center', icon: Scan, badge: 1, badgeTone: 'amber' as const },
    { id: 'messages', href: '/doctor/messages', label: 'Messages', icon: MessageSquare, badge: unread || undefined, badgeTone: 'blue' as const },
  ];
  const analyticsNav = [{ id: 'earnings', href: '/doctor/earnings', label: 'Earnings', icon: TrendingUp }];
  const accountNav = [{ id: 'profile', href: '/doctor/profile', label: 'My Profile', icon: UserCircle2 }];

  return (
    <DoctorReferenceShell
      activeTab="dashboard"
      clinicNav={clinicNav}
      analyticsNav={analyticsNav}
      accountNav={accountNav}
      stats={{
        todayAppointments: total,
        completedTodayAppointments: done,
        criticalAlerts: critical,
      }}
      title={t('doctor.dashboard.title')}
      subtitle={t('doctor.dashboard.subtitle')}
      rightActions={
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
            <Bell className="h-4 w-4" />
          </button>
          <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-600 via-blue-600 to-cyan-700 p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyan-100">Good afternoon,</p>
              <h2 className="mt-1 text-3xl font-bold">Dr. Dashboard</h2>
              <p className="mt-2 text-sm text-white/85">
                {formatLocaleDigits(done, uiLang)}/{formatLocaleDigits(total, uiLang)} appointments complete
              </p>
            </div>
            <div className="rounded-xl bg-white/20 px-4 py-3 text-center">
              <p className="text-2xl font-bold">{formatLocaleDigits(total, uiLang)}</p>
              <p className="text-xs text-cyan-100 uppercase tracking-wide">Today</p>
            </div>
          </div>
        </div>

        {(active || next) ? (
          <div className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Active Consultation</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{(active ?? next)?.patientName}</h3>
            <p className="mt-2 text-sm text-slate-600">{(active ?? next)?.chiefComplaint || t('doctor.dashboard.noChiefComplaint')}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/doctor/appointments/${(active ?? next)?.id}`)}
                className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Open Workspace
              </button>
              <button
                type="button"
                onClick={() => navigate('/doctor/lab-orders')}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Open Lab Orders
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-cyan-600" />
              <p className="text-sm font-medium text-slate-600">Total patients</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatLocaleDigits(data?.totalPatients ?? 0, uiLang)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Unread messages</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatLocaleDigits(unread, uiLang)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-5 w-5 text-rose-600" />
              <p className="text-sm font-medium text-slate-600">Critical labs</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{formatLocaleDigits(critical, uiLang)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/40 p-5">
          <div className="flex items-start gap-3">
            <Brain className="mt-0.5 h-5 w-5 text-cyan-700" />
            <div>
              <p className="font-semibold text-slate-900">AI Clinical Assistant</p>
              <p className="mt-1 text-sm text-slate-600">
                Doctor-facing AI module placeholder aligned with reference chrome for Phase 2 migration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DoctorReferenceShell>
  );
};
