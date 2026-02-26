import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Calendar, UserCircle, Shield } from 'lucide-react';

export const DoctorProfile: React.FC = () => {
  const { userProfile, user } = useAuth();

  const infoItems = [
    { icon: Mail, label: 'Email', value: userProfile?.email || 'Not provided' },
    { icon: Phone, label: 'Phone', value: userProfile?.phone || 'Not provided' },
    { icon: Calendar, label: 'Date of Birth', value: userProfile?.date_of_birth ? new Date(userProfile.date_of_birth).toLocaleDateString() : 'Not provided' },
    { icon: UserCircle, label: 'Gender', value: userProfile?.gender || 'Not provided' },
    { icon: Shield, label: 'User ID', value: user?.id || 'N/A' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-white">
                <h2 className="text-3xl font-bold">Dr. {userProfile?.full_name || 'Doctor'}</h2>
                <p className="text-blue-100 mt-1 capitalize">
                  {userProfile?.role || 'Doctor'} Account
                </p>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="mt-1">
                    <item.icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{item.label}</p>
                    <p className="text-base text-gray-900 mt-1">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Debug Section */}
          {userProfile && (
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Data</h3>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(userProfile, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Session Info */}
          {user && (
            <div className="px-8 py-6 bg-blue-50 border-t border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Logged in as:</span> {user.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Last sign in:</span>{' '}
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Account created:</span>{' '}
                  {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
