import React, { useMemo } from 'react';
import { Navigation } from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Pill,
  MessageSquare,
  Bell,
  Bot,
  ChevronRight,
  Heart,
  FlaskConical,
  Shield,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Skeleton } from '../../components/Skeleton';
import { useAuth } from '../../lib/auth-context';
import { usePatientDashboard } from '../../hooks';

const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatAppointmentType = (value: 'in_person' | 'virtual') =>
  value === 'in_person' ? 'In person' : 'Virtual';

const getDisplayName = (fullName: string | null | undefined, firstName: string | null | undefined, email?: string) => {
  if (firstName?.trim()) {
    return firstName.trim();
  }

  if (fullName?.trim()) {
    return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
  }

  if (email) {
    return email.split('@')[0];
  }

  return 'there';
};

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { data: dashboardData, loading: dashboardLoading, error: dashboardError } = usePatientDashboard(
    user?.id
  );

  const quickActions = useMemo(
    () => [
      { icon: Calendar, label: 'Appointments', action: () => navigate('/patient/appointments') },
      { icon: Pill, label: 'Prescriptions', action: () => navigate('/patient/prescriptions') },
      { icon: MessageSquare, label: 'Messages', action: () => navigate('/patient/messages') },
      { icon: FileText, label: 'Records', action: () => navigate('/patient/records') },
      { icon: Users, label: 'Profile', action: () => navigate('/patient/profile') },
      { icon: Bot, label: 'AI Health Chat', action: () => navigate('/patient/ai-chat') },
    ],
    [navigate]
  );

  const displayName = getDisplayName(profile?.full_name, profile?.first_name, user?.email);
  const profileStatus = profile?.profile_completed ? 'Ready' : 'Pending';
  const nextAppointment = dashboardData?.nextAppointment ?? null;
  const recentActivity = dashboardData?.recentActivity ?? [];
  const medications = dashboardData?.medications ?? [];

  const getActivityIcon = (type: string) => {
    if (type === 'lab_result') {
      return <FlaskConical className="w-6 h-6 text-white" />;
    }

    if (type === 'medication') {
      return <Pill className="w-6 h-6 text-white" />;
    }

    if (type === 'appointment') {
      return <Calendar className="w-6 h-6 text-white" />;
    }

    return <AlertCircle className="w-6 h-6 text-white" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />

      <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Healthcare Professional"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{`Welcome back, ${displayName}!`}</h1>
              <p className="text-cyan-100 text-lg">Here is your care overview for today.</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <Heart className="w-6 h-6 text-white" />
                <div>
                  <p className="text-xs text-cyan-100">Profile Status</p>
                  <p className="text-2xl font-bold text-white">{profileStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-20 mb-8 relative z-10">
          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/appointments')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Calendar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Upcoming</p>
              {dashboardLoading ? (
                <Skeleton className="mb-2 h-9 w-12" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.upcomingAppointmentsCount ?? 0}
                </p>
              )}
              <p className="text-sm text-cyan-600 font-medium">Appointments</p>
            </div>
          </div>

          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/prescriptions')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Medication"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
              {dashboardLoading ? (
                <Skeleton className="mb-2 h-9 w-12" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.activePrescriptionsCount ?? 0}
                </p>
              )}
              <p className="text-sm text-cyan-600 font-medium">Prescriptions</p>
            </div>
          </div>

          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/messages')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Communication"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Unread</p>
              {dashboardLoading ? (
                <Skeleton className="mb-2 h-9 w-12" />
              ) : (
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.unreadMessagesCount ?? 0}
                </p>
              )}
              <p className="text-sm text-cyan-600 font-medium">Messages</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {dashboardError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Some dashboard data could not be loaded yet. You can still use the shortcuts below.
              </div>
            ) : null}

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Medical"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      onClick={action.action}
                      className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-cyan-50 hover:to-blue-50 border-2 border-gray-200 hover:border-cyan-500 p-6 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-700 text-center transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Next Appointment
                </h2>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 transition-colors"
                >
                  View All
                </button>
              </div>
              {dashboardLoading ? (
                <Skeleton className="h-56 w-full rounded-2xl" />
              ) : nextAppointment ? (
                <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <img
                      src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt="Doctor Consultation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/70 to-blue-600/70"></div>
                  <div className="relative flex items-start justify-between text-white">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">{nextAppointment.doctorName}</h3>
                        <p className="text-cyan-100 text-sm mb-4">
                          {nextAppointment.specialty ?? 'Scheduled care visit'}
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {new Date(nextAppointment.scheduledAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              {new Date(nextAppointment.scheduledAt).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase flex-shrink-0">
                      {formatAppointmentType(nextAppointment.type)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                  <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">No upcoming appointments</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Your next scheduled visit will appear here once it is booked.
                  </p>
                  <button
                    onClick={() => navigate('/patient/appointments')}
                    className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:shadow-lg"
                  >
                    Go to appointments
                  </button>
                </div>
              )}
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Medical Records"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {dashboardLoading ? (
                    <>
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </>
                  ) : recentActivity.length > 0 ? (
                    recentActivity.map((activity) => (
                      <button
                        key={activity.id}
                        type="button"
                        onClick={() => {
                          if (activity.actionUrl) {
                            navigate(activity.actionUrl);
                          }
                        }}
                        className="group flex w-full items-center space-x-4 rounded-xl border-2 border-transparent bg-gray-50 p-4 text-left transition-all hover:border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.detail ?? formatRelativeTime(activity.createdAt)}
                          </p>
                        </div>
                        <span className="text-xs font-medium text-gray-400">{formatRelativeTime(activity.createdAt)}</span>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                      <Bell className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                      <p className="font-semibold text-gray-900">No recent activity yet</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Appointment, medication, and lab updates will appear here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Medication"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-2"></div>
                    Medication Reminders
                  </h2>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  {dashboardLoading ? (
                    <>
                      <Skeleton className="h-24 w-full rounded-xl" />
                      <Skeleton className="h-24 w-full rounded-xl" />
                    </>
                  ) : medications.length > 0 ? (
                    medications.map((medication) => (
                      <div
                        key={medication.id}
                        className={`rounded-xl border-2 p-4 transition-all ${
                          medication.isDispensed
                            ? 'border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50'
                            : 'border-orange-200 bg-orange-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm">{medication.medicationName}</p>
                            <p className="text-xs text-gray-600 mt-1 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {medication.detail}
                            </p>
                          </div>
                          {medication.isDispensed ? (
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                              <AlertCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                      <Pill className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                      <p className="font-semibold text-gray-900">No medication reminders right now</p>
                      <p className="mt-1 text-sm text-gray-600">
                        Active prescription items will appear here once they are added to your chart.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Healthcare"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-2"></div>
                  Patient Shortcuts
                </h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/patient/profile')}
                    className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">Profile</p>
                        <p className="text-xs text-gray-600">Review your personal details</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => navigate('/patient/records')}
                    className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">Medical Records</p>
                        <p className="text-xs text-gray-600">Access your documented health history</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                  </button>

                  <button
                    onClick={() => navigate('/patient/prescriptions')}
                    className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">Prescription Support</p>
                        <p className="text-xs text-gray-600">Check current medications and refill needs</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
