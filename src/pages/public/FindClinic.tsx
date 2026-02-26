import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowLeft, MapPin, Star, Clock, Phone } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  type: string;
  location: string;
  rating: number;
  services: string[];
  hours: string;
  phone: string;
  emergency: boolean;
}

export const FindClinic: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const clinics: Clinic[] = [
    {
      id: '1',
      name: 'Dubai Healthcare City Medical Center',
      type: 'Multi-specialty Hospital',
      location: 'Dubai Healthcare City',
      rating: 4.8,
      services: ['Emergency Care', 'Surgery', 'Diagnostics', 'Pharmacy'],
      hours: '24/7',
      phone: '+971 4 123 4567',
      emergency: true,
    },
    {
      id: '2',
      name: 'Marina Medical Clinic',
      type: 'Primary Care Clinic',
      location: 'Dubai Marina',
      rating: 4.6,
      services: ['General Practice', 'Pediatrics', 'Dermatology'],
      hours: '8 AM - 10 PM',
      phone: '+971 4 234 5678',
      emergency: false,
    },
    {
      id: '3',
      name: 'Jumeirah Specialist Center',
      type: 'Specialist Center',
      location: 'Jumeirah',
      rating: 4.7,
      services: ['Cardiology', 'Orthopedics', 'Neurology', 'Lab Services'],
      hours: '7 AM - 11 PM',
      phone: '+971 4 345 6789',
      emergency: false,
    },
  ];

  const filteredClinics = clinics.filter(
    (clinic) =>
      clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clinic.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <Heart className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Find a Clinic</span>
            </div>
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Healthcare Facilities</h1>
          <p className="text-gray-600">Discover hospitals, clinics, and medical centers near you</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by name or location
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="e.g., Dubai Marina or Medical Center"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          {filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        {clinic.name}
                      </h3>
                      <p className="text-blue-600 font-medium">{clinic.type}</p>
                    </div>
                    {clinic.emergency && (
                      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                        Emergency 24/7
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{clinic.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{clinic.hours}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{clinic.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-medium text-gray-900">
                        {clinic.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500 text-sm">(120+ reviews)</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {clinic.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => navigate('/auth')}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors whitespace-nowrap"
                  >
                    Book Appointment
                  </button>
                  <button className="px-6 py-2.5 border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 font-medium rounded-lg transition-colors whitespace-nowrap">
                    View Details
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
