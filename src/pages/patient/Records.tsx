import React from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const PatientRecords: React.FC = () => {
  const records = [
    {
      id: 1,
      type: 'Lab Results',
      title: 'Blood Test - Complete Panel',
      date: '2026-02-15',
      doctor: 'Dr. Sarah Ahmed',
      fileSize: '2.4 MB',
      category: 'lab'
    },
    {
      id: 2,
      type: 'Imaging',
      title: 'Chest X-Ray',
      date: '2026-02-10',
      doctor: 'Dr. Mohammed Hassan',
      fileSize: '5.1 MB',
      category: 'imaging'
    },
    {
      id: 3,
      type: 'Report',
      title: 'Annual Physical Examination',
      date: '2026-01-20',
      doctor: 'Dr. Sarah Ahmed',
      fileSize: '1.8 MB',
      category: 'report'
    },
    {
      id: 4,
      type: 'Lab Results',
      title: 'Lipid Panel',
      date: '2026-01-15',
      doctor: 'Dr. Mohammed Hassan',
      fileSize: '1.2 MB',
      category: 'lab'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'lab':
        return 'from-blue-500 to-cyan-500';
      case 'imaging':
        return 'from-purple-500 to-pink-500';
      case 'report':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    return 'bg-white/20 backdrop-blur-sm';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Medical Records"
        subtitle="Access your health records and documents"
        icon={<FileText className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">All Records</h2>
            <div className="flex space-x-3">
              <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium">
                <option>All Types</option>
                <option>Lab Results</option>
                <option>Imaging</option>
                <option>Reports</option>
              </select>
              <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium">
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>By Type</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200">
              <div className={`bg-gradient-to-r ${getCategoryColor(record.category)} p-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={getCategoryIcon(record.category) + ' p-2 rounded-lg'}>
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-xs font-semibold uppercase">
                          {record.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{record.title}</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Provider</p>
                    <p className="text-sm font-semibold text-gray-900">{record.doctor}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">File Size</p>
                    <p className="text-sm font-semibold text-gray-900">{record.fileSize}</p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t border-gray-100">
                  <button className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold">
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold">
                    <Download className="w-4 h-4" />
                    <span>Download</span>
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
