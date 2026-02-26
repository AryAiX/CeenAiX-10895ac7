import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowLeft, MapPin, Star, Calendar, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  license_number: string;
  years_of_experience?: number;
  consultation_fee?: number;
  rating?: number;
  languages?: string[];
  location?: string;
}

export const FindDoctor: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    'All Specialties',
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select(`
          *,
          user_profiles!inner(
            id,
            full_name,
            email
          )
        `)
        .limit(20);

      if (error) throw error;

      const formattedDoctors = data?.map((doc: any) => ({
        id: doc.id,
        full_name: doc.user_profiles.full_name,
        specialization: doc.specialization || 'General Practice',
        license_number: doc.license_number,
        years_of_experience: doc.years_of_experience,
        consultation_fee: doc.consultation_fee,
        rating: 4.5 + Math.random() * 0.5,
        languages: ['English', 'Arabic'],
        location: 'Dubai Healthcare City',
      })) || [];

      setDoctors(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'all' ||
      doctor.specialization.toLowerCase() === selectedSpecialty.toLowerCase();

    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = () => {
    navigate('/auth');
  };

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
              <span className="text-xl font-bold text-gray-900">Find a Doctor</span>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Healthcare Provider</h1>
          <p className="text-gray-600">Browse and connect with qualified specialists</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by name or specialty
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="e.g., Dr. Smith or Cardiology"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading doctors...</p>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No doctors found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {doctor.full_name.charAt(0)}
                  </div>
                  <div className="flex items-center space-x-1 bg-yellow-50 px-2 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {doctor.rating?.toFixed(1)}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Dr. {doctor.full_name}
                </h3>
                <p className="text-blue-600 font-medium text-sm mb-3">
                  {doctor.specialization}
                </p>

                <div className="space-y-2 mb-4">
                  {doctor.years_of_experience && (
                    <p className="text-sm text-gray-600">
                      {doctor.years_of_experience}+ years experience
                    </p>
                  )}
                  {doctor.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{doctor.location}</span>
                    </div>
                  )}
                  {doctor.languages && (
                    <p className="text-sm text-gray-600">
                      Languages: {doctor.languages.join(', ')}
                    </p>
                  )}
                </div>

                {doctor.consultation_fee && (
                  <div className="mb-4 pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gray-900">
                      AED {doctor.consultation_fee}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleBookAppointment}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
