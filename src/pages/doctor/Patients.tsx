import React from 'react';
import { Users, Search, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const DoctorPatients: React.FC = () => {
  const patients = [
    {
      id: 1,
      name: 'Ahmed Al Maktoum',
      age: 45,
      gender: 'Male',
      lastVisit: '2026-02-20',
      nextAppointment: '2026-03-05',
      phone: '+971 50 123 4567',
      email: 'ahmed.maktoum@email.com',
      conditions: ['Hypertension', 'Type 2 Diabetes']
    },
    {
      id: 2,
      name: 'Fatima Hassan',
      age: 32,
      gender: 'Female',
      lastVisit: '2026-02-15',
      nextAppointment: '2026-02-28',
      phone: '+971 50 234 5678',
      email: 'fatima.hassan@email.com',
      conditions: ['Asthma']
    },
    {
      id: 3,
      name: 'Mohammed Ali',
      age: 58,
      gender: 'Male',
      lastVisit: '2026-01-30',
      nextAppointment: null,
      phone: '+971 50 345 6789',
      email: 'mohammed.ali@email.com',
      conditions: ['High Cholesterol']
    }
  ];

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
                placeholder="Search patients by name, ID, or condition..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 font-medium"
              />
            </div>
            <div className="flex space-x-3 ml-4">
              <select className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium">
                <option>All Patients</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{patient.name}</h3>
                      <p className="text-white/90 text-sm">{patient.age} years • {patient.gender}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{patient.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{patient.email}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Medical History</h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-gray-600">Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                          {patient.nextAppointment && (
                            <p className="text-gray-600">Next: {new Date(patient.nextAppointment).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {patient.conditions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Conditions</h4>
                    <div className="flex flex-wrap gap-2">
                      {patient.conditions.map((condition, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                        >
                          {condition}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <FileText className="w-4 h-4" />
                    <span>View Records</span>
                  </button>
                  <button className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold">
                    Schedule Appointment
                  </button>
                  <button className="px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold">
                    Message
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
