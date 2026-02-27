import React from 'react';
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const DoctorAppointments: React.FC = () => {
  const appointments = [
    {
      id: 1,
      patient: 'Ahmed Al Maktoum',
      time: '9:00 AM',
      duration: '30 min',
      type: 'in-person',
      reason: 'Annual Checkup',
      status: 'confirmed'
    },
    {
      id: 2,
      patient: 'Fatima Hassan',
      time: '10:00 AM',
      duration: '45 min',
      type: 'video',
      reason: 'Follow-up Consultation',
      status: 'confirmed'
    },
    {
      id: 3,
      patient: 'Mohammed Ali',
      time: '11:30 AM',
      duration: '30 min',
      type: 'in-person',
      reason: 'Lab Results Review',
      status: 'pending'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Appointments"
        subtitle="Manage your patient appointments"
        icon={<Calendar className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Schedule</h2>
          <p className="text-gray-600">Thursday, February 27, 2026</p>
        </div>

        <div className="grid gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
              <div className={`p-4 ${appointment.type === 'video' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                      {appointment.type === 'video' ? (
                        <Video className="w-5 h-5 text-white" />
                      ) : (
                        <MapPin className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{appointment.patient}</h3>
                      <p className="text-white/90 text-sm">{appointment.reason}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    appointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Time</p>
                      <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">{appointment.duration}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Type</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{appointment.type}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <User className="w-4 h-4" />
                    <span>View Patient</span>
                  </button>
                  <button className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold">
                    Reschedule
                  </button>
                  <button className="px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
