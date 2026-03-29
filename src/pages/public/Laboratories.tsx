import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Star, Search, Filter, Beaker, TestTube } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { supabase } from '../../lib/supabase';
import { formatLocaleDecimal, formatLocaleDigits } from '../../lib/i18n-ui';
import {
  displayLaboratoryHours,
  displayLaboratoryLocation,
  displayLaboratoryName,
  displayLaboratoryService,
  laboratorySearchHaystack,
} from '../../lib/laboratories-display';

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
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const getSampleLaboratories = useCallback((): Laboratory[] => {
    return [
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
  }, []);

  const fetchLaboratories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('laboratories')
        .select('*')
        .order('featured', { ascending: false })
        .order('rating', { ascending: false });

      if (error) throw error;

      if (data) {
        setLaboratories(data as Laboratory[]);
      }
    } catch (error) {
      console.error('Error fetching laboratories:', error);
      setLaboratories(getSampleLaboratories());
    } finally {
      setLoading(false);
    }
  }, [getSampleLaboratories]);

  useEffect(() => {
    fetchLaboratories();
  }, [fetchLaboratories]);

  const filteredLaboratories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return laboratories.filter((lab) => {
      const matchesSearch = !q || laboratorySearchHaystack(t, lab).includes(q);
      const matchesLocation = selectedLocation === 'all' || lab.location === selectedLocation;
      return matchesSearch && matchesLocation;
    });
  }, [laboratories, searchQuery, selectedLocation, t]);

  const locations = useMemo(
    () => ['all', ...new Set(laboratories.map((lab) => lab.location))],
    [laboratories]
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Keep decoration in the top band only — full-page inset-0 stacked over the footer and hid slate-950 + light text */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[22rem] overflow-hidden sm:h-[26rem]"
        aria-hidden
      >
        <img
          src="https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt=""
          className="h-full w-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-50/80 to-gray-50" />
      </div>

      <Header />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 px-5 py-2.5 text-teal-700">
            <TestTube className="h-5 w-5" />
            <span className="text-sm font-semibold">{t('laboratoryPage.heroBadge')}</span>
          </div>
          <h1 className="mb-4 text-5xl font-bold text-gray-900 md:text-6xl">{t('laboratoryPage.heroTitle')}</h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">{t('laboratoryPage.heroLead')}</p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('laboratoryPage.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 py-3 pe-4 ps-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pe-4 ps-12 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all'
                      ? t('laboratoryPage.allLocations')
                      : displayLaboratoryLocation(t, location)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">{t('laboratoryPage.loading')}</p>
          </div>
        ) : filteredLaboratories.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center shadow-lg">
            <Beaker className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <p className="text-lg text-gray-600">{t('laboratoryPage.emptyState')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredLaboratories.map((lab) => {
              const nameDisplay = displayLaboratoryName(t, lab.id, lab.name);
              const locationDisplay = displayLaboratoryLocation(t, lab.location);
              const hoursDisplay = displayLaboratoryHours(t, lab.opening_hours);

              return (
                <div
                  key={lab.id}
                  className={`overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl ${
                    lab.featured ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {lab.featured && (
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-2 text-center text-sm font-bold text-white">
                      {t('laboratoryPage.featuredLab')}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="mb-1 text-xl font-bold text-gray-900">{nameDisplay}</h3>
                        <div className="mb-2 flex items-center text-sm text-gray-600">
                          <MapPin className="me-1 h-4 w-4" />
                          {locationDisplay}
                        </div>
                      </div>
                      <div className="flex items-center rounded-full bg-yellow-50 px-3 py-1">
                        <Star className="me-1 h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-semibold text-gray-900">
                          {formatLocaleDecimal(lab.rating, i18n.language, 1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex items-center text-gray-700">
                      <Clock className="me-2 h-4 w-4 text-gray-500" />
                      <span className="text-sm">{hoursDisplay}</span>
                    </div>

                    <div className="mb-4 flex items-center text-gray-700">
                      <TestTube className="me-2 h-4 w-4 text-blue-600" />
                      <span className="text-sm font-semibold">
                        {t('laboratoryPage.testsAvailable', {
                          count: formatLocaleDigits(lab.tests_available, i18n.language),
                        })}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="mb-2 text-sm font-semibold text-gray-900">
                        {t('laboratoryPage.servicesLabel')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {lab.services.slice(0, 3).map((service, index) => (
                          <span
                            key={index}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700"
                          >
                            {displayLaboratoryService(t, service)}
                          </span>
                        ))}
                        {lab.services.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                            {t('laboratoryPage.moreServices', {
                              count: formatLocaleDigits(lab.services.length - 3, i18n.language),
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/auth/register?role=patient&reset=1')}
                      className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 font-semibold text-white shadow-md transition-all hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg"
                    >
                      {t('laboratoryPage.bookTest')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
            {t('laboratoryPage.benefitsTitle')}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Beaker className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{t('laboratoryPage.benefit1Title')}</h3>
              <p className="text-sm text-gray-600">{t('laboratoryPage.benefit1Body')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <TestTube className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{t('laboratoryPage.benefit2Title')}</h3>
              <p className="text-sm text-gray-600">{t('laboratoryPage.benefit2Body')}</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100">
                <Clock className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{t('laboratoryPage.benefit3Title')}</h3>
              <p className="text-sm text-gray-600">{t('laboratoryPage.benefit3Body')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-slate-800/20">
        <Footer />
      </div>
    </div>
  );
};
