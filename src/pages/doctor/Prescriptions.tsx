import React from 'react';
import { Pill } from 'lucide-react';

export const DoctorPrescriptions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Prescriptions</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No prescriptions issued</p>
        </div>
      </div>
    </div>
  );
};
