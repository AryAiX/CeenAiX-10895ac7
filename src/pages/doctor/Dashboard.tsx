import React, { useMemo } from 'react';
import {
  AlertTriangle,
  Clock,
  FlaskConical,
  MessageSquare,
  PlayCircle,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../../components/Skeleton';
import { useDoctorDashboard } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import {
  appointmentStatusLabel,
  appointmentTypeLabel,
  dateTimeFormatWithNumerals,
  formatLocaleDigits,
  formatRelativeTime,
  preVisitStatusLabel,
  resolveLocale,
} from '../../lib/i18n-ui';

const getDisplayName = (fullName: string | null | undefined, firstName: string | null | undefined) => {
  if (fullName?.trim()) return fullName.trim();
  if (firstName?.trim()) return firstName.trim();
  return '';
};

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('common');
  const uiLang = i18n.language ?? 'en';
  const locale = resolveLocale(uiLang);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(uiLang, options);
  const { doctorProfile, profile, user } = useAuth();
  const { data, loading, error } = useDoctorDashboard(user?.id);

  const displayName = getDisplayName(profile?.full_name, profile?.first_name) || t('shared.doctor');
  const doctorName = /^dr\.?/i.test(displayName) ? displayName : uiLang.startsWith('ar') ? `د. ${displayName}` : `Dr. ${displayName}`;
  const doctorLocation = profile?.city?.trim() || (uiLang.startsWith('ar') ? 'دبي، الإمارات' : 'Dubai, UAE');
  const doctorFacility = profile?.address?.trim() || doctorLocation;
  const doctorLicense = doctorProfile?.license_number?.trim() || (uiLang.startsWith('ar') ? 'الترخيص قيد الإضافة' : 'License pending');
  const isArabic = uiLang.startsWith('ar');
  const localCopy = useMemo(
    () =>
      isArabic
        ? {
            criticalTitle: 'نتيجة حرجة',
            unacknowledged: 'غير معتمد',
            criticalHigh: 'حرج جداً',
            noCriticalStatus: 'كل النتائج الحرجة تمت مراجعتها',
            noCriticalBody: 'لا توجد نتائج مختبر حرجة غير معتمدة لهذا الطبيب حالياً.',
            reference: 'المرجع',
            openLabResults: 'فتح طلبات المختبر',
            acknowledgeResult: 'اعتماد النتيجة',
            unavailable: 'غير متاح حالياً',
            greeting: 'مساء الخير',
            daySummary: 'تم إنجاز {{done}} من {{total}} مواعيد',
            finishEstimate: 'الانتهاء المتوقع: {{time}}',
            activeConsultation: 'استشارة جارية',
            nextPatient: 'المريض التالي',
            openWorkspace: 'فتح مساحة الاستشارة',
            soapNotes: 'ملاحظات SOAP',
            prescribe: 'وصفة',
            orderLab: 'طلب مختبر',
            totalPatients: 'إجمالي المرضى',
            todayAppts: 'مواعيد اليوم',
            pendingReviews: 'مراجعات معلقة',
            unreadMessages: 'رسائل غير مقروءة',
            criticalLabs: 'نتائج حرجة',
            dhaStatus: 'حالة ترخيص DHA',
            completed: 'مكتمل',
            remaining: 'متبقٍ',
            inProgress: 'قيد التنفيذ',
            todaySchedule: 'مواعيد اليوم',
            todayScheduleSub: 'المواعيد المكتملة والجارية والقادمة لهذا اليوم.',
            viewFullSchedule: 'عرض الجدول الكامل',
            openAppointment: 'فتح الموعد',
            noTodaySchedule: 'ستظهر مواعيد اليوم هنا عند دخول الحجوزات في جدول الطبيب.',
            recentLabs: 'نتائج المختبر',
            viewAllLabs: 'عرض كل النتائج',
            noLabs: 'لا توجد نتائج مختبر حديثة لهذا الطبيب بعد.',
            recentMessages: 'الرسائل',
            viewAllMessages: 'عرض الكل',
            noMessages: 'لا توجد رسائل حديثة بعد.',
            aiTitle: 'رؤى سريرية بالذكاء الاصطناعي',
            aiBody: 'سيتم تفعيل الرؤى السريرية للطبيب بعد اكتمال مساحة الذكاء الاصطناعي الطبية.',
            comingSoon: 'قريباً',
            noChiefComplaint: 'استشارة مجدولة',
            statusOk: 'صالح',
            statusPending: 'قيد المراجعة',
          }
        : {
            criticalTitle: 'CRITICAL RESULT',
            unacknowledged: 'Unacknowledged',
            criticalHigh: 'Critical high',
            noCriticalStatus: 'All critical results reviewed',
            noCriticalBody: 'There are no unacknowledged critical lab results for this doctor right now.',
            reference: 'Reference',
            openLabResults: 'Open lab orders',
            acknowledgeResult: 'Acknowledge result',
            unavailable: 'Not available yet',
            greeting: 'Good afternoon',
            daySummary: '{{done}} of {{total}} appointments done',
            finishEstimate: 'Finish est.: {{time}}',
            activeConsultation: 'Live Consultation',
            nextPatient: 'Next Patient',
            openWorkspace: 'Open Consultation Workspace',
            soapNotes: 'SOAP Notes',
            prescribe: 'Prescribe',
            orderLab: 'Order Lab',
            totalPatients: 'Total Patients',
            todayAppts: "Today's Appointments",
            pendingReviews: 'Pending Reviews',
            unreadMessages: 'Unread Messages',
            criticalLabs: 'Critical Labs',
            dhaStatus: 'DHA License Status',
            completed: 'completed',
            remaining: 'remaining',
            inProgress: 'in progress',
            todaySchedule: "Today's Appointments",
            todayScheduleSub: 'Completed, active, and upcoming visits for today.',
            viewFullSchedule: 'View full schedule',
            openAppointment: 'Open',
            noTodaySchedule: "Today's schedule will appear here once bookings land on the doctor's calendar.",
            recentLabs: 'Lab Results',
            viewAllLabs: 'View all lab results',
            noLabs: 'No recent lab results for this doctor yet.',
            recentMessages: 'Messages',
            viewAllMessages: 'View all',
            noMessages: 'No recent messages yet.',
            aiTitle: 'AI Clinical Insights',
            aiBody: 'Doctor-facing clinical AI insights will be enabled after the clinical workspace is finalized.',
            comingSoon: 'Coming soon',
            noChiefComplaint: 'Scheduled consultation',
            statusOk: 'Valid',
            statusPending: 'Pending',
          },
    [isArabic]
  );
  const completedTodayAppointments = data?.completedTodayAppointments ?? 0;
  const todayAppointments = data?.todayAppointments ?? 0;
  const activeConsultation = data?.activeConsultation ?? null;
  const nextAppointment = data?.nextAppointment ?? null;
  const todaySchedule = data?.todaySchedule ?? [];
  const criticalResult = data?.criticalResults[0] ?? null;
  const recentLabResults = data?.recentLabResults ?? [];
  const recentMessages = data?.recentMessages ?? [];
  const metricCards = [
    { label: localCopy.totalPatients, value: formatLocaleDigits(data?.totalPatients ?? 0, uiLang), tone: 'text-sky-600 bg-sky-50' },
    { label: localCopy.todayAppts, value: formatLocaleDigits(todayAppointments, uiLang), tone: 'text-emerald-600 bg-emerald-50' },
    { label: localCopy.pendingReviews, value: formatLocaleDigits(data?.pendingReviews ?? 0, uiLang), tone: 'text-amber-600 bg-amber-50' },
    { label: localCopy.unreadMessages, value: formatLocaleDigits(data?.unreadMessages ?? 0, uiLang), tone: 'text-violet-600 bg-violet-50' },
    { label: localCopy.criticalLabs, value: formatLocaleDigits(data?.criticalResults.length ?? 0, uiLang), tone: 'text-rose-600 bg-rose-50' },
    {
      label: localCopy.dhaStatus,
      value: doctorProfile?.dha_license_verified ? localCopy.statusOk : localCopy.statusPending,
      tone: doctorProfile?.dha_license_verified ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-100',
      sublabel: doctorLicense,
    },
  ];

  const renderComplaint = (value: string | null | undefined, emptyLabel: string) => {
    if (!value?.trim()) {
      return emptyLabel;
    }

    return uiLang.startsWith('ar') ? (
      <span dir="ltr" className="block text-start" translate="no">
        {value}
      </span>
    ) : (
      value
    );
  };

  const formatDoctorDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, dtOpts({ year: 'numeric', month: 'short', day: 'numeric' }));
  const formatDoctorTime = (value: string) =>
    new Date(value).toLocaleTimeString(locale, dtOpts({ hour: 'numeric', minute: '2-digit' }));
  const lastTodayAppointment = todaySchedule.length > 0 ? todaySchedule[todaySchedule.length - 1] : null;
  const finishEstimate = lastTodayAppointment ? `~${formatDoctorTime(lastTodayAppointment.scheduledAt)}` : '~4:00 PM';
  const scheduleStatusTone = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-slate-100 text-slate-700';
      case 'in_progress':
        return 'bg-emerald-100 text-emerald-800';
      case 'confirmed':
        return 'bg-sky-100 text-sky-800';
      case 'scheduled':
        return 'bg-violet-100 text-violet-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('doctor.dashboard.loadError')}
        </div>
      ) : null}

      <div className={`rounded-2xl p-5 shadow-sm ${criticalResult ? 'border border-rose-200 bg-rose-50' : 'border border-slate-200 bg-white'}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className={`flex items-center gap-2 ${criticalResult ? 'text-rose-700' : 'text-slate-700'}`}>
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-wide">{localCopy.criticalTitle}</p>
            </div>
            {criticalResult ? (
              <>
                <p className="mt-2 text-sm font-medium text-rose-700">
                  {localCopy.unacknowledged}: {formatRelativeTime(t, criticalResult.resultedAt)}
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {criticalResult.patientName} - {criticalResult.testName}
                </p>
                <p className="mt-2 text-3xl font-bold text-rose-700">
                  {[criticalResult.resultValue, criticalResult.resultUnit].filter(Boolean).join(' ')}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span>
                    {localCopy.reference}: {criticalResult.referenceRange ?? '-'}
                  </span>
                  <span className="rounded-full bg-rose-100 px-3 py-1 font-semibold text-rose-700">
                    {localCopy.criticalHigh}
                  </span>
                  <span>{formatDoctorTime(criticalResult.resultedAt)}</span>
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 text-sm font-medium text-emerald-700">{localCopy.noCriticalStatus}</p>
                <p className="mt-2 text-sm text-slate-600">{localCopy.noCriticalBody}</p>
              </>
            )}
          </div>

          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/lab-orders')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                criticalResult
                  ? 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-100'
                  : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {localCopy.openLabResults}
            </button>
            <button
              type="button"
              disabled
              title={localCopy.unavailable}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white opacity-50 disabled:cursor-not-allowed ${
                criticalResult ? 'bg-rose-600' : 'bg-slate-400'
              }`}
            >
              {localCopy.acknowledgeResult}
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-bold leading-tight text-slate-900">
            {localCopy.greeting}, {doctorName}. {'\u{1F3E5}'}
          </h1>
          <p className="mt-2 text-[15px] text-slate-500">
            {new Date().toLocaleDateString(locale, dtOpts({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))} · {doctorFacility}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-3 shadow-sm">
          {loading ? (
            <Skeleton className="h-12 w-52" />
          ) : (
            <>
              <p className="text-[15px] font-semibold text-slate-900">
                {localCopy.daySummary
                  .replace('{{done}}', formatLocaleDigits(completedTodayAppointments, uiLang))
                  .replace('{{total}}', formatLocaleDigits(todayAppointments, uiLang))}
              </p>
              <p className="mt-1 text-[13px] text-slate-500">
                {localCopy.finishEstimate.replace('{{time}}', finishEstimate)}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#0A1628] to-teal-600 rounded-[20px] p-7 mb-6 shadow-2xl relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-teal-500/10 animate-pulse-slow" />
        <div className="relative z-10">
        {loading ? (
          <Skeleton className="h-40 w-full rounded-2xl bg-white/10" />
        ) : activeConsultation || nextAppointment ? (
          <>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-200">
              <PlayCircle className="h-4 w-4" />
              {activeConsultation ? localCopy.activeConsultation : localCopy.nextPatient}
            </div>
            <h2 className="mt-3 text-[30px] font-bold leading-tight">
              {(activeConsultation ?? nextAppointment)?.patientName}
            </h2>
            <p className="mt-2 max-w-3xl text-[15px] text-white/85">
              {renderComplaint((activeConsultation ?? nextAppointment)?.chiefComplaint, localCopy.noChiefComplaint)}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-3 py-1">{formatDoctorDate((activeConsultation ?? nextAppointment)!.scheduledAt)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{formatDoctorTime((activeConsultation ?? nextAppointment)!.scheduledAt)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 capitalize">
                {appointmentTypeLabel(t, (activeConsultation ?? nextAppointment)!.type)}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 capitalize">
                {appointmentStatusLabel(t, (activeConsultation ?? nextAppointment)!.status)}
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate(`/doctor/appointments/${(activeConsultation ?? nextAppointment)!.id}`)}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {localCopy.openWorkspace}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/doctor/appointments/${(activeConsultation ?? nextAppointment)!.id}`)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {localCopy.soapNotes}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/doctor/prescriptions/new?patient=${(activeConsultation ?? nextAppointment)!.patientId}&appointment=${(activeConsultation ?? nextAppointment)!.id}`
                  )
                }
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {localCopy.prescribe}
              </button>
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/doctor/lab-orders/new?patient=${(activeConsultation ?? nextAppointment)!.patientId}&appointment=${(activeConsultation ?? nextAppointment)!.id}`
                  )
                }
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                {localCopy.orderLab}
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <Clock className="mx-auto h-8 w-8 text-white/60" />
            <p className="mt-3 font-semibold">{t('doctor.dashboard.noUpcomingTitle')}</p>
            <p className="mt-2 text-sm text-white/70">{t('doctor.dashboard.noUpcomingBody')}</p>
          </div>
        )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {metricCards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className={`inline-flex rounded-xl px-3 py-1 text-xs font-semibold ${card.tone}`}>{card.label}</div>
            {loading ? (
              <Skeleton className="mt-4 h-8 w-24" />
            ) : (
              <>
                <p className="mt-4 text-3xl font-bold text-slate-900">{card.value}</p>
                {'sublabel' in card && card.sublabel ? (
                  <p className="mt-2 text-xs text-slate-500">{card.sublabel}</p>
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{localCopy.todaySchedule}</h2>
                <p className="mt-1 text-sm text-slate-500">{localCopy.todayScheduleSub}</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/doctor/appointments')}
                className="text-sm font-semibold text-teal-700 transition hover:text-teal-800"
              >
                {localCopy.viewFullSchedule}
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            ) : todaySchedule.length > 0 ? (
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-lg font-semibold text-slate-900">{appointment.patientName}</p>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${scheduleStatusTone(appointment.status)}`}>
                            {appointmentStatusLabel(t, appointment.status)}
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                            {appointmentTypeLabel(t, appointment.type)}
                          </span>
                          {appointment.preVisitStatus ? (
                            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-900">
                              {t('doctor.dashboard.preVisitLabel')}: {preVisitStatusLabel(t, appointment.preVisitStatus)}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {renderComplaint(appointment.chiefComplaint, t('doctor.dashboard.noChiefComplaint'))}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                        <p className="font-semibold text-slate-900">{formatDoctorTime(appointment.scheduledAt)}</p>
                        <p className="mt-1 text-slate-500">{formatDoctorDate(appointment.scheduledAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctor/appointments/${appointment.id}`)}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50"
                      >
                        {localCopy.openAppointment}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                <Users className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <p className="font-semibold text-gray-900">{localCopy.todaySchedule}</p>
                <p className="mt-2 text-sm text-gray-600">{localCopy.noTodaySchedule}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50">
                  <FlaskConical className="h-4 w-4 text-rose-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">{localCopy.recentLabs}</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/doctor/lab-orders')}
                className="text-xs font-semibold text-teal-700 transition hover:text-teal-800"
              >
                {localCopy.viewAllLabs}
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-xl" />
                </>
              ) : recentLabResults.length > 0 ? (
                recentLabResults.map((result) => (
                  <div
                    key={result.id}
                    className={`rounded-xl border p-4 ${
                      result.labOrderStatus === 'resulted' ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{result.patientName}</p>
                        <p className="mt-1 text-xs text-slate-500">{result.testName}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{formatRelativeTime(t, result.resultedAt)}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-rose-700">
                      {[result.resultValue, result.resultUnit].filter(Boolean).join(' ')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {localCopy.reference}: {result.referenceRange ?? '-'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{localCopy.noLabs}</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">{localCopy.recentMessages}</h2>
              </div>
              <button
                type="button"
                onClick={() => navigate('/doctor/messages')}
                className="text-xs font-semibold text-teal-700 transition hover:text-teal-800"
              >
                {localCopy.viewAllMessages}
              </button>
            </div>

            <div className="space-y-3">
              {loading ? (
                <>
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </>
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <button
                    key={message.id}
                    type="button"
                    onClick={() => navigate(`/doctor/messages/${message.conversationId}`)}
                    className="w-full rounded-xl bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{message.patientName}</p>
                      <span className="shrink-0 text-xs text-slate-500">{formatRelativeTime(t, message.sentAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">{message.body}</p>
                  </button>
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">{localCopy.noMessages}</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <Sparkles className="h-4 w-4 text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{localCopy.aiTitle}</p>
                <p className="mt-2 text-sm text-slate-600">{localCopy.aiBody}</p>
                <button
                  type="button"
                  disabled
                  title={localCopy.unavailable}
                  className="mt-4 rounded-xl bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 opacity-60 disabled:cursor-not-allowed"
                >
                  {localCopy.comingSoon}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
