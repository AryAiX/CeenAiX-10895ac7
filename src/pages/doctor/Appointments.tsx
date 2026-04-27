import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Clock, List, MapPin, User, Video } from 'lucide-react';
import { DoctorReferenceShell } from '../../components/DoctorReferenceShell';
import { Skeleton } from '../../components/Skeleton';
import { useAppointments, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import {
  appointmentTypeLabel,
  appointmentStatusLabel,
  calendarWeekdayShort,
  dateTimeFormatWithNumerals,
  formatLocaleDigits,
  preVisitStatusLabel,
  resolveLocale,
} from '../../lib/i18n-ui';

type AppointmentViewMode = 'list' | 'calendar';

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
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const uiLang = i18n.language ?? 'en';
  const locale = resolveLocale(uiLang);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(uiLang, options);
  const weekdayLabels = useMemo(() => calendarWeekdayShort(t), [t]);
  const { user } = useAuth();
  const {
    data: appointmentsData,
    loading,
    error,
    refetch,
  } = useAppointments({ role: 'doctor', userId: user?.id ?? '' });
  const appointments = useMemo(() => appointmentsData ?? [], [appointmentsData]);
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
  const appointmentIds = useMemo(() => appointments.map((appointment) => appointment.id), [appointments]);

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
  const patientProfiles = useMemo(() => patientProfilesData ?? [], [patientProfilesData]);

  const patientNameById = useMemo(
    () =>
      new Map(
        patientProfiles.map((profile) => [profile.user_id, profile.full_name ?? t('shared.patient')])
      ),
    [patientProfiles, t]
  );
  const { data: preVisitAssessmentData } = useQuery(
    async () => {
      if (appointmentIds.length === 0) {
        return [];
      }

      const { data, error: assessmentsError } = await supabase
        .from('appointment_pre_visit_assessments')
        .select('id, appointment_id, status')
        .in('appointment_id', appointmentIds);

      if (assessmentsError) {
        throw assessmentsError;
      }

      const assessmentIds = (data ?? []).map((assessment) => assessment.id);
      const { data: summaries, error: summariesError } = assessmentIds.length
        ? await supabase
            .from('appointment_pre_visit_summaries')
            .select('assessment_id, summary_text, key_points, risk_flags, pending_questions, generated_at')
            .in('assessment_id', assessmentIds)
        : { data: [], error: null };

      if (summariesError) {
        throw summariesError;
      }

      const summaryByAssessmentId = new Map((summaries ?? []).map((summary) => [summary.assessment_id, summary]));

      return (data ?? []).map((assessment) => ({
        id: assessment.id,
        appointmentId: assessment.appointment_id,
        status: assessment.status,
        summary: summaryByAssessmentId.get(assessment.id) ?? null,
      }));
    },
    [appointmentIds.join(',')]
  );
  const preVisitAssessments = useMemo(
    () => preVisitAssessmentData ?? [],
    [preVisitAssessmentData]
  );
  const preVisitAssessmentByAppointmentId = useMemo(
    () => new Map(preVisitAssessments.map((assessment) => [assessment.appointmentId, assessment])),
    [preVisitAssessments]
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

    setFeedback({ type: 'success', message: t('doctor.appointments.cancelSuccess') });
    refetch();
  };

  return (
    <DoctorReferenceShell
      title={t('doctor.appointments.title')}
      subtitle={t('doctor.appointments.subtitle')}
      activeTab="appointments"
      stats={{
        todayAppointments: appointments.length,
        completedTodayAppointments: appointments.filter((appointment) => appointment.status === 'completed').length,
      }}
    >
      <div>
        <div className="mb-4">
          <h2 className="text-base font-semibold text-slate-900">{t('doctor.appointments.sectionTitle')}</h2>
          <p className="text-xs text-slate-500">{t('doctor.appointments.sectionSub')}</p>
        </div>

        {feedback ? (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border-red-100 bg-red-50 text-red-600'
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
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {t('doctor.appointments.loadError')}
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">{t('doctor.appointments.emptyTitle')}</h3>
            <p className="mt-2 text-sm text-slate-500">{t('doctor.appointments.emptyBody')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {viewMode === 'calendar' ? t('doctor.appointments.viewCalendar') : t('doctor.appointments.viewList')}
                </h3>
                <p className="text-sm text-slate-600">
                  {viewMode === 'calendar'
                    ? visibleAppointments.length === 1
                      ? t('doctor.appointments.calendarSubOne', {
                          count: formatLocaleDigits(visibleAppointments.length, uiLang),
                          date: selectedCalendarDate.toLocaleDateString(
                            locale,
                            dtOpts({
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ),
                        })
                      : t('doctor.appointments.calendarSubMany', {
                          count: formatLocaleDigits(visibleAppointments.length, uiLang),
                          date: selectedCalendarDate.toLocaleDateString(
                            locale,
                            dtOpts({
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ),
                        })
                    : appointments.length === 1
                      ? t('doctor.appointments.listSubOne', {
                          count: formatLocaleDigits(appointments.length, uiLang),
                        })
                      : t('doctor.appointments.listSubMany', {
                          count: formatLocaleDigits(appointments.length, uiLang),
                        })}
                </p>
              </div>

              <div className="inline-flex w-full rounded-2xl bg-slate-100 p-1 md:w-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition md:flex-none ${
                    viewMode === 'list'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                  <span>{t('doctor.appointments.list')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('calendar')}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition md:flex-none ${
                    viewMode === 'calendar'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="h-4 w-4" />
                  <span>{t('doctor.appointments.calendar')}</span>
                </button>
              </div>
            </div>

            {viewMode === 'calendar' ? (
              <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{t('doctor.appointments.calTitle')}</h3>
                    <p className="text-sm text-slate-600">{t('doctor.appointments.calSub')}</p>
                  </div>

                  <div className="flex items-center gap-2 self-start rounded-xl bg-slate-50 px-2 py-2 sm:gap-3 sm:px-3">
                    <button
                      type="button"
                      onClick={() => handleMonthChange(-1)}
                      className="rounded-lg p-2 transition hover:bg-white"
                      aria-label={t('doctor.appointments.prevMonth')}
                    >
                      <ChevronLeft className="h-5 w-5 text-slate-700" />
                    </button>
                    <div className="min-w-28 text-center sm:min-w-36">
                      <p className="text-sm font-semibold text-slate-900">
                        {currentMonth.toLocaleDateString(locale, dtOpts({ month: 'long', year: 'numeric' }))}
                      </p>
                      <p className="text-xs text-slate-500">
                        {currentMonthAppointmentCount === 1
                          ? t('doctor.appointments.apptCountOne', {
                              count: formatLocaleDigits(currentMonthAppointmentCount, uiLang),
                            })
                          : t('doctor.appointments.apptCountMany', {
                              count: formatLocaleDigits(currentMonthAppointmentCount, uiLang),
                            })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMonthChange(1)}
                      className="rounded-lg p-2 transition hover:bg-white"
                      aria-label={t('doctor.appointments.nextMonth')}
                    >
                      <ChevronRight className="h-5 w-5 text-slate-700" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:gap-2 sm:text-xs">
                  {weekdayLabels.map((label) => (
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
                            : 'border-slate-200 bg-white hover:border-cyan-200 hover:bg-cyan-50/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`text-xs font-semibold sm:text-sm ${
                              isSelected ? 'text-cyan-700' : 'text-slate-900'
                            }`}
                          >
                            {formatLocaleDigits(date.getDate(), uiLang)}
                          </span>
                          {isToday ? (
                            <>
                              <span className="hidden rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase text-white sm:inline">
                                {t('doctor.appointments.today')}
                              </span>
                              <span className="inline h-2 w-2 rounded-full bg-slate-900 sm:hidden" />
                            </>
                          ) : null}
                        </div>
                        <div className="mt-2 sm:mt-4">
                          {appointmentCount > 0 ? (
                            <>
                              <span className="inline-flex rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-700 sm:hidden">
                                {formatLocaleDigits(appointmentCount, uiLang)}
                              </span>
                              <p className="hidden text-xs text-cyan-700 sm:block">
                                {appointmentCount === 1
                                  ? t('doctor.appointments.apptCountOne', {
                                      count: formatLocaleDigits(appointmentCount, uiLang),
                                    })
                                  : t('doctor.appointments.apptCountMany', {
                                      count: formatLocaleDigits(appointmentCount, uiLang),
                                    })}
                              </p>
                            </>
                          ) : (
                            <p className="hidden text-xs text-slate-400 sm:block">{t('doctor.appointments.noApptsDay')}</p>
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
                <h3 className="text-xl font-bold text-slate-900">
                  {viewMode === 'calendar'
                    ? t('doctor.appointments.headingCal', {
                        date: selectedCalendarDate.toLocaleDateString(
                          locale,
                          dtOpts({
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        ),
                      })
                    : t('doctor.appointments.headingAll')}
                </h3>
                <p className="text-sm text-slate-600">
                  {viewMode === 'calendar' ? t('doctor.appointments.subCal') : t('doctor.appointments.subAll')}
                </p>
              </div>
            </div>

            {visibleAppointments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
                <CalendarDays className="mx-auto mb-4 h-10 w-10 text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900">{t('doctor.appointments.noDayTitle')}</h3>
                <p className="mt-2 text-sm text-slate-600">{t('doctor.appointments.noDayBody')}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {visibleAppointments.map((appointment) => (
                  (() => {
                    const canCancel =
                      ['scheduled', 'confirmed'].includes(appointment.status) &&
                      new Date(appointment.scheduled_at).getTime() > Date.now();
                    const preVisitAssessment = preVisitAssessmentByAppointmentId.get(appointment.id);

                    return (
                      <div
                        key={appointment.id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
                      >
                        <div
                          className={`p-4 ${
                            appointment.type === 'virtual'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          }`}
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <div className="shrink-0 rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                                {appointment.type === 'virtual' ? (
                                  <Video className="w-5 h-5 text-white" />
                                ) : (
                                  <MapPin className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-lg font-bold text-white">
                                  {patientNameById.get(appointment.patient_id) ?? t('shared.patient')}
                                </h3>
                                <p className="text-sm text-white/90">
                                  {appointment.chief_complaint ? (
                                    uiLang.startsWith('ar') ? (
                                      <span dir="ltr" className="block text-start" translate="no">
                                        {appointment.chief_complaint}
                                      </span>
                                    ) : (
                                      appointment.chief_complaint
                                    )
                                  ) : (
                                    t('shared.scheduledConsultation')
                                  )}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-slate-800">
                              {appointmentStatusLabel(t, appointment.status)}
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
                                <p className="text-xs font-medium text-slate-500">{t('doctor.appointments.time')}</p>
                                <p className="text-sm font-semibold text-slate-900">
                                  {new Date(appointment.scheduled_at).toLocaleString(
                                    locale,
                                    dtOpts({
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })
                                  )}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-medium text-slate-500">{t('doctor.appointments.duration')}</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {t('shared.minutesUnit', {
                                  count: formatLocaleDigits(appointment.duration_minutes, uiLang),
                                })}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-medium text-slate-500">{t('doctor.appointments.type')}</p>
                              <p className="text-sm font-semibold text-slate-900 capitalize">
                                {appointmentTypeLabel(t, appointment.type)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium uppercase text-slate-500">{t('doctor.appointments.reason')}</p>
                              <p className="mt-2 text-sm text-slate-700">
                                {appointment.chief_complaint ? (
                                  uiLang.startsWith('ar') ? (
                                    <span dir="ltr" className="block text-start" translate="no">
                                      {appointment.chief_complaint}
                                    </span>
                                  ) : (
                                    appointment.chief_complaint
                                  )
                                ) : (
                                  t('doctor.appointments.noReason')
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium uppercase text-slate-500">{t('doctor.appointments.patientNotes')}</p>
                              <p className="mt-2 text-sm text-slate-700">
                                {appointment.notes ? (
                                  uiLang.startsWith('ar') ? (
                                    <span dir="ltr" className="block text-start" translate="no">
                                      {appointment.notes}
                                    </span>
                                  ) : (
                                    appointment.notes
                                  )
                                ) : (
                                  t('doctor.appointments.noNotes')
                                )}
                              </p>
                            </div>
                          </div>

                          {preVisitAssessment ? (
                            <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                              <div className="flex items-center gap-2">
                                <ClipboardList className="h-4 w-4 text-cyan-700" />
                                <p className="text-sm font-semibold text-cyan-900">
                                  {t('doctor.appointments.preVisitPrefix')}:{' '}
                                  {preVisitStatusLabel(t, preVisitAssessment.status)}
                                </p>
                              </div>
                              {preVisitAssessment.summary ? (
                                <>
                                  <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                                    {t('doctor.appointments.aiSummary')}
                                  </p>
                                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                                    {uiLang.startsWith('ar') ? (
                                      <span dir="ltr" className="block text-start" translate="no">
                                        {preVisitAssessment.summary.summary_text}
                                      </span>
                                    ) : (
                                      preVisitAssessment.summary.summary_text
                                    )}
                                  </p>
                                </>
                              ) : (
                                <p className="mt-2 text-sm text-slate-700">{t('doctor.appointments.preVisitPending')}</p>
                              )}
                            </div>
                          ) : null}

                          <div className="mt-4 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                            <button
                              type="button"
                              onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                              className="rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
                            >
                              {t('doctor.appointmentDetail.openDetail')}
                            </button>
                            {canCancel ? (
                              <button
                                type="button"
                                onClick={() => handleCancelAppointment(appointment.id)}
                                disabled={busyAppointmentId === appointment.id}
                                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {busyAppointmentId === appointment.id
                                  ? t('doctor.appointments.cancelling')
                                  : t('doctor.appointments.cancel')}
                              </button>
                            ) : null}
                          </div>

                          <div className="mt-4 flex items-center space-x-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
                            <User className="h-4 w-4" />
                            <span>{t('doctor.appointments.footerHint')}</span>
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
    </DoctorReferenceShell>
  );
};
