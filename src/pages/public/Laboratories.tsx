import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, Search, Filter, Beaker, TestTube } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { supabase } from '../../lib/supabase';

interface Laboratory {
  id: string;
  name: string;
  location: string;
  rating: number;
  tests_available: number;
  opening_hours: string;
  services: string[];
  featured: boolean;
}

export const Laboratories: React.FC = () => {
  const navigate = useNavigate();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const fetchLaboratories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      if (data) {
        setLaboratories(data);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      setLaboratories(getSampleLaboratories());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLaboratories();
  }, [fetchLaboratories]);

  const getSampleLaboratories = (): Laboratory[] => [
    {
      id: '1',
      name: 'Dubai Advanced Laboratory',
      location: 'Dubai Healthcare City',
      rating: 4.9,
      tests_available: 250,
      opening_hours: '7:00 AM - 9:00 PM',
      services: ['Blood Tests', 'Radiology', 'Pathology', 'Genetic Testing', 'COVID-19 PCR'],
      featured: true,
    },
    {
      id: '2',
      name: 'HealthCheck Lab Center',
      location: 'Jumeirah',
      rating: 4.7,
      tests_available: 180,
      opening_hours: '8:00 AM - 8:00 PM',
      services: ['Blood Tests', 'Urine Analysis', 'X-Ray', 'Ultrasound', 'ECG'],
      featured: true,
    },
    {
      id: '3',
      name: 'Al Barsha Medical Lab',
      location: 'Al Barsha',
      rating: 4.6,
      tests_available: 150,
      opening_hours: '8:00 AM - 7:00 PM',
      services: ['Blood Tests', 'Pathology', 'Microbiology', 'Immunology'],
      featured: false,
    },
    {
      id: '4',
      name: 'Emirates Diagnostic Center',
      location: 'Dubai Marina',
      rating: 4.8,
      tests_available: 220,
      opening_hours: '7:00 AM - 10:00 PM',
      services: ['Blood Tests', 'MRI', 'CT Scan', 'Radiology', 'Nuclear Medicine'],
      featured: false,
    },
    {
      id: '5',
      name: 'City Lab & Diagnostics',
      location: 'Deira',
      rating: 4.5,
      tests_available: 160,
      opening_hours: '8:00 AM - 8:00 PM',
      services: ['Blood Tests', 'Pathology', 'Chemistry', 'Hematology'],
      featured: false,
    },
    {
      id: '6',
      name: 'Premier Medical Laboratory',
      location: 'Business Bay',
      rating: 4.9,
      tests_available: 280,
      opening_hours: '24/7',
      services: ['Blood Tests', 'Radiology', 'Advanced Diagnostics', 'Molecular Testing', 'Toxicology'],
      featured: true,
    },
  ];

  const filteredLaboratories = laboratories.filter((lab) => {
    const matchesSearch = lab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lab.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || lab.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = ['all', ...new Set(laboratories.map(lab => lab.location))];

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Medical laboratory"
          className="w-full h-80 object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50"></div>
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-teal-100 border border-teal-300 text-teal-700 px-5 py-2.5 rounded-full mb-6">
            <TestTube className="w-5 h-5" />
            <span className="text-sm font-semibold">Certified Diagnostics</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Find a Laboratory</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Book diagnostic tests and health checkups at certified labs with accurate results</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading laboratories...</p>
          </div>
        ) : filteredLaboratories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No laboratories found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLaboratories.map((lab) => (
              <div
                key={lab.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl ${
                  lab.featured ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {lab.featured && (
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-center py-2 text-sm font-bold">
                    FEATURED LAB
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{lab.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {lab.location}
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-semibold text-gray-900">{lab.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700 mb-4">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm">{lab.opening_hours}</span>
                  </div>

                  <div className="flex items-center text-gray-700 mb-4">
                    <TestTube className="w-4 h-4 mr-2 text-blue-600" />
                    <span className="text-sm font-semibold">{lab.tests_available}+ Tests Available</span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Services:</p>
                    <div className="flex flex-wrap gap-2">
                      {lab.services.slice(0, 3).map((service, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {lab.services.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                          +{lab.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/patient/profile')}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    Book Test
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Why Choose Our Partner Laboratories?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Beaker className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">DHA Certified</h3>
              <p className="text-sm text-gray-600">
                All labs meet Dubai Health Authority standards
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TestTube className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Advanced Testing</h3>
              <p className="text-sm text-gray-600">
                State-of-the-art equipment and accurate results
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Results</h3>
              <p className="text-sm text-gray-600">
                Quick turnaround time with online result access
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
