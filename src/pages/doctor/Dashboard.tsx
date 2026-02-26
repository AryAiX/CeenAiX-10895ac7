import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Activity, Users, Calendar, FileText } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Welcome, Dr. {userProfile?.full_name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">0</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Today's Appointments</p>
                <p className="text-3xl font-bold text-green-600 mt-2">0</p>
              </div>
              <Calendar className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">0</p>
              </div>
              <FileText className="w-10 h-10 text-orange-200" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Cases</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">0</p>
              </div>
              <Activity className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
