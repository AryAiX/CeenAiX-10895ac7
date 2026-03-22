import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  FileText,
  Filter,
  Plus,
  Save,
  Search,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Trash2,
  X,
} from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { Skeleton } from '../../components/Skeleton';
import { usePatientRecords } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';
import type { AllergySeverity, ConditionStatus } from '../../types';

type RecordCategoryFilter = 'all' | 'condition' | 'allergy' | 'vaccination';
type RecordCategory = Exclude<RecordCategoryFilter, 'all'>;

interface RecordEntry {
  id: string;
  category: RecordCategory;
  title: string;
  subtitle: string | null;
  description: string | null;
  statusLabel: string;
  sortValue: string | null;
  dateLabel: string | null;
  metadata: string[];
  searchText: string;
}

interface ConditionFormState {
  conditionName: string;
  icdCode: string;
  diagnosedDate: string;
  status: ConditionStatus;
  notes: string;
}

interface AllergyFormState {
  allergen: string;
  severity: AllergySeverity;
  reaction: string;
  confirmedByDoctor: boolean;
}

interface VaccinationFormState {
  vaccineName: string;
  doseNumber: string;
  administeredDate: string;
  administeredBy: string;
  nextDoseDue: string;
}

const initialConditionForm: ConditionFormState = {
  conditionName: '',
  icdCode: '',
  diagnosedDate: '',
  status: 'active',
  notes: '',
};

const initialAllergyForm: AllergyFormState = {
  allergen: '',
  severity: 'mild',
  reaction: '',
  confirmedByDoctor: false,
};

const initialVaccinationForm: VaccinationFormState = {
  vaccineName: '',
  doseNumber: '',
  administeredDate: '',
  administeredBy: '',
  nextDoseDue: '',
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getCategoryLabel = (category: RecordCategory) => {
  if (category === 'condition') {
    return 'Condition';
  }

  if (category === 'allergy') {
    return 'Allergy';
  }

  return 'Vaccination';
};

const getStatusClasses = (category: RecordCategory, statusLabel: string) => {
  if (category === 'allergy') {
    if (statusLabel === 'severe') {
      return 'bg-red-100 text-red-700';
    }

    if (statusLabel === 'moderate') {
      return 'bg-amber-100 text-amber-700';
    }

    return 'bg-emerald-100 text-emerald-700';
  }

  if (category === 'vaccination') {
    return 'bg-violet-100 text-violet-700';
  }

  if (statusLabel === 'chronic') {
    return 'bg-red-100 text-red-700';
  }

  if (statusLabel === 'resolved') {
    return 'bg-emerald-100 text-emerald-700';
  }

  return 'bg-cyan-100 text-cyan-700';
};

const getCategoryIcon = (category: RecordCategory) => {
  if (category === 'condition') {
    return <Stethoscope className="h-5 w-5 text-cyan-600" />;
  }

  if (category === 'allergy') {
    return <ShieldAlert className="h-5 w-5 text-amber-600" />;
  }

  return <Syringe className="h-5 w-5 text-violet-600" />;
};

export const PatientRecords: React.FC = () => {
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
    refetch,
  } = usePatientRecords(user?.id);
  const [filterType, setFilterType] = useState<RecordCategoryFilter>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeForm, setActiveForm] = useState<RecordCategory | null>(null);
  const [conditionForm, setConditionForm] = useState<ConditionFormState>(initialConditionForm);
  const [allergyForm, setAllergyForm] = useState<AllergyFormState>(initialAllergyForm);
  const [vaccinationForm, setVaccinationForm] = useState<VaccinationFormState>(initialVaccinationForm);
  const [submittingForm, setSubmittingForm] = useState<RecordCategory | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const conditions = useMemo(() => data?.conditions ?? [], [data?.conditions]);
  const allergies = useMemo(() => data?.allergies ?? [], [data?.allergies]);
  const vaccinations = useMemo(() => data?.vaccinations ?? [], [data?.vaccinations]);

  const records = useMemo<RecordEntry[]>(() => {
    const conditionEntries = conditions.map((condition) => ({
      id: condition.id,
      category: 'condition' as const,
      title: condition.condition_name,
      subtitle: condition.icd_code ? `ICD ${condition.icd_code}` : null,
      description: condition.notes ?? null,
      statusLabel: condition.status,
      sortValue: condition.diagnosed_date ?? condition.created_at,
      dateLabel: formatDate(condition.diagnosed_date) ?? formatDate(condition.created_at),
      metadata: [
        getCategoryLabel('condition'),
        condition.status.replace('_', ' '),
      ],
      searchText: [
        condition.condition_name,
        condition.icd_code,
        condition.notes,
        condition.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));

    const allergyEntries = allergies.map((allergy) => ({
      id: allergy.id,
      category: 'allergy' as const,
      title: allergy.allergen,
      subtitle: allergy.reaction ? `Reaction: ${allergy.reaction}` : null,
      description: allergy.confirmed_by_doctor
        ? 'Marked as doctor-confirmed in your profile.'
        : 'Patient-entered allergy record.',
      statusLabel: allergy.severity,
      sortValue: allergy.created_at,
      dateLabel: formatDate(allergy.created_at),
      metadata: [
        getCategoryLabel('allergy'),
        allergy.confirmed_by_doctor ? 'Doctor confirmed' : 'Self reported',
      ],
      searchText: [
        allergy.allergen,
        allergy.reaction,
        allergy.severity,
        allergy.confirmed_by_doctor ? 'doctor confirmed' : 'self reported',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));

    const vaccinationEntries = vaccinations.map((vaccination) => ({
      id: vaccination.id,
      category: 'vaccination' as const,
      title: vaccination.vaccine_name,
      subtitle: vaccination.administered_by ? `Given by ${vaccination.administered_by}` : null,
      description: vaccination.next_dose_due
        ? `Next dose due ${formatDate(vaccination.next_dose_due) ?? 'soon'}`
        : 'No next dose scheduled.',
      statusLabel:
        vaccination.dose_number !== null ? `Dose ${vaccination.dose_number}` : 'Recorded',
      sortValue: vaccination.administered_date ?? vaccination.created_at,
      dateLabel: formatDate(vaccination.administered_date) ?? formatDate(vaccination.created_at),
      metadata: [
        getCategoryLabel('vaccination'),
        vaccination.next_dose_due ? 'Follow-up due' : 'Course logged',
      ],
      searchText: [
        vaccination.vaccine_name,
        vaccination.administered_by,
        vaccination.next_dose_due,
        vaccination.dose_number?.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase(),
    }));

    return [...conditionEntries, ...allergyEntries, ...vaccinationEntries];
  }, [allergies, conditions, vaccinations]);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const matchesType = filterType === 'all' || record.category === filterType;
        const matchesSearch =
          searchQuery.trim().length === 0 || record.searchText.includes(searchQuery.trim().toLowerCase());
        return matchesType && matchesSearch;
      }),
    [filterType, records, searchQuery]
  );

  const sortedRecords = useMemo(() => {
    const entries = [...filteredRecords];

    entries.sort((left, right) => {
      if (sortOrder === 'alphabetical') {
        return left.title.localeCompare(right.title);
      }

      const leftDate = left.sortValue ? new Date(left.sortValue).getTime() : 0;
      const rightDate = right.sortValue ? new Date(right.sortValue).getTime() : 0;

      if (sortOrder === 'oldest') {
        return leftDate - rightDate;
      }

      return rightDate - leftDate;
    });

    return entries;
  }, [filteredRecords, sortOrder]);

  const totalRecords = records.length;

  const resetForms = () => {
    setConditionForm(initialConditionForm);
    setAllergyForm(initialAllergyForm);
    setVaccinationForm(initialVaccinationForm);
    setActiveForm(null);
  };

  const handleCreateCondition = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      return;
    }

    setFeedback(null);
    setSubmittingForm('condition');

    const { error: insertError } = await supabase.from('medical_conditions').insert({
      patient_id: user.id,
      condition_name: conditionForm.conditionName.trim(),
      icd_code: conditionForm.icdCode.trim() || null,
      diagnosed_date: conditionForm.diagnosedDate || null,
      status: conditionForm.status,
      notes: conditionForm.notes.trim() || null,
    });

    setSubmittingForm(null);

    if (insertError) {
      setFeedback({ type: 'error', message: insertError.message });
      return;
    }

    setFeedback({ type: 'success', message: 'Condition added to your medical record.' });
    resetForms();
    refetch();
  };

  const handleCreateAllergy = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      return;
    }

    setFeedback(null);
    setSubmittingForm('allergy');

    const { error: insertError } = await supabase.from('allergies').insert({
      patient_id: user.id,
      allergen: allergyForm.allergen.trim(),
      severity: allergyForm.severity,
      reaction: allergyForm.reaction.trim() || null,
      confirmed_by_doctor: allergyForm.confirmedByDoctor,
    });

    setSubmittingForm(null);

    if (insertError) {
      setFeedback({ type: 'error', message: insertError.message });
      return;
    }

    setFeedback({ type: 'success', message: 'Allergy added to your medical record.' });
    resetForms();
    refetch();
  };

  const handleCreateVaccination = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user?.id) {
      return;
    }

    setFeedback(null);
    setSubmittingForm('vaccination');

    const parsedDoseNumber = vaccinationForm.doseNumber.trim()
      ? Number(vaccinationForm.doseNumber)
      : null;

    const { error: insertError } = await supabase.from('vaccinations').insert({
      patient_id: user.id,
      vaccine_name: vaccinationForm.vaccineName.trim(),
      dose_number: Number.isFinite(parsedDoseNumber) ? parsedDoseNumber : null,
      administered_date: vaccinationForm.administeredDate || null,
      administered_by: vaccinationForm.administeredBy.trim() || null,
      next_dose_due: vaccinationForm.nextDoseDue || null,
    });

    setSubmittingForm(null);

    if (insertError) {
      setFeedback({ type: 'error', message: insertError.message });
      return;
    }

    setFeedback({ type: 'success', message: 'Vaccination record added successfully.' });
    resetForms();
    refetch();
  };

  const handleDeleteRecord = async (record: RecordEntry) => {
    if (!user?.id) {
      return;
    }

    const tableName =
      record.category === 'condition'
        ? 'medical_conditions'
        : record.category === 'allergy'
          ? 'allergies'
          : 'vaccinations';

    setFeedback(null);
    setBusyDeleteId(record.id);

    const { error: deleteError } = await supabase
      .from(tableName)
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', record.id)
      .eq('patient_id', user.id);

    setBusyDeleteId(null);

    if (deleteError) {
      setFeedback({ type: 'error', message: deleteError.message });
      return;
    }

    setFeedback({ type: 'success', message: `${getCategoryLabel(record.category)} removed from your record.` });
    refetch();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />

      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Medical Records"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">Medical Records</h1>
          <p className="text-cyan-100 text-lg">Access and manage your health documents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Conditions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{conditions.length}</p>
            <p className="mt-1 text-sm text-cyan-600">Tracked diagnoses</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Allergies</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{allergies.length}</p>
            <p className="mt-1 text-sm text-amber-600">Severity-aware alerts</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Vaccinations</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{vaccinations.length}</p>
            <p className="mt-1 text-sm text-violet-600">Immunization history</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-600">Total entries</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{totalRecords}</p>
            <p className="mt-1 text-sm text-emerald-600">Patient-managed records</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search conditions, allergies, vaccinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as RecordCategoryFilter)}
                  className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Records</option>
                  <option value="condition">Conditions</option>
                  <option value="allergy">Allergies</option>
                  <option value="vaccination">Vaccinations</option>
                </select>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest' | 'alphabetical')}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium appearance-none bg-white cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedRecords.length}</span> of <span className="font-semibold text-gray-900">{totalRecords}</span> records
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveForm('condition')}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
              >
                <Plus className="h-4 w-4" />
                Add condition
              </button>
              <button
                type="button"
                onClick={() => setActiveForm('allergy')}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 px-3 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                <Plus className="h-4 w-4" />
                Add allergy
              </button>
              <button
                type="button"
                onClick={() => setActiveForm('vaccination')}
                className="inline-flex items-center gap-2 rounded-xl border border-violet-200 px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                <Plus className="h-4 w-4" />
                Add vaccination
              </button>
            </div>
          </div>
        </div>

        {feedback ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            We could not load your medical record right now. Please try again shortly.
          </div>
        ) : null}

        {activeForm === 'condition' ? (
          <form onSubmit={handleCreateCondition} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add condition</h2>
                <p className="mt-1 text-sm text-gray-600">Capture diagnoses and important health history for future care.</p>
              </div>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Condition name</span>
                <input
                  required
                  type="text"
                  value={conditionForm.conditionName}
                  onChange={(event) =>
                    setConditionForm((current) => ({ ...current, conditionName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">ICD code</span>
                <input
                  type="text"
                  value={conditionForm.icdCode}
                  onChange={(event) =>
                    setConditionForm((current) => ({ ...current, icdCode: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Diagnosed date</span>
                <input
                  type="date"
                  value={conditionForm.diagnosedDate}
                  onChange={(event) =>
                    setConditionForm((current) => ({ ...current, diagnosedDate: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Status</span>
                <select
                  value={conditionForm.status}
                  onChange={(event) =>
                    setConditionForm((current) => ({
                      ...current,
                      status: event.target.value as ConditionStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  <option value="active">Active</option>
                  <option value="chronic">Chronic</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Notes</span>
                <textarea
                  rows={4}
                  value={conditionForm.notes}
                  onChange={(event) =>
                    setConditionForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submittingForm === 'condition'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {submittingForm === 'condition' ? 'Saving...' : 'Save condition'}
              </button>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {activeForm === 'allergy' ? (
          <form onSubmit={handleCreateAllergy} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add allergy</h2>
                <p className="mt-1 text-sm text-gray-600">Document allergens and reactions so they are always visible during care.</p>
              </div>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Allergen</span>
                <input
                  required
                  type="text"
                  value={allergyForm.allergen}
                  onChange={(event) =>
                    setAllergyForm((current) => ({ ...current, allergen: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Severity</span>
                <select
                  value={allergyForm.severity}
                  onChange={(event) =>
                    setAllergyForm((current) => ({
                      ...current,
                      severity: event.target.value as AllergySeverity,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Reaction</span>
                <textarea
                  rows={4}
                  value={allergyForm.reaction}
                  onChange={(event) =>
                    setAllergyForm((current) => ({ ...current, reaction: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                />
              </label>
              <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 md:col-span-2">
                <input
                  type="checkbox"
                  checked={allergyForm.confirmedByDoctor}
                  onChange={(event) =>
                    setAllergyForm((current) => ({
                      ...current,
                      confirmedByDoctor: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                Mark this allergy as doctor-confirmed
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submittingForm === 'allergy'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {submittingForm === 'allergy' ? 'Saving...' : 'Save allergy'}
              </button>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {activeForm === 'vaccination' ? (
          <form onSubmit={handleCreateVaccination} className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add vaccination</h2>
                <p className="mt-1 text-sm text-gray-600">Log immunizations and any future doses you need to follow up on.</p>
              </div>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Vaccine name</span>
                <input
                  required
                  type="text"
                  value={vaccinationForm.vaccineName}
                  onChange={(event) =>
                    setVaccinationForm((current) => ({ ...current, vaccineName: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Dose number</span>
                <input
                  type="number"
                  min="1"
                  value={vaccinationForm.doseNumber}
                  onChange={(event) =>
                    setVaccinationForm((current) => ({ ...current, doseNumber: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Administered date</span>
                <input
                  type="date"
                  value={vaccinationForm.administeredDate}
                  onChange={(event) =>
                    setVaccinationForm((current) => ({
                      ...current,
                      administeredDate: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-gray-700">Administered by</span>
                <input
                  type="text"
                  value={vaccinationForm.administeredBy}
                  onChange={(event) =>
                    setVaccinationForm((current) => ({
                      ...current,
                      administeredBy: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-gray-700">Next dose due</span>
                <input
                  type="date"
                  value={vaccinationForm.nextDoseDue}
                  onChange={(event) =>
                    setVaccinationForm((current) => ({ ...current, nextDoseDue: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </label>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submittingForm === 'vaccination'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {submittingForm === 'vaccination' ? 'Saving...' : 'Save vaccination'}
              </button>
              <button
                type="button"
                onClick={resetForms}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : sortedRecords.length === 0 ? (
          <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
              <img
                src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Medical Records"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching records yet</h3>
              <p className="text-gray-600">
                Add conditions, allergies, and vaccinations so your medical history is available throughout the patient experience.
              </p>
              <button
                type="button"
                onClick={() => setActiveForm('condition')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Add your first record
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedRecords.map((record) => (
              <div key={record.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-gray-50 p-3">{getCategoryIcon(record.category)}</div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{record.title}</h3>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase text-gray-600">
                          {getCategoryLabel(record.category)}
                        </span>
                      </div>
                      {record.subtitle ? (
                        <p className="mt-1 text-sm font-medium text-gray-600">{record.subtitle}</p>
                      ) : null}
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase ${getStatusClasses(
                      record.category,
                      record.statusLabel
                    )}`}
                  >
                    {record.statusLabel}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {record.metadata.map((item) => (
                    <span
                      key={`${record.id}-${item}`}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                  {record.dateLabel ? (
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
                      Recorded {record.dateLabel}
                    </span>
                  ) : null}
                </div>

                {record.description ? (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                    {record.description}
                  </div>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleDeleteRecord(record)}
                    disabled={busyDeleteId === record.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {busyDeleteId === record.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalRecords > 0 ? (
          <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4 text-sm text-cyan-900">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-700" />
              <p>
                Keep this record current so future AI and care workflows can use accurate medical history automatically.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
