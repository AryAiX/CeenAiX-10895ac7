import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { userProfile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userProfile?.full_name}</h2>
              <p className="text-gray-600">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
