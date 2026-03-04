import React from 'react';
import { Pill } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const DoctorPrescriptions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Prescriptions"
        subtitle="Manage your prescriptions"
        icon={<Pill className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No prescriptions issued</p>
        </div>
      </div>
    </div>
  );
};
