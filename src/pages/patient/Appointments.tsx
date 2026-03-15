import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Video, Plus, Search, X, ChevronLeft, ChevronRight, User, Star, AlertTriangle, Navigation as NavigationIcon } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  latitude: number;
  longitude: number;
  image_url: string;
  available_slots: number;
  accepts_video: boolean;
}

interface Appointment {
  id: string;
  user_id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  type: 'in-person' | 'video';
  location: string;
  latitude?: number;
  longitude?: number;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingReason, setBookingReason] = useState('');
  const [creatingDemo, setCreatingDemo] = useState(false);

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const createSampleAppointments = async () => {
    setCreatingDemo(true);
    const { error } = await supabase.rpc('create_upcoming_appointments');

    if (error) {
      console.error('Error creating sample appointments:', error);
      alert('Failed to create sample appointments. Please try again.');
    } else {
      await fetchAppointments();
    }
    setCreatingDemo(false);
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        doctor_ratings_summary(total_reviews, average_rating)
      `);

    if (error) {
      console.error('Error fetching doctors:', error);
      return;
    }

    if (data) {
      const doctorsWithRatings = data.map(doctor => ({
        ...doctor,
        rating: doctor.doctor_ratings_summary?.[0]?.average_rating || 0,
        reviews: doctor.doctor_ratings_summary?.[0]?.total_reviews || 0
      }));
      setDoctors(doctorsWithRatings);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        doctors(name, specialty)
      `)
      .eq('user_id', user.id)
      .in('status', ['scheduled', 'completed'])
      .order('appointment_date', { ascending: true });

    if (appointmentsError) {
      console.error('Error fetching appointments:', appointmentsError);
      setLoading(false);
      return;
    }

    const { data: ratingsData } = await supabase
      .from('doctor_ratings')
      .select('appointment_id, rating')
      .eq('user_id', user.id);

    const ratingsMap = new Map(ratingsData?.map(r => [r.appointment_id, r.rating]) || []);

    const formattedAppointments = appointmentsData?.map(apt => ({
      id: apt.id,
      user_id: apt.user_id,
      doctor_id: apt.doctor_id,
      doctor_name: apt.doctors.name,
      specialty: apt.doctors.specialty,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time,
      type: apt.type,
      location: apt.location,
      latitude: apt.latitude,
      longitude: apt.longitude,
      reason: apt.reason,
      status: apt.status,
      rating: ratingsMap.get(apt.id)
    })) || [];

    setAppointments(formattedAppointments);
    setLoading(false);
  };

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return apt.status === 'scheduled' && aptDate >= new Date();
  });

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(`${apt.appointment_date}T${apt.appointment_time}`);
    return apt.status === 'completed' || (apt.status === 'scheduled' && aptDate < new Date());
  });

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

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please log in to book an appointment');
      return;
    }

    const timeIn24h = convertTo24Hour(selectedTime);

    const appointmentData = {
      user_id: user.id,
      doctor_id: selectedDoctor.id,
      appointment_date: selectedDate.toISOString().split('T')[0],
      appointment_time: timeIn24h,
      type: appointmentType,
      location: appointmentType === 'video' ? 'Video Consultation' : selectedDoctor.location,
      latitude: appointmentType === 'in-person' ? selectedDoctor.latitude : null,
      longitude: appointmentType === 'in-person' ? selectedDoctor.longitude : null,
      reason: bookingReason || 'General Consultation',
      status: 'scheduled'
    };

    const { error } = await supabase
      .from('appointments')
      .insert(appointmentData);

    if (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
      return;
    }

    await fetchAppointments();
    setShowBookingModal(false);
    setSelectedDoctor(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingReason('');
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

  const confirmCancelAppointment = async () => {
    if (!selectedAppointment) return;

    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', selectedAppointment.id);

    if (error) {
      console.error('Error cancelling appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
      return;
    }

    await fetchAppointments();
    setShowCancelModal(false);
    setSelectedAppointment(null);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const confirmReschedule = async () => {
    if (!selectedAppointment || !selectedDate || !selectedTime) return;

    const timeIn24h = convertTo24Hour(selectedTime);

    const { error } = await supabase
      .from('appointments')
      .update({
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: timeIn24h,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedAppointment.id);

    if (error) {
      console.error('Error rescheduling appointment:', error);
      alert('Failed to reschedule appointment. Please try again.');
      return;
    }

    await fetchAppointments();
    setShowRescheduleModal(false);
    setSelectedAppointment(null);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, period] = time12h.split(' ');
    const [rawHours, minutes] = time.split(':');
    let hours = rawHours;

    if (period === 'PM' && hours !== '12') {
      hours = String(parseInt(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const handleGetDirections = (appointment: Appointment) => {
    if (appointment.type === 'video') return;
    setSelectedAppointment(appointment);
    setShowDirectionsModal(true);
  };

  const openGoogleMaps = () => {
    if (!selectedAppointment?.latitude || !selectedAppointment?.longitude) return;
    const { latitude, longitude } = selectedAppointment;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  const openWaze = () => {
    if (!selectedAppointment?.latitude || !selectedAppointment?.longitude) return;
    const { latitude, longitude } = selectedAppointment;
    window.open(`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`, '_blank');
  };

  const handleRateDoctor = (appointment: Appointment) => {
    setAppointmentToRate(appointment);
    setSelectedRating(appointment.rating || 0);
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!appointmentToRate || selectedRating === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('doctor_ratings')
      .insert({
        user_id: user.id,
        doctor_id: appointmentToRate.doctor_id,
        appointment_id: appointmentToRate.id,
        rating: selectedRating
      });

    if (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
      return;
    }

    await fetchAppointments();
    await fetchDoctors();
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

      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Medical Professional"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Appointments</h1>
              <p className="text-cyan-100 text-lg">Manage your healthcare visits</p>
            </div>
            <button
              onClick={handleBookAppointment}
              className="flex items-center space-x-2 px-6 py-3 bg-white text-cyan-700 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
                {upcomingAppointments.length > 0 && (
                  <span className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-full text-sm font-bold">
                    {upcomingAppointments.length} {upcomingAppointments.length === 1 ? 'Appointment' : 'Appointments'}
                  </span>
                )}
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                    <img
                      src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Medical"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="relative p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Calendar className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">Schedule your first appointment with our experienced healthcare providers</p>
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={handleBookAppointment}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold flex items-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Book Appointment</span>
                      </button>
                      <button
                        onClick={createSampleAppointments}
                        disabled={creatingDemo}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50"
                      >
                        {creatingDemo ? 'Loading...' : 'Try Sample Appointments'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 p-6">
                        <div className="absolute inset-0 opacity-10">
                          <img
                            src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=600"
                            alt="Doctor"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                              <User className="w-8 h-8 text-cyan-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{appointment.doctor_name}</h3>
                              <p className="text-cyan-100 text-sm">{appointment.specialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                            {appointment.type === 'video' ? (
                              <Video className="w-4 h-4 text-white" />
                            ) : (
                              <MapPin className="w-4 h-4 text-white" />
                            )}
                            <span className="text-white text-sm font-semibold">
                              {appointment.type === 'video' ? 'Video Call' : 'In-Person'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-4 h-4 text-cyan-600" />
                              <span className="text-xs font-bold text-gray-600 uppercase">Date</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Clock className="w-4 h-4 text-cyan-600" />
                              <span className="text-xs font-bold text-gray-600 uppercase">Time</span>
                            </div>
                            <p className="text-lg font-bold text-gray-900">
                              {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                          <div className="flex items-start space-x-3 mb-3">
                            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Location</p>
                              <p className="text-sm text-gray-900 font-medium">{appointment.location}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1">Reason</p>
                              <p className="text-sm text-gray-900 font-medium">{appointment.reason}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => appointment.type === 'video' ? null : handleGetDirections(appointment)}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm flex items-center justify-center space-x-2"
                          >
                            {appointment.type === 'video' ? (
                              <>
                                <Video className="w-4 h-4" />
                                <span>Join Call</span>
                              </>
                            ) : (
                              <>
                                <NavigationIcon className="w-4 h-4" />
                                <span>Get Directions</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRescheduleAppointment(appointment)}
                            className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold text-sm"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment)}
                            className="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-semibold text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {pastAppointments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Appointments</h2>
                <div className="space-y-4">
                  {pastAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{appointment.doctor_name}</h3>
                            <p className="text-sm text-gray-600">{appointment.specialty}</p>
                          </div>
                        </div>
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                          Completed
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>

                      {appointment.rating ? (
                        <div className="flex items-center space-x-2">
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
                          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold text-sm flex items-center justify-center space-x-2"
                        >
                          <Star className="w-4 h-4" />
                          <span>Rate This Appointment</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Book an Appointment</h3>
                <p className="text-cyan-100 text-sm mt-1">Find a doctor and schedule your visit</p>
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
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => handleDoctorSelect(doctor)}
                        className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-cyan-500 hover:shadow-lg transition-all cursor-pointer"
                      >
                        <div className="flex items-start space-x-4">
                          <img src={doctor.image_url} alt={doctor.name} className="w-16 h-16 rounded-xl object-cover" />
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                            <p className="text-sm text-gray-600">{doctor.specialty}</p>
                            <div className="flex items-center space-x-1 mt-2">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold text-gray-900">{doctor.rating.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">({doctor.reviews})</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {doctor.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !selectedDate ? (
                <div>
                  <button onClick={() => setSelectedDoctor(null)} className="flex items-center text-cyan-600 hover:text-cyan-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to doctors
                  </button>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-100">
                    <div className="flex items-center space-x-4">
                      <img src={selectedDoctor.image_url} alt={selectedDoctor.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-gray-900">{selectedDoctor.name}</h4>
                        <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                      </div>
                    </div>
                  </div>

                  {selectedDoctor.accepts_video && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Appointment Type</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setAppointmentType('in-person')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appointmentType === 'in-person'
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <MapPin className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'in-person' ? 'text-cyan-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold text-sm ${appointmentType === 'in-person' ? 'text-cyan-900' : 'text-gray-700'}`}>
                            In-Person Visit
                          </p>
                        </button>
                        <button
                          onClick={() => setAppointmentType('video')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            appointmentType === 'video'
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <Video className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'video' ? 'text-cyan-600' : 'text-gray-400'}`} />
                          <p className={`font-semibold text-sm ${appointmentType === 'video' ? 'text-cyan-900' : 'text-gray-700'}`}>
                            Video Call
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
                              : 'hover:bg-cyan-100 hover:text-cyan-900 cursor-pointer text-gray-900'
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
                  <button onClick={() => setSelectedDate(null)} className="flex items-center text-cyan-600 hover:text-cyan-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to calendar
                  </button>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-100">
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
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all text-sm font-semibold text-gray-900"
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedTime(null)} className="flex items-center text-cyan-600 hover:text-cyan-700 mb-6 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to time slots
                  </button>

                  <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">Appointment Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-cyan-600" />
                        <div>
                          <p className="text-xs text-gray-600">Doctor</p>
                          <p className="font-semibold text-gray-900">{selectedDoctor.name}</p>
                          <p className="text-sm text-gray-600">{selectedDoctor.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-cyan-600" />
                        <div>
                          <p className="text-xs text-gray-600">Date</p>
                          <p className="font-semibold text-gray-900">
                            {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-cyan-600" />
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="font-semibold text-gray-900">{selectedTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {appointmentType === 'video' ? <Video className="w-5 h-5 text-cyan-600" /> : <MapPin className="w-5 h-5 text-cyan-600" />}
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
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
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Cancel Appointment</h3>
                <p className="text-cyan-100 text-sm">This action cannot be undone</p>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to cancel your appointment with <strong>{selectedAppointment.doctor_name}</strong> on{' '}
                <strong>{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</strong> at{' '}
                <strong>
                  {new Date(`2000-01-01T${selectedAppointment.appointment_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </strong>?
              </p>
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-cyan-800">
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
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
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Reschedule Appointment</h3>
                <p className="text-cyan-100 text-sm mt-1">
                  {selectedAppointment.doctor_name} - {selectedAppointment.specialty}
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
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-cyan-800">
                      <strong>Current Appointment:</strong> {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at{' '}
                      {new Date(`2000-01-01T${selectedAppointment.appointment_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
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
                            : 'hover:bg-cyan-100 hover:text-cyan-900 cursor-pointer text-gray-900'
                        }`}
                      >
                        {date?.getDate()}
                      </button>
                    ))}
                  </div>
                </div>
              ) : !selectedTime ? (
                <div>
                  <button onClick={() => setSelectedDate(null)} className="flex items-center text-cyan-600 hover:text-cyan-700 mb-4 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to calendar
                  </button>

                  <div className="bg-cyan-50 rounded-xl p-4 mb-6 border border-cyan-100">
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
                        className="p-3 border-2 border-gray-200 rounded-xl hover:border-cyan-500 hover:bg-cyan-50 transition-all text-sm font-semibold text-gray-900"
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <button onClick={() => setSelectedTime(null)} className="flex items-center text-cyan-600 hover:text-cyan-700 mb-6 font-semibold">
                    <ChevronLeft className="w-4 h-4" />
                    Back to time slots
                  </button>

                  <div className="bg-cyan-50 rounded-xl p-6 border border-cyan-200 mb-6">
                    <h4 className="font-bold text-gray-900 mb-4 text-lg">New Appointment Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-600">Doctor</p>
                        <p className="font-semibold text-gray-900">{selectedAppointment.doctor_name}</p>
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
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
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
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center space-x-3">
              <NavigationIcon className="w-8 h-8 text-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Get Directions</h3>
                <p className="text-cyan-100 text-sm">Choose your navigation app</p>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>{selectedAppointment.location}</strong>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at{' '}
                  {new Date(`2000-01-01T${selectedAppointment.appointment_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <button
                  onClick={openGoogleMaps}
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
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
                  className="w-full flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all"
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
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center space-x-3">
              <Star className="w-8 h-8 text-white fill-white" />
              <div>
                <h3 className="text-xl font-bold text-white">Rate Doctor</h3>
                <p className="text-cyan-100 text-sm">Share your experience</p>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                <p className="font-bold text-gray-900">{appointmentToRate.doctor_name}</p>
                <p className="text-sm text-gray-600">{appointmentToRate.specialty}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(appointmentToRate.appointment_date).toLocaleDateString()} at{' '}
                  {new Date(`2000-01-01T${appointmentToRate.appointment_time}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
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
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg'
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
