import React, { useMemo, useState } from 'react';
import { Users, Search, Calendar } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { Skeleton } from '../../components/Skeleton';
import { useAppointments, useQuery } from '../../hooks';
import { useAuth } from '../../lib/auth-context';
import { supabase } from '../../lib/supabase';

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: appointments = [],
    loading,
    error,
  } = useAppointments({ role: 'doctor', userId: user?.id ?? '' });

  const patientIds = useMemo(
    () => Array.from(new Set(appointments.map((appointment) => appointment.patient_id))),
    [appointments]
  );

  const { data: patientProfiles = [] } = useQuery(
    async () => {
      if (patientIds.length === 0) {
        return [];
      }

      const { data, error: patientProfilesError } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, email, phone')
        .in('user_id', patientIds);

      if (patientProfilesError) throw patientProfilesError;
      return data ?? [];
    },
    [patientIds.join(',')]
  );

  const patients = useMemo(() => {
    return patientProfiles
      .map((profile) => {
        const patientAppointments = appointments.filter(
          (appointment) => appointment.patient_id === profile.user_id
        );
        const sortedAppointments = [...patientAppointments].sort((a, b) =>
          a.scheduled_at.localeCompare(b.scheduled_at)
        );
        const nextAppointment =
          sortedAppointments.find((appointment) => new Date(appointment.scheduled_at).getTime() >= Date.now()) ??
          null;
        const lastAppointment =
          [...sortedAppointments]
            .reverse()
            .find((appointment) => new Date(appointment.scheduled_at).getTime() < Date.now()) ?? null;

        return {
          id: profile.user_id,
          name: profile.full_name ?? 'Patient',
          email: profile.email ?? 'Not provided',
          phone: profile.phone ?? 'Not provided',
          nextAppointment: nextAppointment?.scheduled_at ?? null,
          lastAppointment: lastAppointment?.scheduled_at ?? null,
          totalAppointments: patientAppointments.length,
        };
      })
      .filter((patient) => patient.name.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  }, [appointments, patientProfiles, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="doctor" />
      <PageHeader
        title="Patients"
        subtitle="Manage your patient records"
        icon={<Users className="w-6 h-6 text-white" />}
        backTo="/doctor/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <Skeleton className="h-52 w-full rounded-2xl" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Doctor patients could not be loaded yet.
          </div>
        ) : patients.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">
            <Users className="mx-auto mb-4 h-10 w-10 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900">No patients connected yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              This page no longer shows sample patients. Real patient relationships will appear here after appointments are created.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white backdrop-blur-sm">
                      {patient.name
                        .split(' ')
                        .filter(Boolean)
                        .map((name) => name[0])
                        .join('')
                        .slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                      <p className="text-sm text-white/90">{patient.totalAppointments} linked appointments</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 p-6 md:grid-cols-3">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Contact</h4>
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                    <p className="mt-1 text-sm text-gray-600">{patient.email}</p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Last Appointment</h4>
                    <p className="text-sm text-gray-600">
                      {patient.lastAppointment
                        ? new Date(patient.lastAppointment).toLocaleString()
                        : 'No completed visits yet'}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-gray-700">Next Appointment</h4>
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span>
                        {patient.nextAppointment
                          ? new Date(patient.nextAppointment).toLocaleString()
                          : 'No future appointment scheduled'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                  Patient detail and record views will use this live list once the doctor patient detail route is connected.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
