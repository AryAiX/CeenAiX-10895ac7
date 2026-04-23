import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Bell,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  MessageSquare,
  Package,
  Pill,
  Search,
} from 'lucide-react';
import { MedicationNameDisplay } from '../../components/MedicationNameDisplay';
import { Skeleton } from '../../components/Skeleton';
import { usePatientPrescriptions } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import {
  dateTimeFormatWithNumerals,
  formatLocaleDigits,
  prescriptionStatusLabel,
  resolveLocale,
} from '../../lib/i18n-ui';
import { formatMedicationDetailLine } from '../../lib/medication-display';

type MedicationTab = 'active' | 'schedule' | 'reminders' | 'past' | 'costs';

export const PatientPrescriptions: React.FC = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const uiLang = i18n.language ?? 'en';
  const locale = resolveLocale(uiLang);
  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString(
      locale,
      dateTimeFormatWithNumerals(uiLang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
  } = usePatientPrescriptions(user?.id);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'history'>('all');
  const [activeTab, setActiveTab] = useState<MedicationTab>('active');

  const prescriptions = useMemo(() => data ?? [], [data]);

  const filteredPrescriptions = useMemo(
    () =>
      prescriptions.filter((prescription) => {
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'active' ? prescription.status === 'active' : prescription.status !== 'active');
        const searchValue = searchQuery.trim().toLowerCase();

        if (!matchesStatus) {
          return false;
        }

        if (searchValue.length === 0) {
          return true;
        }

        const haystack = [
          prescription.doctorName,
          prescription.doctorSpecialty,
          prescription.status,
          ...prescription.items.flatMap((item) => [
            item.medication_name,
            item.medication_name_ar,
            item.dosage,
            item.frequency,
            item.duration,
            item.instructions,
          ]),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return haystack.includes(searchValue);
      }),
    [prescriptions, searchQuery, statusFilter]
  );

  const activePrescriptions = useMemo(
    () => filteredPrescriptions.filter((prescription) => prescription.status === 'active'),
    [filteredPrescriptions]
  );
  const pastPrescriptions = useMemo(
    () => filteredPrescriptions.filter((prescription) => prescription.status !== 'active'),
    [filteredPrescriptions]
  );

  const activeMedicationCount = useMemo(
    () =>
      prescriptions
        .filter((prescription) => prescription.status === 'active')
        .reduce((count, prescription) => count + prescription.items.length, 0),
    [prescriptions]
  );

  const pendingDispenseCount = useMemo(
    () =>
      prescriptions
        .filter((prescription) => prescription.status === 'active')
        .flatMap((prescription) => prescription.items)
        .filter((item) => !item.is_dispensed).length,
    [prescriptions]
  );

  const activePlanCount = useMemo(
    () => prescriptions.filter((prescription) => prescription.status === 'active').length,
    [prescriptions]
  );

  const pastPlanCount = useMemo(
    () => prescriptions.filter((prescription) => prescription.status !== 'active').length,
    [prescriptions]
  );

  const selectedPrescriptionItem = useMemo(() => {
    if (!selectedMedication) {
      return undefined;
    }
    for (const prescription of prescriptions) {
      const found = prescription.items.find((item) => item.medication_name === selectedMedication);
      if (found) {
        return found;
      }
    }
    return undefined;
  }, [prescriptions, selectedMedication]);

  const handleRefillRequest = (medicationName: string) => {
    setSelectedMedication(medicationName);
  };

  if (loading) {
    return (
      <>
        <div className="animate-fadeIn">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {t('patient.prescriptions.title')}
          </h1>
          <p className="mt-2 text-[15px] text-slate-400">{t('patient.prescriptions.subtitleLoading')}</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </>
    );
  }

  const renderActiveTab = () => (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <span>💊 {t('patient.prescriptions.activeSection')}</span>
          <span className="bg-ceenai-blue text-white text-xs font-bold rounded-full w-7 h-7 inline-flex items-center justify-center shadow-sm">
            {formatLocaleDigits(activePrescriptions.length, uiLang)}
          </span>
        </h2>
        <span className="text-sm text-slate-500">
          {t('patient.prescriptions.activeBadge', {
            count: formatLocaleDigits(activePrescriptions.length, uiLang),
          })}
        </span>
      </div>

      {activePrescriptions.length === 0 ? (
        <div className="relative bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
            <img
              src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=400"
              alt={t('header.pharmacy')}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-ceenai-cyan to-ceenai-blue rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Pill className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('patient.prescriptions.emptyActiveTitle')}</h3>
            <p className="text-slate-600">{t('patient.prescriptions.emptyActiveBody')}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {activePrescriptions.map((prescription) => {
            const pendingItems = prescription.items.filter((item) => !item.is_dispensed).length;

            return (
              <div
                key={prescription.id}
                className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="relative bg-gradient-to-r from-ceenai-navy via-ceenai-blue to-ceenai-cyan p-6">
                  <div className="absolute inset-0 opacity-10">
                    <img
                      src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt={t('patient.dashboard.altMedication')}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Pill className="w-8 h-8 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {prescription.items[0] ? (
                            <>
                              <MedicationNameDisplay
                                canonicalName={prescription.items[0].medication_name}
                                localizedName={prescription.items[0].medication_name_ar}
                                language={uiLang}
                                primaryClassName="block text-xl font-bold text-white"
                                secondaryClassName="block text-sm font-normal text-cyan-100 mt-0.5"
                              />
                              {prescription.items.length > 1
                                ? ` ${t('shared.moreSuffix', {
                                    count: formatLocaleDigits(prescription.items.length - 1, uiLang),
                                  })}`
                                : ''}
                            </>
                          ) : (
                            t('shared.medicationPlan')
                          )}
                        </h3>
                        <p className="text-cyan-100 text-sm mt-1">
                          {t('patient.prescriptions.prescribedBy')} {prescription.doctorName}
                          {prescription.doctorSpecialty ? ` - ${prescription.doctorSpecialty}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/patient/messages?doctor=${prescription.doctor_id}`)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{t('patient.messages.messagePrescriber')}</span>
                      </button>
                      {pendingItems > 0 ? (
                        <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                          {t('patient.prescriptions.pendingPickupBadge', {
                            count: formatLocaleDigits(pendingItems, uiLang),
                          })}
                        </span>
                      ) : null}
                      <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/30 uppercase">
                        {prescriptionStatusLabel(t, prescription.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>{t('patient.prescriptions.prescribedOn')}</span>
                      </div>
                      <p className="mt-2 font-semibold text-slate-900">{formatDate(prescription.prescribed_at)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                        <Package className="h-4 w-4" />
                        <span>{t('patient.prescriptions.medItems')}</span>
                      </div>
                      <p className="mt-2 font-semibold text-slate-900">
                        {formatLocaleDigits(prescription.items.length, uiLang)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-500">
                        <Clock className="h-4 w-4" />
                        <span>{t('patient.prescriptions.dispensing')}</span>
                      </div>
                      <p className="mt-2 font-semibold text-slate-900">
                        {t('patient.prescriptions.dispensedRatio', {
                          done: formatLocaleDigits(
                            prescription.items.filter((item) => item.is_dispensed).length,
                            uiLang
                          ),
                          total: formatLocaleDigits(prescription.items.length, uiLang),
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {prescription.items.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">
                              <MedicationNameDisplay
                                canonicalName={item.medication_name}
                                localizedName={item.medication_name_ar}
                                language={uiLang}
                                primaryClassName="block"
                                secondaryClassName="block text-sm font-normal text-slate-500 mt-0.5"
                              />
                            </h4>
                            <p className="mt-1 text-sm text-slate-600">
                              {formatMedicationDetailLine(t, uiLang, {
                                dosage: item.dosage,
                                frequency: item.frequency,
                                duration: item.duration,
                                detail: '',
                                emptyFallback: t('patient.prescriptions.dosagePending'),
                              }) ||
                                t('patient.prescriptions.dosagePending')}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.is_dispensed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.is_dispensed
                              ? t('patient.prescriptions.dispensed')
                              : t('patient.prescriptions.pendingItem')}
                          </span>
                        </div>

                        {item.instructions ? (
                          <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600" />
                              <p className="text-sm text-slate-800 leading-relaxed">{item.instructions}</p>
                            </div>
                          </div>
                        ) : null}

                        {item.quantity !== null ? (
                          <p className="mt-4 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">{t('patient.prescriptions.quantity')}</span>{' '}
                            {formatLocaleDigits(item.quantity, uiLang)}
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => handleRefillRequest(item.medication_name)}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                        >
                          <Bell className="h-4 w-4" />
                          {t('patient.prescriptions.refill')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderPastTab = () => (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <span>🕐 {t('patient.prescriptions.historySection')}</span>
          <span className="bg-slate-300 text-white text-xs font-bold rounded-full w-7 h-7 inline-flex items-center justify-center shadow-sm">
            {formatLocaleDigits(pastPrescriptions.length, uiLang)}
          </span>
        </h2>
        <span className="text-sm text-slate-500">
          {t('patient.prescriptions.historyBadge', {
            count: formatLocaleDigits(pastPrescriptions.length, uiLang),
          })}
        </span>
      </div>

      {pastPrescriptions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
          {t('patient.prescriptions.historyEmpty')}
        </div>
      ) : (
        <div className="space-y-4">
          {pastPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {prescription.items[0] ? (
                        <>
                          <MedicationNameDisplay
                            canonicalName={prescription.items[0].medication_name}
                            localizedName={prescription.items[0].medication_name_ar}
                            language={uiLang}
                            primaryClassName="block text-lg font-bold text-slate-900"
                            secondaryClassName="block text-sm font-normal text-slate-600 mt-0.5"
                          />
                          {prescription.items.length > 1
                            ? ` ${t('shared.moreSuffix', {
                                count: formatLocaleDigits(prescription.items.length - 1, uiLang),
                              })}`
                            : ''}
                        </>
                      ) : (
                        t('shared.medicationPlan')
                      )}
                    </h3>
                    <p className="text-slate-600 text-sm">
                      {t('patient.prescriptions.prescribedBy')} {prescription.doctorName}
                      {prescription.doctorSpecialty ? ` - ${prescription.doctorSpecialty}` : ''}
                    </p>
                  </div>
                </div>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {prescriptionStatusLabel(t, prescription.status)}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-slate-600">
                <div>
                  <span className="font-semibold text-slate-900">{t('patient.prescriptions.prescribedOn')}:</span>{' '}
                  {formatDate(prescription.prescribed_at)}
                </div>
                <div>
                  <span className="font-semibold text-slate-900">{t('patient.prescriptions.medItems')}:</span>{' '}
                  {formatLocaleDigits(prescription.items.length, uiLang)}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/patient/messages?doctor=${prescription.doctor_id}`)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-200 px-3 py-1 text-xs font-semibold text-cyan-700 transition hover:bg-cyan-50"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{t('patient.messages.messagePrescriber')}</span>
                </button>
                {prescription.items.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                  >
                    <MedicationNameDisplay
                      canonicalName={item.medication_name}
                      localizedName={item.medication_name_ar}
                      language={uiLang}
                      variant="compact"
                    />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEmptyTab = (
    icon: React.ReactNode,
    titleKey: string,
    bodyKey: string
  ) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-500">
        {icon}
      </div>
      <h3 className="font-playfair text-xl font-bold text-slate-900">{t(titleKey)}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">{t(bodyKey)}</p>
    </div>
  );

  const tabs: Array<{ key: MedicationTab; labelKey: string; emoji: string; count?: number }> = [
    { key: 'active', labelKey: 'patient.prescriptions.tabActive', emoji: '💊', count: activePlanCount },
    { key: 'schedule', labelKey: 'patient.prescriptions.tabSchedule', emoji: '📅' },
    { key: 'reminders', labelKey: 'patient.prescriptions.tabReminders', emoji: '📋' },
    { key: 'past', labelKey: 'patient.prescriptions.tabPast', emoji: '🕐', count: pastPlanCount },
    { key: 'costs', labelKey: 'patient.prescriptions.tabCosts', emoji: '💰' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 animate-fadeIn">
        <div>
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            {t('patient.prescriptions.title')} 💊
          </h1>
          <p className="mt-2 text-[15px] text-slate-400">{t('patient.prescriptions.subtitleLive')}</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ceenai-blue to-ceenai-cyan px-6 py-3 text-white shadow-lg shadow-ceenai-blue/30">
          <Pill className="h-4 w-4" />
          <span className="text-[13px] font-bold">
            {t('patient.prescriptions.activeMeds')}: {formatLocaleDigits(activeMedicationCount, uiLang)}
          </span>
        </div>
      </div>

      <div>
        {error ? (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {t('patient.prescriptions.loadError')}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3 mb-6 animate-slideUp" style={{ animationDelay: '80ms' }}>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-ceenai-blue" />
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-slate-900">
                  {formatLocaleDigits(activePlanCount, uiLang)}
                </div>
                <div className="text-xs text-slate-400">{t('patient.prescriptions.activePlans')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Pill className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-slate-900">
                  {formatLocaleDigits(activeMedicationCount, uiLang)}
                </div>
                <div className="text-xs text-slate-400">{t('patient.prescriptions.activeMeds')}</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 animate-glow">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                <Bell className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="text-3xl font-mono font-bold text-amber-600">
                  {formatLocaleDigits(pendingDispenseCount, uiLang)}
                </div>
                <div className="text-xs text-slate-400">{t('patient.prescriptions.pendingPickup')}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('patient.prescriptions.searchPh')}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ceenai-blue/20 focus:border-ceenai-blue"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'history')}
              className="w-full md:w-auto rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ceenai-blue/20 focus:border-ceenai-blue"
            >
              <option value="all">{t('patient.prescriptions.filterAll')}</option>
              <option value="active">{t('patient.prescriptions.filterActive')}</option>
              <option value="history">{t('patient.prescriptions.filterHistory')}</option>
            </select>
          </div>
          {selectedMedication ? (
            <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
              <span className="font-semibold">{t('patient.prescriptions.selected')}</span>{' '}
              {selectedPrescriptionItem ? (
                <MedicationNameDisplay
                  canonicalName={selectedPrescriptionItem.medication_name}
                  localizedName={selectedPrescriptionItem.medication_name_ar}
                  language={uiLang}
                  variant="compact"
                  primaryClassName="text-cyan-900"
                />
              ) : (
                selectedMedication
              )}
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-2xl shadow-sm mb-6 animate-slideUp" style={{ animationDelay: '160ms' }}>
          <div className="border-b border-slate-100 px-6 overflow-x-auto">
            <div className="flex gap-6 sm:gap-8 min-w-max">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`py-4 px-2 text-[15px] font-medium transition-all duration-300 relative whitespace-nowrap ${
                      isActive ? 'text-ceenai-blue' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{tab.emoji}</span>
                      {t(tab.labelKey)}
                      {typeof tab.count === 'number' ? (
                        <span
                          className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                            tab.key === 'past'
                              ? 'bg-slate-400 text-white'
                              : 'bg-ceenai-blue text-white'
                          }`}
                        >
                          {formatLocaleDigits(tab.count, uiLang)}
                        </span>
                      ) : null}
                    </span>
                    {isActive ? <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-ceenai-blue" /> : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'active' ? renderActiveTab() : null}
            {activeTab === 'schedule'
              ? renderEmptyTab(
                  <CalendarClock className="w-7 h-7" />,
                  'patient.prescriptions.scheduleEmptyTitle',
                  'patient.prescriptions.scheduleEmptyBody'
                )
              : null}
            {activeTab === 'reminders'
              ? renderEmptyTab(
                  <Bell className="w-7 h-7" />,
                  'patient.prescriptions.remindersEmptyTitle',
                  'patient.prescriptions.remindersEmptyBody'
                )
              : null}
            {activeTab === 'past' ? renderPastTab() : null}
            {activeTab === 'costs'
              ? renderEmptyTab(
                  <CreditCard className="w-7 h-7" />,
                  'patient.prescriptions.costsEmptyTitle',
                  'patient.prescriptions.costsEmptyBody'
                )
              : null}
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm text-cyan-700">
          {t('patient.prescriptions.footerNote')}
        </div>
      </div>
    </>
  );
};
