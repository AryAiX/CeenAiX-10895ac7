import React from 'react';
import { Calendar, Clock, MapPin, Video, Plus } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const PatientAppointments: React.FC = () => {
  const upcomingAppointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: '2026-03-02',
      time: '10:00 AM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      reason: 'Annual Checkup'
    },
    {
      id: 2,
      doctor: 'Dr. Mohammed Hassan',
      specialty: 'Cardiology',
      date: '2026-03-05',
      time: '2:30 PM',
      type: 'video',
      location: 'Video Consultation',
      reason: 'Follow-up Consultation'
    }
  ];

  const pastAppointments = [
    {
      id: 3,
      doctor: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: '2026-02-15',
      time: '11:00 AM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      reason: 'Flu Symptoms'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Appointments"
        subtitle="Manage your medical appointments"
        icon={<Calendar className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
        actions={
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            <span>Book Appointment</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {upcomingAppointments.length} Scheduled
              </span>
            </div>

            <div className="grid gap-6">
              {upcomingAppointments.map((appointment) => (
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
                          <h3 className="text-lg font-bold text-white">{appointment.doctor}</h3>
                          <p className="text-white/90 text-sm">{appointment.specialty}</p>
                        </div>
                      </div>
                      <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                        {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Date</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Clock className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">Time</p>
                            <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                          <p className="text-sm text-gray-700">{appointment.location}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-1">Reason</p>
                          <p className="text-sm text-gray-700">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-100">
                      <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                        {appointment.type === 'video' ? 'Join Video Call' : 'Get Directions'}
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

          {/* Past Appointments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Past Appointments</h2>
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                {pastAppointments.length} Completed
              </span>
            </div>

            <div className="grid gap-6">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                  <div className="bg-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-200 p-2 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{appointment.doctor}</h3>
                          <p className="text-gray-600 text-sm">{appointment.specialty}</p>
                        </div>
                      </div>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                        COMPLETED
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Date</p>
                        <p className="text-gray-900 font-semibold">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Time</p>
                        <p className="text-gray-900 font-semibold">{appointment.time}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Reason</p>
                        <p className="text-gray-900 font-semibold">{appointment.reason}</p>
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
