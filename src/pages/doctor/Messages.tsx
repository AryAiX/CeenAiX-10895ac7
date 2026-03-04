import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const DoctorMessages: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Messages"
        subtitle="Communicate with your patients"
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No messages</p>
        </div>
      </div>
    </div>
  );
};
