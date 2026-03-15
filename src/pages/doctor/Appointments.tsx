import React, { useMemo } from 'react';
import { Calendar, Clock, User, Video, MapPin } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAppointments, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

export const DoctorAppointments: React.FC = () => {
  const { user } = useAuth();
  const {
    data: appointments = [],
    loading,
    error,
  } = useAppointments({ role: 'doctor', userId: user?.id ?? '' });

  const patientIds = useMemo(
    () => Array.from(new Set((appointments ?? []).map((appointment) => appointment.patient_id))),
    [appointments]
  );

  const { data: patientProfiles = [] } = useQuery(
    async () => {
      if (patientIds.length === 0) {
        return [];
      }

      const { data, error: patientProfilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name')
        .in('user_id', patientIds);

      if (patientProfilesError) throw patientProfilesError;
      return data ?? [];
    },
    [patientIds.join(',')]
  );

  const patientNameById = useMemo(
    () =>
      new Map(
        patientProfiles.map((profile) => [profile.user_id, profile.full_name ?? 'Patient'])
      ),
    [patientProfiles]
  );

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
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Care</h2>
          <p className="text-gray-600">Live appointments will appear here as patients book against your profile.</p>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-44 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Doctor appointments could not be loaded yet.
          </div>
        ) : appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <Calendar className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">No appointments yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              This page no longer shows sample patients. Your real booked consultations will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <div
                  className={`p-4 ${
                    appointment.type === 'virtual'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
                        {appointment.type === 'virtual' ? (
                          <Video className="w-5 h-5 text-white" />
                        ) : (
                          <MapPin className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {patientNameById.get(appointment.patient_id) ?? 'Patient'}
                        </h3>
                        <p className="text-sm text-white/90">
                          {appointment.chief_complaint ?? 'Scheduled consultation'}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-gray-800">
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Time</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(appointment.scheduled_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.duration_minutes} min
                      </p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-500">Type</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {appointment.type === 'in_person' ? 'In person' : 'Virtual'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center space-x-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>Patient detail flows will open from this list once the doctor patient detail route is wired.</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
