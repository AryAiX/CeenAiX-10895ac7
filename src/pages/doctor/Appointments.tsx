import React, { useMemo, useState } from 'react';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, Clock, List, MapPin, User, Video } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAppointments, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

type AppointmentViewMode = 'list' | 'calendar';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getMonthDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  const days: Array<Date | null> = [];

  for (let index = 0; index < startingDayOfWeek; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    days.push(new Date(year, month, day));
  }

  return days;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const {
    data: appointmentsData,
    loading,
    error,
    refetch,
  } = useAppointments({ role: 'doctor', userId: user?.id ?? '' });
  const appointments = appointmentsData ?? [];
  const [viewMode, setViewMode] = useState<AppointmentViewMode>('list');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [busyAppointmentId, setBusyAppointmentId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const patientIds = useMemo(
    () => Array.from(new Set((appointments ?? []).map((appointment) => appointment.patient_id))),
    [appointments]
  );

  const { data: patientProfilesData } = useQuery(
    async () => {
      if (patientIds.length === 0) {
        return [];
      }

      const { data, error: patientProfilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', patientIds);

      if (patientProfilesError) throw patientProfilesError;
      return data ?? [];
    },
    [patientIds.join(',')]
  );
  const patientProfiles = patientProfilesData ?? [];

  const patientNameById = useMemo(
    () =>
      new Map(
        patientProfiles.map((profile) => [profile.user_id, profile.full_name ?? 'Patient'])
      ),
    [patientProfiles]
  );
  const appointmentCountByDate = useMemo(
    () =>
      appointments.reduce<Map<string, number>>((map, appointment) => {
        const dateKey = formatDateKey(new Date(appointment.scheduled_at));
        map.set(dateKey, (map.get(dateKey) ?? 0) + 1);
        return map;
      }, new Map()),
    [appointments]
  );
  const selectedCalendarDateKey = formatDateKey(selectedCalendarDate);
  const visibleAppointments = useMemo(
    () =>
      viewMode === 'calendar'
        ? appointments.filter(
            (appointment) =>
              formatDateKey(new Date(appointment.scheduled_at)) === selectedCalendarDateKey
          )
        : appointments,
    [appointments, selectedCalendarDateKey, viewMode]
  );
  const currentMonthAppointmentCount = useMemo(
    () =>
      appointments.filter((appointment) => {
        const scheduledAt = new Date(appointment.scheduled_at);
        return (
          scheduledAt.getFullYear() === currentMonth.getFullYear() &&
          scheduledAt.getMonth() === currentMonth.getMonth()
        );
      }).length,
    [appointments, currentMonth]
  );

  const handleMonthChange = (offset: number) => {
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1);
    setCurrentMonth(nextMonth);
    setSelectedCalendarDate(nextMonth);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setFeedback(null);
    setBusyAppointmentId(appointmentId);

    const { error: cancelError } = await supabase.rpc('cancel_doctor_appointment', {
      p_appointment_id: appointmentId,
    });

    setBusyAppointmentId(null);

    if (cancelError) {
      setFeedback({ type: 'error', message: cancelError.message });
      return;
    }

    setFeedback({ type: 'success', message: 'Appointment cancelled successfully.' });
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Appointments"
        subtitle="Manage your patient appointments"
        icon={<Calendar className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Care</h2>
          <p className="text-gray-600">Live appointments will appear here as patients book against your profile.</p>
        </div>

        {feedback ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-700'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Doctor appointments could not be loaded yet.
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">No appointments yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              This page no longer shows sample patients. Your real booked consultations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'calendar' ? 'Calendar View' : 'List View'}
                </h3>
                <p className="text-sm text-gray-600">
                  {viewMode === 'calendar'
                    ? `Showing ${visibleAppointments.length} appointment${
                        visibleAppointments.length === 1 ? '' : 's'
                      } on ${selectedCalendarDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}.`
                    : `Showing all ${appointments.length} booked appointment${
                        appointments.length === 1 ? '' : 's'
                      } in chronological order.`}
                </p>
              </div>

              <div className="inline-flex w-full rounded-2xl bg-gray-100 p-1 md:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition md:flex-none ${
                    viewMode === 'list'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>List</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition md:flex-none ${
                    viewMode === 'calendar'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>Calendar</span>
                </button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Appointment Calendar</h3>
                    <p className="text-sm text-gray-600">
                      Pick a day to filter the appointment list below.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start rounded-xl bg-gray-50 px-2 py-2 sm:gap-3 sm:px-3">
                    <button
                      type="button"
                      onClick={() => handleMonthChange(-1)}
                      className="rounded-lg p-2 transition hover:bg-white"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <div className="min-w-28 text-center sm:min-w-36">
                      <p className="text-sm font-semibold text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {currentMonthAppointmentCount} appointment
                        {currentMonthAppointmentCount === 1 ? '' : 's'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMonthChange(1)}
                      className="rounded-lg p-2 transition hover:bg-white"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-500 sm:gap-2 sm:text-xs">
                  {WEEKDAY_LABELS.map((label) => (
                    <div key={label} className="py-1 sm:py-2">
                      <span className="sm:hidden">{label.charAt(0)}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
                  {getMonthDays(currentMonth).map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[4.5rem] rounded-xl bg-transparent sm:h-20 sm:rounded-2xl"
                        />
                      );
                    }

                    const dateKey = formatDateKey(date);
                    const appointmentCount = appointmentCountByDate.get(dateKey) ?? 0;
                    const isSelected = dateKey === selectedCalendarDateKey;
                    const isToday = dateKey === formatDateKey(new Date());

                    return (
                      <button
                        key={dateKey}
                        type="button"
                        onClick={() => setSelectedCalendarDate(date)}
                        className={`min-h-[4.5rem] rounded-xl border p-2 text-left transition sm:h-20 sm:rounded-2xl sm:p-3 ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`text-xs font-semibold sm:text-sm ${
                              isSelected ? 'text-cyan-700' : 'text-gray-900'
                            }`}
                          >
                            {date.getDate()}
                          </span>
                          {isToday ? (
                            <>
                              <span className="hidden rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-white sm:inline">
                                Today
                              </span>
                              <span className="inline h-2 w-2 rounded-full bg-gray-900 sm:hidden" />
                            </>
                          ) : null}
                        </div>
                        <div className="mt-2 sm:mt-4">
                          {appointmentCount > 0 ? (
                            <>
                              <span className="inline-flex rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 sm:hidden">
                                {appointmentCount}
                              </span>
                              <p className="hidden text-xs text-cyan-700 sm:block">
                                {appointmentCount} appointment{appointmentCount === 1 ? '' : 's'}
                              </p>
                            </>
                          ) : (
                            <p className="hidden text-xs text-gray-400 sm:block">No appointments</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {viewMode === 'calendar'
                    ? `Appointments on ${selectedCalendarDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'All Appointments'}
                </h3>
                <p className="text-sm text-gray-600">
                  {viewMode === 'calendar'
                    ? 'Only appointments scheduled for the selected day are shown here.'
                    : 'Review every upcoming and past appointment in one list.'}
                </p>
              </div>
            </div>

            {visibleAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
                <CalendarDays className="mx-auto mb-4 h-10 w-10 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900">No appointments on this day</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Pick another date in the calendar to see that day&apos;s booked consultations.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {visibleAppointments.map((appointment) => (
                  (() => {
                    const canCancel =
                      ['scheduled', 'confirmed'].includes(appointment.status) &&
                      new Date(appointment.scheduled_at).getTime() > Date.now();

                    return (
                      <div
                        key={appointment.id}
                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <div
                          className={`p-4 ${
                            appointment.type === 'virtual'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                {appointment.type === 'virtual' ? (
                                  <Video className="w-5 h-5 text-white" />
                                ) : (
                                  <MapPin className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-white">
                                  {patientNameById.get(appointment.patient_id) ?? 'Patient'}
                                </h3>
                                <p className="text-sm text-white/90">
                                  {appointment.chief_complaint ?? 'Scheduled consultation'}
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-gray-800">
                              {appointment.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex items-center space-x-3">
                              <div className="rounded-lg bg-blue-100 p-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-500">Time</p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {new Date(appointment.scheduled_at).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-medium text-gray-500">Duration</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {appointment.duration_minutes} min
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-medium text-gray-500">Type</p>
                              <p className="text-sm font-semibold text-gray-900 capitalize">
                                {appointment.type === 'in_person' ? 'In person' : 'Virtual'}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500">Reason for visit</p>
                              <p className="mt-2 text-sm text-gray-700">
                                {appointment.chief_complaint ?? 'No reason was provided at booking.'}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase text-gray-500">Patient notes</p>
                              <p className="mt-2 text-sm text-gray-700">
                                {appointment.notes ?? 'No additional notes were provided.'}
                              </p>
                            </div>
                          </div>

                          {canCancel ? (
                            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={busyAppointmentId === appointment.id}
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {busyAppointmentId === appointment.id ? 'Cancelling...' : 'Cancel appointment'}
                              </button>
                            </div>
                          ) : null}

                          <div className="mt-4 flex items-center space-x-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>Patient detail flows will open from this list once the doctor patient detail route is wired.</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
