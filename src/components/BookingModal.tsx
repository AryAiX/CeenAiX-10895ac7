import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Clock, ChevronLeft, ChevronRight, MapPin, Video } from 'lucide-react';
import { dateTimeFormatWithNumerals, resolveLocale } from '../lib/i18n-ui';
import { supabase } from '../lib/supabase';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  image_url?: string;
  accepts_video: boolean;
}

interface BookingModalProps {
  doctor: Doctor;
  onClose: () => void;
  onBookingComplete: () => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const BookingModal: React.FC<BookingModalProps> = ({ doctor, onClose, onBookingComplete }) => {
  const { i18n } = useTranslation('common');
  const locale = resolveLocale(i18n.language);
  const dtOpts = (options: Intl.DateTimeFormatOptions) => dateTimeFormatWithNumerals(i18n.language, options);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'in-person' | 'video'>('in-person');
  const [reason, setReason] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const generateTimeSlots = useCallback(async () => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 17;

    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('doctor_id', doctor.id)
      .eq('appointment_date', selectedDate.toISOString().split('T')[0])
      .neq('status', 'cancelled');

    const bookedTimes = new Set(
      existingAppointments?.map((apt) => apt.appointment_time) || []
    );

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const isPast = selectedDate.toDateString() === new Date().toDateString() &&
                       (hour < new Date().getHours() ||
                       (hour === new Date().getHours() && minute <= new Date().getMinutes()));

        slots.push({
          time: displayTime,
          available: !bookedTimes.has(time) && !isPast,
        });
      }
    }

    setTimeSlots(slots);
  }, [doctor.id, selectedDate]);

  useEffect(() => {
    generateTimeSlots();
  }, [generateTimeSlots]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleBooking = async () => {
    if (!selectedTime || !reason.trim()) {
      alert('Please select a time slot and provide a reason for your visit');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Please sign in to book an appointment');
        return;
      }

      const { error } = await supabase.from('appointments').insert({
        user_id: user.id,
        doctor_id: doctor.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime + ':00',
        type: appointmentType,
        location: doctor.location,
        reason: reason.trim(),
        status: 'scheduled',
      });

      if (error) throw error;

      alert('Appointment booked successfully!');
      onBookingComplete();
      onClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue p-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {doctor.image_url && (
              <img
                src={doctor.image_url}
                alt={doctor.name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div className="text-white">
              <h2 className="text-2xl font-bold">{doctor.name}</h2>
              <p className="text-white/90">{doctor.specialty}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-2 text-gray-600 mb-6">
            <MapPin className="w-5 h-5" />
            <span>{doctor.location}</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Appointment Type
                </label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setAppointmentType('in-person')}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all ${
                      appointmentType === 'in-person'
                        ? 'border-ceenai-blue bg-ceenai-blue text-white'
                        : 'border-gray-200 text-gray-700 hover:border-ceenai-cyan'
                    }`}
                  >
                    In-Person
                  </button>
                  {doctor.accepts_video && (
                    <button
                      onClick={() => setAppointmentType('video')}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 font-semibold transition-all flex items-center justify-center space-x-2 ${
                        appointmentType === 'video'
                          ? 'border-ceenai-blue bg-ceenai-blue text-white'
                          : 'border-gray-200 text-gray-700 hover:border-ceenai-cyan'
                      }`}
                    >
                      <Video className="w-4 h-4" />
                      <span>Video</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={handlePreviousMonth}
                    disabled={
                      currentMonth.getMonth() === today.getMonth() &&
                      currentMonth.getFullYear() === today.getFullYear()
                    }
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="font-bold text-gray-900">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </div>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isToday = date.toDateString() === today.toDateString();
                    const isSelected = date.toDateString() === selectedDate.toDateString();
                    const isPast = date < today;

                    return (
                      <button
                        key={index}
                        onClick={() => !isPast && handleDateSelect(date)}
                        disabled={isPast}
                        className={`aspect-square rounded-lg font-medium transition-all ${
                          isPast
                            ? 'text-gray-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-ceenai-blue text-white shadow-md scale-105'
                            : isToday
                            ? 'bg-ceenai-cyan/20 text-ceenai-blue hover:bg-ceenai-cyan/30'
                            : 'hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Select Time Slot (30 min each)
                </label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                          selectedTime === slot.time
                            ? 'bg-ceenai-blue text-white shadow-md'
                            : slot.available
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                            : 'bg-red-100 text-red-700 cursor-not-allowed border border-red-300'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for Visit
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your symptoms or reason for appointment..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-ceenai-cyan focus:outline-none resize-none"
                  rows={4}
                />
              </div>

              {selectedDate && selectedTime && (
                <div className="bg-ceenai-cyan/10 border border-ceenai-cyan/30 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-ceenai-blue" />
                    <span className="font-semibold text-gray-900">Selected Appointment</span>
                  </div>
                  <p className="text-gray-700">
                    {selectedDate.toLocaleDateString(
                      locale,
                      dtOpts({
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    )}
                  </p>
                  <p className="text-gray-700 font-semibold">{selectedTime}</p>
                  <p className="text-sm text-gray-600 mt-1">{appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={loading || !selectedTime || !reason.trim()}
                className="w-full py-4 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
