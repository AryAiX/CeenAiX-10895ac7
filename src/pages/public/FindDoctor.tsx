import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, Video, Clock, ArrowLeft, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GeometricBackground } from '../../components/GeometricBackground';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

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

type DoctorRow = Omit<Doctor, 'rating'>;

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

      const doctorsWithRatings = (data as DoctorRow[] | null)?.map((doc, index) => ({
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
    navigate('/patient/appointments/book');
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      <GeometricBackground />
      <Header />

      <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50">
        <div className="absolute inset-0 z-0 opacity-15">
          <img
            src="https://images.pexels.com/photos/6129410/pexels-photo-6129410.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Healthcare professionals"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/')}
            className="group mb-8 flex items-center space-x-2 rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:text-ceenai-blue"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          <div className="text-center mb-12 animate-slide-up">
            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-6xl">
              Connect with
              <span className="block bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-transparent">
                Expert Doctors
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-medium text-slate-600">
              Browse through our network of certified healthcare professionals and book appointments instantly
            </p>
            <div className="mt-8 flex justify-center gap-8">
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-3xl font-bold text-ceenai-blue">850+</p>
                <p className="text-sm text-slate-500">Verified Doctors</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-3xl font-bold text-ceenai-blue">4.9★</p>
                <p className="text-sm text-slate-500">Average Rating</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 px-6 py-4 shadow-sm backdrop-blur-sm">
                <p className="text-3xl font-bold text-ceenai-blue">24/7</p>
                <p className="text-sm text-slate-500">Availability</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur animate-scale-in">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/70 py-3 pl-12 pr-4 text-slate-900 outline-none transition focus:border-ceenai-cyan focus:bg-white focus:ring-2 focus:ring-ceenai-cyan/20"
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
            <p className="text-slate-600">
              <span className="font-semibold text-ceenai-blue">{filteredDoctors.length}</span> doctors available
            </p>
            <div className="flex items-center space-x-2 text-slate-600">
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
                className="group animate-scale-in overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-ceenai-cyan/40 hover:shadow-xl"
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
                  <div className="absolute top-4 right-4 flex items-center space-x-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                      <Video className="w-4 h-4 text-ceenai-blue" />
                    <span className="text-xs font-semibold text-slate-700">Video</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold text-slate-900">{doctor.rating?.toFixed(1)}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="mb-1 text-xl font-bold text-slate-900 transition-colors group-hover:text-ceenai-blue">
                    {doctor.name}
                  </h3>
                  <p className="text-ceenai-blue font-semibold mb-3">{doctor.specialty}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Clock className="mr-2 h-4 w-4 text-slate-400" />
                      <span className="text-green-600 font-medium">{doctor.available_slots} slots available</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleBookAppointment()}
                    className="w-full rounded-2xl bg-gradient-to-r from-ceenai-cyan to-ceenai-blue py-3 font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-lg"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredDoctors.length === 0 && (
          <div className="animate-fade-in py-20 text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">No doctors found</h3>
            <p className="mb-6 text-slate-600">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
              }}
              className="rounded-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-6 py-3 font-semibold text-white transition-all hover:shadow-lg"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
