import React from 'react';
import { Calendar, Clock, MapPin, Video, Star, Phone, MessageSquare, Navigation, CheckCircle } from 'lucide-react';

export const AppointmentDesignShowcase: React.FC = () => {
  const upcomingAppointments = [
    {
      id: 1,
      doctorName: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: 'March 5, 2026',
      time: '10:00 AM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      reason: 'Annual Checkup - Full physical examination',
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 2,
      doctorName: 'Dr. Mohammed Hassan',
      specialty: 'Cardiology',
      date: 'March 8, 2026',
      time: '2:30 PM',
      type: 'video',
      location: 'Video Consultation',
      reason: 'Follow-up: Blood pressure monitoring',
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 3,
      doctorName: 'Dr. Fatima Al-Rashid',
      specialty: 'Dermatology',
      date: 'March 12, 2026',
      time: '9:15 AM',
      type: 'in-person',
      location: 'Mediclinic City Hospital',
      reason: 'Skin consultation - Acne treatment review',
      image: 'https://images.pexels.com/photos/5452274/pexels-photo-5452274.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  const pastAppointments = [
    {
      id: 4,
      doctorName: 'Dr. Ahmed Khalil',
      specialty: 'Orthopedics',
      date: 'February 20, 2026',
      time: '11:00 AM',
      type: 'in-person',
      location: 'NMC Royal Hospital',
      reason: 'Knee pain evaluation and X-ray',
      rating: 5,
      image: 'https://images.pexels.com/photos/5452237/pexels-photo-5452237.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 5,
      doctorName: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: 'February 15, 2026',
      time: '3:30 PM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      reason: 'Flu symptoms and persistent cough',
      rating: 5,
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: 6,
      doctorName: 'Dr. Mohammed Hassan',
      specialty: 'Cardiology',
      date: 'January 28, 2026',
      time: '10:45 AM',
      type: 'video',
      location: 'Video Consultation',
      reason: 'Heart health consultation and ECG review',
      rating: 4,
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Appointment Design Showcase</h1>
          <p className="text-lg text-gray-600">Beautiful, modern appointment card designs</p>
        </div>

        <div className="space-y-12">
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Upcoming Appointments</h2>
                <p className="text-gray-600 mt-1">Next scheduled visits and consultations</p>
              </div>
              <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg">
                {upcomingAppointments.length} Scheduled
              </span>
            </div>

            <div className="grid gap-6">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className={`p-5 ${appointment.type === 'video' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                          {appointment.type === 'video' ? (
                            <Video className="w-6 h-6 text-white" />
                          ) : (
                            <MapPin className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="text-white">
                          <p className="text-sm font-medium opacity-90">
                            {appointment.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                          </p>
                          <p className="text-xs opacity-75">{appointment.location}</p>
                        </div>
                      </div>
                      <div className="text-right text-white">
                        <p className="text-sm font-semibold">{appointment.date}</p>
                        <p className="text-xs opacity-90">{appointment.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={appointment.image}
                        alt={appointment.doctorName}
                        className="w-20 h-20 rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{appointment.doctorName}</h3>
                        <p className="text-sm text-blue-600 font-medium mt-1">{appointment.specialty}</p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.date}</span>
                          <Clock className="w-4 h-4 text-gray-400 ml-3" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700"><span className="font-semibold">Reason:</span> {appointment.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-100">
                      {appointment.type === 'video' ? (
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                          <Video className="w-5 h-5" />
                          <span>Join Video Call</span>
                        </button>
                      ) : (
                        <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                          <Navigation className="w-5 h-5" />
                          <span>Get Directions</span>
                        </button>
                      )}
                      <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold">
                        Reschedule
                      </button>
                      <button className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-200 font-semibold">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Past Appointments</h2>
                <p className="text-gray-600 mt-1">Previous consultations and visit history</p>
              </div>
              <span className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-lg">
                {pastAppointments.length} Completed
              </span>
            </div>

            <div className="grid gap-6">
              {pastAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="p-5 bg-gradient-to-r from-green-600 to-emerald-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white">
                          <p className="text-sm font-medium opacity-90">Completed</p>
                          <p className="text-xs opacity-75">{appointment.location}</p>
                        </div>
                      </div>
                      <div className="text-right text-white">
                        <p className="text-sm font-semibold">{appointment.date}</p>
                        <p className="text-xs opacity-90">{appointment.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <img
                        src={appointment.image}
                        alt={appointment.doctorName}
                        className="w-20 h-20 rounded-xl object-cover shadow-md"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{appointment.doctorName}</h3>
                            <p className="text-sm text-green-600 font-medium mt-1">{appointment.specialty}</p>
                          </div>
                          <div className="flex items-center space-x-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < appointment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                            <span className="ml-2 text-sm font-semibold text-gray-900">{appointment.rating}.0</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{appointment.date}</span>
                          <Clock className="w-4 h-4 text-gray-400 ml-3" />
                          <span className="text-sm text-gray-600">{appointment.time}</span>
                        </div>
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700"><span className="font-semibold">Reason:</span> {appointment.reason}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-100">
                      <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                        <Calendar className="w-5 h-5" />
                        <span>Book Again</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-all duration-200 font-semibold">
                        <MessageSquare className="w-5 h-5" />
                        <span>Message</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold">
                        <Phone className="w-5 h-5" />
                        <span>Call</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
