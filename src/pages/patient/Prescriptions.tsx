import React, { useState, useEffect } from 'react';
import { Pill, Calendar, Clock, AlertCircle, Package, MapPin, RefreshCw, CheckCircle, XCircle, Bell, Search, Store, Phone } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { supabase } from '../../lib/supabase';

interface Prescription {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  start_date: string;
  end_date: string | null;
  refills_remaining: number;
  status: string;
  doctor_id: string;
  created_at: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  distance: string;
  hours: string;
  hasStock: boolean;
}

export const PatientPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctors, setDoctors] = useState<Record<string, Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'pharmacy'>('prescriptions');
  const [selectedMedication, setSelectedMedication] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const nearbyPharmacies: Pharmacy[] = [
    {
      id: 1,
      name: 'Life Pharmacy - Dubai Mall',
      address: 'Ground Floor, Dubai Mall, Downtown Dubai',
      phone: '+971 4 339 8448',
      distance: '2.3 km',
      hours: 'Open 24/7',
      hasStock: true
    },
    {
      id: 2,
      name: 'Boots Pharmacy - Marina Walk',
      address: 'Shop 12, Marina Walk, Dubai Marina',
      phone: '+971 4 423 1567',
      distance: '3.8 km',
      hours: '8 AM - 12 AM',
      hasStock: true
    },
    {
      id: 3,
      name: 'Aster Pharmacy - JBR',
      address: 'The Beach, JBR, Dubai',
      phone: '+971 4 427 9988',
      distance: '5.1 km',
      hours: '9 AM - 11 PM',
      hasStock: false
    },
    {
      id: 4,
      name: 'Medcare Pharmacy - Business Bay',
      address: 'Bay Square, Business Bay, Dubai',
      phone: '+971 4 375 7500',
      distance: '1.7 km',
      hours: 'Open 24/7',
      hasStock: true
    }
  ];

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const { data: prescriptionsData, error: prescError } = await supabase
        .from('prescriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (prescError) throw prescError;

      if (prescriptionsData && prescriptionsData.length > 0) {
        setPrescriptions(prescriptionsData);

        const doctorIds = [...new Set(prescriptionsData.map(p => p.doctor_id))];
        const { data: doctorsData } = await supabase
          .from('doctors')
          .select('id, name, specialization')
          .in('id', doctorIds);

        if (doctorsData) {
          const doctorsMap = doctorsData.reduce((acc, doc) => {
            acc[doc.id] = doc;
            return acc;
          }, {} as Record<string, Doctor>);
          setDoctors(doctorsMap);
        }
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const activePrescriptions = prescriptions.filter(p => p.status === 'active');
  const pastPrescriptions = prescriptions.filter(p => p.status === 'completed' || p.status === 'expired');

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleRefillRequest = (prescriptionId: string, medicationName: string) => {
    setSelectedMedication(medicationName);
    setActiveTab('pharmacy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation role="patient" />
        <PageHeader
          title="Prescriptions & Pharmacy"
          subtitle="Manage medications and find pharmacies"
          icon={<Pill className="w-6 h-6 text-white" />}
          backTo="/patient/dashboard"
        />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Prescriptions & Pharmacy"
        subtitle="Manage medications and find pharmacies"
        icon={<Pill className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-2 mb-8 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'prescriptions'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Pill className="w-5 h-5" />
            <span>My Prescriptions</span>
          </button>
          <button
            onClick={() => setActiveTab('pharmacy')}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
              activeTab === 'pharmacy'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Store className="w-5 h-5" />
            <span>Find Pharmacy</span>
          </button>
        </div>

        {activeTab === 'prescriptions' ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Active Medications</p>
                    <p className="text-4xl font-bold mt-2">{activePrescriptions.length}</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm font-medium">Refills Needed</p>
                    <p className="text-4xl font-bold mt-2">
                      {activePrescriptions.filter(p => p.refills_remaining <= 1).length}
                    </p>
                  </div>
                  <Bell className="w-12 h-12 text-amber-200" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Prescriptions</p>
                    <p className="text-4xl font-bold mt-2">{prescriptions.length}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-200" />
                </div>
              </div>
            </div>

            {/* Active Prescriptions */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Active Prescriptions</h2>
                <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  {activePrescriptions.length} Active
                </span>
              </div>

              {activePrescriptions.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl flex items-center justify-center">
                    <Pill className="w-10 h-10 text-blue-500" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700">No active prescriptions</p>
                  <p className="text-sm text-gray-500 mt-2">Your prescribed medications will appear here</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {activePrescriptions.map((prescription) => {
                    const daysLeft = getDaysRemaining(prescription.end_date);
                    const doctor = doctors[prescription.doctor_id];

                    return (
                      <div key={prescription.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-5">
                          <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center space-x-4">
                              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                <Pill className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-white">{prescription.medication_name}</h3>
                                <p className="text-green-100 text-sm mt-1">
                                  Prescribed by {doctor?.name || 'Doctor'}
                                  {doctor?.specialization && ` - ${doctor.specialization}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                                <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                                  <Bell className="w-3 h-3" />
                                  <span>{daysLeft} days left</span>
                                </span>
                              )}
                              <span className="bg-white/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold">
                                ACTIVE
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dosage Information</h4>
                              <div className="space-y-3">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Pill className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">{prescription.dosage}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Frequency: {prescription.frequency}</p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="bg-cyan-100 p-2 rounded-lg">
                                    <Clock className="w-4 h-4 text-cyan-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-gray-900">Duration: {prescription.duration}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Refills remaining: {prescription.refills_remaining}</p>
                                  </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                  <div className="bg-green-100 p-2 rounded-lg">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-700">Start: {new Date(prescription.start_date).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    {prescription.end_date && (
                                      <p className="text-sm text-gray-700 mt-0.5">End: {new Date(prescription.end_date).toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Special Instructions</h4>
                              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4">
                                <div className="flex items-start space-x-3">
                                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <p className="text-sm text-gray-800 leading-relaxed">{prescription.instructions || 'Follow doctor\'s instructions'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                            <button
                              onClick={() => handleRefillRequest(prescription.id, prescription.medication_name)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              <RefreshCw className="w-5 h-5" />
                              <span>Request Refill</span>
                            </button>
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2">
                              <MapPin className="w-5 h-5" />
                              <span>Find Pharmacy</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Prescriptions */}
            {pastPrescriptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Past Prescriptions</h2>
                  <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {pastPrescriptions.length} Completed
                  </span>
                </div>

                <div className="grid gap-6">
                  {pastPrescriptions.map((prescription) => {
                    const doctor = doctors[prescription.doctor_id];

                    return (
                      <div key={prescription.id} className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200">
                        <div className="bg-gray-100 p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gray-200 p-2 rounded-lg">
                                <Pill className="w-5 h-5 text-gray-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-bold text-gray-900">{prescription.medication_name}</h3>
                                <p className="text-gray-600 text-sm">Prescribed by {doctor?.name || 'Doctor'}</p>
                              </div>
                            </div>
                            <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                              {prescription.status}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm text-gray-700"><span className="font-semibold">Dosage:</span> {prescription.dosage}</p>
                              <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Duration:</span> {prescription.duration}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-700">
                                {new Date(prescription.start_date).toLocaleDateString('en-AE')} - {prescription.end_date ? new Date(prescription.end_date).toLocaleDateString('en-AE') : 'Ongoing'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Search Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for medication or pharmacy..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                  <MapPin className="w-5 h-5" />
                  <span>Use My Location</span>
                </button>
              </div>
              {selectedMedication && (
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Searching for:</span> {selectedMedication}
                  </p>
                </div>
              )}
            </div>

            {/* Pharmacy List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Nearby Pharmacies</h2>
              <div className="grid gap-6">
                {nearbyPharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{pharmacy.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{pharmacy.address}</p>
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">{pharmacy.distance}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-600">
                                <Clock className="w-4 h-4 text-green-500" />
                                <span className="font-medium">{pharmacy.hours}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {pharmacy.hasStock ? (
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>In Stock</span>
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                            <XCircle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                        <a
                          href={`tel:${pharmacy.phone}`}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2"
                        >
                          <Phone className="w-5 h-5" />
                          <span>Call Pharmacy</span>
                        </a>
                        <button className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
                          <MapPin className="w-5 h-5" />
                          <span>Get Directions</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
