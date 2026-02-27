import React from 'react';
import { Activity, Heart, Calendar, TrendingUp } from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, Patient
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Health Score</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">85</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Appointments</p>
                <p className="text-3xl font-bold text-green-600 mt-2">0</p>
              </div>
              <Calendar className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Prescriptions</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
              </div>
              <Activity className="w-10 h-10 text-orange-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Wellness</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">Good</p>
              </div>
              <Heart className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
