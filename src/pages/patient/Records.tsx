import React, { useState } from 'react';
import { FileText, Filter, Search } from 'lucide-react';
import { Navigation } from '../../components/Navigation';

export const PatientRecords: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const records: Array<{ id: number; category: string; title: string; type: string }> = [];

  const filteredRecords = records.filter(record => {
    const matchesType = filterType === 'all' || record.category === filterType;
    const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const sortedRecords = [...filteredRecords].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />

      <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Medical Records"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-white mb-2">Medical Records</h1>
          <p className="text-cyan-100 text-lg">Access and manage your health documents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search records, doctors, or tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="lab">Lab Results</option>
                  <option value="imaging">Imaging</option>
                  <option value="report">Reports</option>
                </select>
              </div>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium appearance-none bg-white cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedRecords.length}</span> of <span className="font-semibold text-gray-900">{records.length}</span> records
            </p>
          </div>
        </div>

        {sortedRecords.length === 0 ? (
          <div className="relative bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
              <img
                src="https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Medical Records"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No records available yet</h3>
              <p className="text-gray-600">
                This screen no longer shows sample documents. Lab results, imaging, and reports will appear here once they are connected to live patient records.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6" />
        )}
      </div>
    </div>
  );
};
