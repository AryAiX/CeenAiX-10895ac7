import React from 'react';
import { Pill, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const PatientPrescriptions: React.FC = () => {
  const activePrescriptions = [
    {
      id: 1,
      medication: 'Amoxicillin 500mg',
      doctor: 'Dr. Sarah Ahmed',
      dosage: '1 tablet, 3 times daily',
      duration: '7 days',
      startDate: '2026-02-20',
      endDate: '2026-02-27',
      instructions: 'Take with food. Complete full course.',
      status: 'active'
    },
    {
      id: 2,
      medication: 'Lisinopril 10mg',
      doctor: 'Dr. Mohammed Hassan',
      dosage: '1 tablet once daily',
      duration: 'Ongoing',
      startDate: '2026-01-15',
      endDate: null,
      instructions: 'Take in the morning. Monitor blood pressure.',
      status: 'active'
    }
  ];

  const pastPrescriptions = [
    {
      id: 3,
      medication: 'Ibuprofen 400mg',
      doctor: 'Dr. Sarah Ahmed',
      dosage: '1 tablet as needed',
      duration: '10 days',
      startDate: '2026-01-10',
      endDate: '2026-01-20',
      instructions: 'Take with food for pain relief.',
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Prescriptions"
        subtitle="View and manage your prescriptions"
        icon={<Pill className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Active Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Prescriptions</h2>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {activePrescriptions.length} Active
              </span>
            </div>

            <div className="grid gap-6">
              {activePrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                          <Pill className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{prescription.medication}</h3>
                          <p className="text-green-100 text-sm">Prescribed by {prescription.doctor}</p>
                        </div>
                      </div>
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ACTIVE
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Dosage Information</h4>
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{prescription.dosage}</p>
                              <p className="text-xs text-gray-500">Duration: {prescription.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-600">Start: {new Date(prescription.startDate).toLocaleDateString()}</p>
                              {prescription.endDate && (
                                <p className="text-sm text-gray-600">End: {new Date(prescription.endDate).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Instructions</h4>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{prescription.instructions}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Prescriptions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Past Prescriptions</h2>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {pastPrescriptions.length} Completed
              </span>
            </div>

            <div className="grid gap-6">
              {pastPrescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                  <div className="bg-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-lg">
                          <Pill className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{prescription.medication}</h3>
                          <p className="text-gray-600 text-sm">Prescribed by {prescription.doctor}</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        COMPLETED
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600"><span className="font-medium">Dosage:</span> {prescription.dosage}</p>
                        <p className="text-sm text-gray-600 mt-1"><span className="font-medium">Duration:</span> {prescription.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          {new Date(prescription.startDate).toLocaleDateString()} - {new Date(prescription.endDate!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
