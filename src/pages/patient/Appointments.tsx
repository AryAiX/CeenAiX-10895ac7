import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video, Plus, Search, X, ChevronLeft, ChevronRight, Stethoscope, Star, AlertTriangle, Navigation as NavigationIcon } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  coordinates: { lat: number; lng: number };
  image: string;
  availableSlots: number;
  acceptsVideo: boolean;
}

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  location: string;
  coordinates?: { lat: number; lng: number };
  reason: string;
  rating?: number;
}

export const PatientAppointments: React.FC = () => {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDirectionsModal, setShowDirectionsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointmentToRate, setAppointmentToRate] = useState<Appointment | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video'>('in-person');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [rescheduleMonth, setRescheduleMonth] = useState(new Date());

  const upcomingAppointments: Appointment[] = [
    {
      id: 1,
      doctor: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: '2026-03-02',
      time: '10:00 AM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      coordinates: { lat: 25.1172, lng: 55.2082 },
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

  const pastAppointments: Appointment[] = [
    {
      id: 3,
      doctor: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      date: '2026-02-15',
      time: '11:00 AM',
      type: 'in-person',
      location: 'Dubai Healthcare City, Building 27',
      coordinates: { lat: 25.1172, lng: 55.2082 },
      reason: 'Flu Symptoms'
    }
  ];

  const doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      rating: 4.9,
      reviews: 234,
      location: 'Dubai Healthcare City',
      coordinates: { lat: 25.1172, lng: 55.2082 },
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200',
      availableSlots: 12,
      acceptsVideo: true
    },
    {
      id: 2,
      name: 'Dr. Mohammed Hassan',
      specialty: 'Cardiology',
      rating: 4.8,
      reviews: 189,
      location: 'Al Zahra Hospital',
      coordinates: { lat: 25.2048, lng: 55.2708 },
      image: 'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=200',
      availableSlots: 8,
      acceptsVideo: true
    },
    {
      id: 3,
      name: 'Dr. Fatima Al-Rashid',
      specialty: 'Dermatology',
      rating: 4.9,
      reviews: 312,
      location: 'Mediclinic City Hospital',
      coordinates: { lat: 25.1280, lng: 55.2090 },
      image: 'https://images.pexels.com/photos/5327584/pexels-photo-5327584.jpeg?auto=compress&cs=tinysrgb&w=200',
      availableSlots: 15,
      acceptsVideo: false
    },
    {
      id: 4,
      name: 'Dr. Ahmed Khalil',
      specialty: 'Orthopedics',
      rating: 4.7,
      reviews: 156,
      location: 'NMC Royal Hospital',
      coordinates: { lat: 25.2244, lng: 55.2819 },
      image: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg?auto=compress&cs=tinysrgb&w=200',
      availableSlots: 6,
      acceptsVideo: true
    }
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayTime = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push({ value: time, display: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookAppointment = () => {
    setShowBookingModal(true);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleConfirmBooking = () => {
    console.log('Booking confirmed:', {
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType
    });
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancelAppointment = () => {
    console.log('Appointment cancelled:', selectedAppointment);
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const confirmReschedule = () => {
    console.log('Appointment rescheduled:', {
      appointment: selectedAppointment,
      newDate: selectedDate,
      newTime: selectedTime
    });
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleGetDirections = (appointment: Appointment) => {
    if (appointment.type === 'video') return;
    setSelectedAppointment(appointment);
    setShowDirectionsModal(true);
  };

  const openGoogleMaps = () => {
    if (!selectedAppointment?.coordinates) return;
    const { lat, lng } = selectedAppointment.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const openWaze = () => {
    if (!selectedAppointment?.coordinates) return;
    const { lat, lng } = selectedAppointment.coordinates;
    window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  };

  const handleRateDoctor = (appointment: Appointment) => {
    setAppointmentToRate(appointment);
    setSelectedRating(appointment.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = () => {
    console.log('Rating submitted:', {
      appointment: appointmentToRate,
      rating: selectedRating
    });
    setShowRatingModal(false);
    setAppointmentToRate(null);
    setSelectedRating(0);
  };

  const goToReschedulePreviousMonth = () => {
    setRescheduleMonth(new Date(rescheduleMonth.getFullYear(), rescheduleMonth.getMonth() - 1));
  };

  const goToRescheduleNextMonth = () => {
    setRescheduleMonth(new Date(rescheduleMonth.getFullYear(), rescheduleMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Appointments"
        subtitle="Manage your medical appointments"
        icon={<Calendar className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
        actions={
          <button onClick={handleBookAppointment} className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold">
            <Plus className="w-5 h-5" />
            <span>Book Appointment</span>
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
                      <button
                        onClick={() => appointment.type === 'video' ? null : handleGetDirections(appointment)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
                      >
                        {appointment.type === 'video' ? 'Join Video Call' : 'Get Directions'}
                      </button>
                      <button
                        onClick={() => handleRescheduleAppointment(appointment)}
                        className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(appointment)}
                        className="px-4 py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                    <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
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
                    {appointment.rating ? (
                      <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-600">Your Rating:</span>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= appointment.rating! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRateDoctor(appointment)}
                        className="w-full mt-4 pt-4 border-t border-gray-100 flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        <Star className="w-4 h-4" />
                        <span>Rate this doctor</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Book an Appointment</h3>
                <p className="text-blue-100 text-sm mt-1">Find a doctor and schedule your visit</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6">
              {!selectedDoctor ? (
                <div>
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by doctor name or specialty..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start space-x-4">
                          <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Stethoscope className="w-3 h-3 mr-1" />
                              {doctor.specialty}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm font-semibold text-gray-900">{doctor.rating}</span>
                                <span className="text-xs text-gray-500">({doctor.reviews})</span>
                              </div>
                              {doctor.acceptsVideo && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Video
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {doctor.location}
                            </p>
                            <p className="text-xs text-green-600 font-semibold mt-1">
                              {doctor.availableSlots} slots available
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !selectedDate ? (
                <div>
                  <button onClick={() => setSelectedDoctor(null)} className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to doctors
                  </button>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <div className="flex items-center space-x-4">
                      <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900">{selectedDoctor.name}</h4>
                        <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                      </div>
                    </div>
                  </div>

                  {selectedDoctor.acceptsVideo && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Appointment Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAppointmentType('in-person')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appointmentType === 'in-person'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <MapPin className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'in-person' ? 'text-blue-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold text-sm ${appointmentType === 'in-person' ? 'text-blue-900' : 'text-gray-700'}`}>
                            In-Person Visit
                          </p>
                        </button>
                        <button
                          onClick={() => setAppointmentType('video')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appointmentType === 'video'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Video className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'video' ? 'text-purple-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold text-sm ${appointmentType === 'video' ? 'text-purple-900' : 'text-gray-700'}`}>
                            Video Consultation
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <h4 className="font-bold text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h4>
                      <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                      {getDaysInMonth(currentMonth).map((date, index) => (
                        <button
                          key={index}
                          onClick={() => date && !isDateDisabled(date) && handleDateSelect(date)}
                          disabled={!date || isDateDisabled(date)}
                          className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                            !date
                              ? 'invisible'
                              : isDateDisabled(date)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'hover:bg-blue-100 hover:text-blue-900 cursor-pointer text-gray-900'
                          }`}
                        >
                          {date?.getDate()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : !selectedTime ? (
                <div>
                  <button onClick={() => setSelectedDate(null)} className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to calendar
                  </button>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Selected Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4">Available Time Slots</h4>
                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTime(slot.display)}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-semibold text-gray-900"
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedTime(null)} className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to time slots
                  </button>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Appointment Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Stethoscope className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Doctor</p>
                          <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                          <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Date</p>
                          <p className="font-semibold text-gray-900">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="font-semibold text-gray-900">{selectedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {appointmentType === 'video' ? <Video className="w-5 h-5 text-green-600" /> : <MapPin className="w-5 h-5 text-green-600" />}
                        <div>
                          <p className="text-xs text-gray-600">Type</p>
                          <p className="font-semibold text-gray-900">{appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</p>
                          {appointmentType === 'in-person' && (
                            <p className="text-sm text-gray-600">{selectedDoctor.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowBookingModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmBooking}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-t-2xl flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Cancel Appointment</h3>
                <p className="text-red-100 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.doctor}</strong> on{' '}
                <strong>{new Date(selectedAppointment.date).toLocaleDateString()}</strong> at{' '}
                <strong>{selectedAppointment.time}</strong>?
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-orange-800">
                  Please note: Cancelling within 24 hours of your appointment may result in a cancellation fee.
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={confirmCancelAppointment}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Reschedule Appointment</h3>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedAppointment.doctor} - {selectedAppointment.specialty}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelectedDate(null);
                  setSelectedTime(null);
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="p-6">
              {!selectedDate ? (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Current Appointment:</strong> {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                    </p>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4">Select New Date</h4>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={goToReschedulePreviousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <h4 className="font-bold text-gray-900">
                      {rescheduleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <button onClick={goToRescheduleNextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                        {day}
                      </div>
                    ))}
                    {getDaysInMonth(rescheduleMonth).map((date, index) => (
                      <button
                        key={index}
                        onClick={() => date && !isDateDisabled(date) && setSelectedDate(date)}
                        disabled={!date || isDateDisabled(date)}
                        className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                          !date
                            ? 'invisible'
                            : isDateDisabled(date)
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'hover:bg-blue-100 hover:text-blue-900 cursor-pointer text-gray-900'
                        }`}
                      >
                        {date?.getDate()}
                      </button>
                    ))}
                  </div>
                </div>
              ) : !selectedTime ? (
                <div>
                  <button onClick={() => setSelectedDate(null)} className="flex items-center text-blue-600 hover:text-blue-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to calendar
                  </button>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 mb-6 border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Selected Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>

                  <h4 className="font-bold text-gray-900 mb-4">Available Time Slots</h4>
                  <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTime(slot.display)}
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-sm font-semibold text-gray-900"
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedTime(null)} className="flex items-center text-blue-600 hover:text-blue-700 mb-6 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to time slots
                  </button>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">New Appointment Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Doctor</p>
                        <p className="font-semibold text-gray-900">{selectedAppointment.doctor}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Date</p>
                        <p className="font-semibold text-gray-900">
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">New Time</p>
                        <p className="font-semibold text-gray-900">{selectedTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowRescheduleModal(false);
                        setSelectedDate(null);
                        setSelectedTime(null);
                      }}
                      className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmReschedule}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                    >
                      Confirm Reschedule
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDirectionsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 rounded-t-2xl flex items-center space-x-3">
              <NavigationIcon className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Get Directions</h3>
                <p className="text-blue-100 text-sm">Choose your navigation app</p>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>{selectedAppointment.location}</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(selectedAppointment.date).toLocaleDateString()} at {selectedAppointment.time}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={openGoogleMaps}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold">Google Maps</p>
                    <p className="text-sm text-white/90">Open in Google Maps</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>

                <button
                  onClick={openWaze}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <div className="bg-white/20 p-2 rounded-lg">
                    <NavigationIcon className="w-6 h-6" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-bold">Waze</p>
                    <p className="text-sm text-white/90">Open in Waze</p>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowDirectionsModal(false)}
                className="w-full px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRatingModal && appointmentToRate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6 rounded-t-2xl flex items-center space-x-3">
              <Star className="w-8 h-8 text-white fill-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Rate Doctor</h3>
                <p className="text-yellow-100 text-sm">Share your experience</p>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="font-bold text-gray-900">{appointmentToRate.doctor}</p>
                <p className="text-sm text-gray-600">{appointmentToRate.specialty}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(appointmentToRate.date).toLocaleDateString()} at {appointmentToRate.time}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3 text-center">How was your experience?</p>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className="transition-all hover:scale-110"
                    >
                      <Star
                        className={`w-12 h-12 ${
                          star <= selectedRating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {selectedRating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {selectedRating === 1 && 'Poor'}
                    {selectedRating === 2 && 'Fair'}
                    {selectedRating === 3 && 'Good'}
                    {selectedRating === 4 && 'Very Good'}
                    {selectedRating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRatingModal(false);
                    setSelectedRating(0);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRating}
                  disabled={selectedRating === 0}
                  className={`flex-1 px-6 py-3 rounded-xl transition-all font-semibold ${
                    selectedRating === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg'
                  }`}
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
