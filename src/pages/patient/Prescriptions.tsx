import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Pill,
  Search,
} from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { Skeleton } from '../../components/Skeleton';
import { usePatientPrescriptions } from '../../hooks';
import { useAuth } from '../../lib/auth-context';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const formatPrescriptionStatus = (value: string) => value.replace('_', ' ');

export const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
  } = usePatientPrescriptions(user?.id);
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'history'>('all');

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

  const handleRefillRequest = (medicationName: string) => {
    setSelectedMedication(medicationName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="patient" />
        <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img
              src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Pharmacy"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-2">My Prescriptions</h1>
          <p className="text-cyan-100 text-lg">Track active medications and review historical prescriptions</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />

      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Pharmacy"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">My Prescriptions</h1>
          <p className="text-cyan-100 text-lg">Live medication data from canonical prescriptions and prescription items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            We could not load your prescription history right now. Please try again shortly.
          </div>
        ) : null}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Plans</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {prescriptions.filter((prescription) => prescription.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Medications</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{activeMedicationCount}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Pill className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Pickup</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{pendingDispenseCount}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search medications, dosage, or prescribing doctor..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'history')}
              className="w-full md:w-auto rounded-xl border-2 border-gray-200 px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="history">Completed or cancelled</option>
            </select>
          </div>
          {selectedMedication ? (
            <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
              <span className="font-semibold">Selected medication:</span> {selectedMedication}
            </div>
          ) : null}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Prescriptions</h2>
              <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold">
                {activePrescriptions.length} Active
              </span>
            </div>

            {activePrescriptions.length === 0 ? (
              <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                  <img
                    src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=400"
                    alt="Pharmacy"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Pill className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No active prescriptions</h3>
                  <p className="text-gray-600">Once a doctor issues medication, it will appear here with all prescription items.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activePrescriptions.map((prescription) => {
                  const pendingItems = prescription.items.filter((item) => !item.is_dispensed).length;

                  return (
                    <div
                      key={prescription.id}
                      className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                        <div className="absolute inset-0 opacity-10">
                          <img
                            src="https://images.pexels.com/photos/3873146/pexels-photo-3873146.jpeg?auto=compress&cs=tinysrgb&w=600"
                            alt="Medication"
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
                                {prescription.items[0]?.medication_name ?? 'Medication plan'}
                                {prescription.items.length > 1 ? ` + ${prescription.items.length - 1} more` : ''}
                              </h3>
                              <p className="text-cyan-100 text-sm mt-1">
                                Prescribed by {prescription.doctorName}
                                {prescription.doctorSpecialty ? ` - ${prescription.doctorSpecialty}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {pendingItems > 0 ? (
                              <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                                {pendingItems} pending pickup
                              </span>
                            ) : null}
                            <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold border border-white/30 uppercase">
                              {formatPrescriptionStatus(prescription.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid gap-4 md:grid-cols-3 mb-6">
                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>Prescribed</span>
                            </div>
                            <p className="mt-2 font-semibold text-gray-900">{formatDate(prescription.prescribed_at)}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                              <Package className="h-4 w-4" />
                              <span>Medication items</span>
                            </div>
                            <p className="mt-2 font-semibold text-gray-900">{prescription.items.length}</p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-4">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500">
                              <Clock className="h-4 w-4" />
                              <span>Dispensing status</span>
                            </div>
                            <p className="mt-2 font-semibold text-gray-900">
                              {prescription.items.filter((item) => item.is_dispensed).length}/{prescription.items.length} dispensed
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          {prescription.items.map((item) => (
                            <div key={item.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900">{item.medication_name}</h4>
                                  <p className="mt-1 text-sm text-gray-600">
                                    {[item.dosage, item.frequency, item.duration].filter(Boolean).join(' • ') || 'Dosage details pending'}
                                  </p>
                                </div>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    item.is_dispensed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                  }`}
                                >
                                  {item.is_dispensed ? 'Dispensed' : 'Pending pickup'}
                                </span>
                              </div>

                              {item.instructions ? (
                                <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
                                  <div className="flex items-start gap-3">
                                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600" />
                                    <p className="text-sm text-gray-800 leading-relaxed">{item.instructions}</p>
                                  </div>
                                </div>
                              ) : null}

                              {item.quantity !== null ? (
                                <p className="mt-4 text-sm text-gray-600">
                                  <span className="font-semibold text-gray-900">Quantity:</span> {item.quantity}
                                </p>
                              ) : null}

                              <button
                                type="button"
                                onClick={() => handleRefillRequest(item.medication_name)}
                                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-50"
                              >
                                <Bell className="h-4 w-4" />
                                Mark for refill follow-up
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

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Prescription History</h2>
              <span className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-sm font-bold">
                {pastPrescriptions.length} Historical
              </span>
            </div>

            {pastPrescriptions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600">
                Past prescriptions will appear here once a medication plan is completed or cancelled.
              </div>
            ) : (
              <div className="space-y-4">
                {pastPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                          <Pill className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {prescription.items[0]?.medication_name ?? 'Medication plan'}
                            {prescription.items.length > 1 ? ` + ${prescription.items.length - 1} more` : ''}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Prescribed by {prescription.doctorName}
                            {prescription.doctorSpecialty ? ` - ${prescription.doctorSpecialty}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                        {formatPrescriptionStatus(prescription.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-900">Prescribed:</span> {formatDate(prescription.prescribed_at)}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900">Medication items:</span> {prescription.items.length}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {prescription.items.map((item) => (
                        <span
                          key={item.id}
                          className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
                        >
                          {item.medication_name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4 text-sm text-cyan-900">
          This page now reads normalized prescription headers and medication items. Pharmacy directory workflows stay out of scope for MVP.
        </div>
      </div>
    </div>
  );
};
