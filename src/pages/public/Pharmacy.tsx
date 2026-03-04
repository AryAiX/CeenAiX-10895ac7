import React, { useState } from 'react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { MapPin, Clock, Phone, Star, Search, ShoppingCart, Package, Pill } from 'lucide-react';

interface Pharmacy {
  id: number;
  name: string;
  location: string;
  distance: string;
  hours: string;
  phone: string;
  rating: number;
  reviews: number;
  delivery: boolean;
  open24h: boolean;
  image: string;
}

const pharmacies: Pharmacy[] = [
  {
    id: 1,
    name: "LifeCare Pharmacy",
    location: "Sheikh Zayed Road, Dubai",
    distance: "1.2 km",
    hours: "24/7",
    phone: "+971 4 123 4567",
    rating: 4.8,
    reviews: 234,
    delivery: true,
    open24h: true,
    image: "https://images.pexels.com/photos/5910947/pexels-photo-5910947.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 2,
    name: "MediPlus Pharmacy",
    location: "Dubai Marina",
    distance: "2.5 km",
    hours: "8:00 AM - 10:00 PM",
    phone: "+971 4 234 5678",
    rating: 4.6,
    reviews: 187,
    delivery: true,
    open24h: false,
    image: "https://images.pexels.com/photos/5910948/pexels-photo-5910948.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 3,
    name: "Health First Pharmacy",
    location: "Jumeirah Beach Road",
    distance: "3.1 km",
    hours: "24/7",
    phone: "+971 4 345 6789",
    rating: 4.9,
    reviews: 312,
    delivery: true,
    open24h: true,
    image: "https://images.pexels.com/photos/3683053/pexels-photo-3683053.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 4,
    name: "City Pharmacy",
    location: "Business Bay",
    distance: "4.2 km",
    hours: "7:00 AM - 11:00 PM",
    phone: "+971 4 456 7890",
    rating: 4.5,
    reviews: 156,
    delivery: false,
    open24h: false,
    image: "https://images.pexels.com/photos/5910949/pexels-photo-5910949.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 5,
    name: "Wellness Pharmacy",
    location: "Downtown Dubai",
    distance: "5.0 km",
    hours: "9:00 AM - 9:00 PM",
    phone: "+971 4 567 8901",
    rating: 4.7,
    reviews: 201,
    delivery: true,
    open24h: false,
    image: "https://images.pexels.com/photos/208512/pexels-photo-208512.jpeg?auto=compress&cs=tinysrgb&w=800"
  },
  {
    id: 6,
    name: "QuickMed Pharmacy",
    location: "Deira City Center",
    distance: "6.3 km",
    hours: "24/7",
    phone: "+971 4 678 9012",
    rating: 4.4,
    reviews: 143,
    delivery: true,
    open24h: true,
    image: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800"
  }
];

export const Pharmacy: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '24h' | 'delivery'>('all');

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === '24h' && pharmacy.open24h) ||
                         (selectedFilter === 'delivery' && pharmacy.delivery);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Header />

      <section className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white py-20">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                <Pill className="w-16 h-16" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-6">Find Your Nearest Pharmacy</h1>
            <p className="text-xl text-blue-50 max-w-3xl mx-auto mb-8">
              Discover trusted pharmacies in your area with convenient delivery options and 24/7 availability
            </p>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by pharmacy name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-cyan-500 transition-colors text-lg"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                selectedFilter === 'all'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Pharmacies
            </button>
            <button
              onClick={() => setSelectedFilter('24h')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectedFilter === '24h'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              24/7 Open
            </button>
            <button
              onClick={() => setSelectedFilter('delivery')}
              className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                selectedFilter === 'delivery'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Package className="w-4 h-4" />
              Delivery Available
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={pharmacy.image}
                  alt={pharmacy.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {pharmacy.open24h && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      24/7
                    </span>
                  )}
                  {pharmacy.delivery && (
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      Delivery
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pharmacy.name}</h3>

                <div className="flex items-center text-yellow-500 mb-3">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 font-semibold text-gray-900">{pharmacy.rating}</span>
                  <span className="ml-1 text-sm text-gray-500">({pharmacy.reviews} reviews)</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-cyan-600" />
                    <span className="text-sm">{pharmacy.location} • {pharmacy.distance}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-cyan-600" />
                    <span className="text-sm">{pharmacy.hours}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 flex-shrink-0 text-cyan-600" />
                    <span className="text-sm">{pharmacy.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2.5 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    Order Now
                  </button>
                  <button className="px-4 py-2.5 border-2 border-cyan-600 text-cyan-600 rounded-xl font-semibold hover:bg-cyan-50 transition-all">
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPharmacies.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pharmacies found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
