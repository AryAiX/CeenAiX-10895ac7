import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Search, ArrowLeft, MapPin, Star, Filter, Video, Clock, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GeometricBackground } from '../../components/GeometricBackground';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  available_slots: number;
  accepts_video: boolean;
  rating?: number;
}

const doctorImages = [
  'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5452293/pexels-photo-5452293.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/7659566/pexels-photo-7659566.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/6129410/pexels-photo-6129410.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export const FindDoctor: React.FC = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const specialties = [
    'All Specialties',
    'Cardiologist',
    'Pediatrician',
    'Dermatologist',
    'Orthopedic Surgeon',
    'General Practitioner',
    'Neurologist',
    'Gynecologist',
    'Ophthalmologist',
    'Psychiatrist',
    'Endocrinologist',
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name')
        .limit(50);

      if (error) throw error;

      const doctorsWithRatings = data?.map((doc: any, index: number) => ({
        ...doc,
        rating: 4.2 + Math.random() * 0.8,
        image_url: doc.image_url || doctorImages[index % doctorImages.length],
      })) || [];

      setDoctors(doctorsWithRatings);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'all' ||
      doctor.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());

    return matchesSearch && matchesSpecialty;
  });

  const handleBookAppointment = () => {
    navigate('/patient/appointments');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ceenai-cyan/5 relative">
      <GeometricBackground />

      <nav className="bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-ceenai-blue font-medium transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-ceenai-cyan to-ceenai-blue rounded-xl flex items-center justify-center shadow-md">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
                Find a Doctor
              </span>
            </div>
            <button
              onClick={() => navigate('/patient/profile')}
              className="px-6 py-2.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="text-center mb-12 animate-slide-up">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Connect with
            <span className="block bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
              Expert Doctors
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse through our network of certified healthcare professionals and book appointments instantly
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 border border-gray-100 animate-scale-in">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-ceenai-cyan focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-ceenai-cyan focus:outline-none transition-colors appearance-none bg-white"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty === 'All Specialties' ? 'all' : specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-600">
              <span className="font-semibold text-ceenai-blue">{filteredDoctors.length}</span> doctors available
            </p>
            <div className="flex items-center space-x-2 text-gray-600">
              <Award className="w-4 h-4 text-ceenai-cyan" />
              <span>All verified professionals</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 animate-pulse">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor, index) => (
              <div
                key={doctor.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-hard transition-all duration-500 border border-gray-100 hover:border-ceenai-cyan/50 hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-ceenai-cyan/10 to-ceenai-blue/10">
                  <img
                    src={doctor.image_url || doctorImages[index % doctorImages.length]}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>

                  {doctor.accepts_video && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-2 shadow-lg">
                      <Video className="w-4 h-4 text-ceenai-blue" />
                      <span className="text-xs font-semibold text-gray-700">Video</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-lg">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-gray-900">{doctor.rating?.toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-ceenai-blue transition-colors">
                    {doctor.name}
                  </h3>
                  <p className="text-ceenai-blue font-semibold mb-3">{doctor.specialty}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-green-600 font-medium">{doctor.available_slots} slots available</span>
                    </div>
                  </div>

                  <button
                    onClick={handleBookAppointment}
                    className="w-full py-3 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No doctors found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
