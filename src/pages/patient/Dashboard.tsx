import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  MessageSquare,
  Activity,
  MapPin,
  Phone,
  Mail,
  Bell,
  BellOff,
  Plus,
  RefreshCw,
  Download,
  Bot,
  Send,
  X,
  ChevronRight,
  Heart,
  Stethoscope,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Star,
} from 'lucide-react';

interface Visit {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  diagnosis: string;
  type: string;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  refills: number;
  prescribedDate: string;
  status: string;
}

interface Message {
  id: string;
  sender: string;
  senderType: string;
  subject: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  isFavorite: boolean;
  is24Hours: boolean;
}

interface LabTest {
  id: string;
  testName: string;
  labName: string;
  date: string;
  status: string;
  result?: string;
}

interface MedicationReminder {
  id: string;
  medication: string;
  time: string;
  isActive: boolean;
}

export const PatientDashboard: React.FC = () => {
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m your AI health assistant. How can I help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const upcomingVisits: Visit[] = [
    {
      id: '1',
      doctor: 'Dr. Ahmed Al-Mansoori',
      specialty: 'Cardiology',
      date: '2026-03-05 10:00 AM',
      diagnosis: 'Regular Checkup',
      type: 'In-Person',
    },
    {
      id: '2',
      doctor: 'Dr. Fatima Hassan',
      specialty: 'General Practice',
      date: '2026-03-10 2:30 PM',
      diagnosis: 'Follow-up',
      type: 'Telemedicine',
    },
  ];

  const previousVisits: Visit[] = [
    {
      id: '3',
      doctor: 'Dr. Mohammed Ali',
      specialty: 'Dermatology',
      date: '2026-02-15 11:00 AM',
      diagnosis: 'Skin condition treatment',
      type: 'In-Person',
    },
    {
      id: '4',
      doctor: 'Dr. Sarah Khan',
      specialty: 'Orthopedics',
      date: '2026-01-20 9:00 AM',
      diagnosis: 'Back pain consultation',
      type: 'In-Person',
    },
  ];

  const prescriptions: Prescription[] = [
    {
      id: '1',
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      refills: 3,
      prescribedDate: '2026-02-15',
      status: 'active',
    },
    {
      id: '2',
      medication: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      refills: 2,
      prescribedDate: '2026-02-10',
      status: 'active',
    },
  ];

  const messages: Message[] = [
    {
      id: '1',
      sender: 'Dr. Ahmed Al-Mansoori',
      senderType: 'Doctor',
      subject: 'Lab Results Available',
      message: 'Your recent blood test results are ready for review. Please schedule a follow-up appointment.',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: '2',
      sender: 'City Medical Center',
      senderType: 'Healthcare Provider',
      subject: 'Appointment Reminder',
      message: 'Your appointment is scheduled for tomorrow at 10:00 AM. Please arrive 15 minutes early.',
      time: '1 day ago',
      isRead: true,
    },
  ];

  const pharmacies: Pharmacy[] = [
    {
      id: '1',
      name: 'Life Pharmacy',
      address: 'Sheikh Zayed Road, Dubai',
      phone: '+971-4-123-4567',
      distance: '1.2 km',
      isFavorite: true,
      is24Hours: true,
    },
    {
      id: '2',
      name: 'Aster Pharmacy',
      address: 'Jumeirah Beach Road, Dubai',
      phone: '+971-4-987-6543',
      distance: '2.5 km',
      isFavorite: false,
      is24Hours: false,
    },
  ];

  const labTests: LabTest[] = [
    {
      id: '1',
      testName: 'Complete Blood Count',
      labName: 'Al Borg Diagnostics',
      date: '2026-02-25',
      status: 'completed',
      result: 'Normal',
    },
    {
      id: '2',
      testName: 'Lipid Panel',
      labName: 'NMC Pathology',
      date: '2026-02-20',
      status: 'completed',
      result: 'Slightly Elevated',
    },
    {
      id: '3',
      testName: 'HbA1c Test',
      labName: 'Al Borg Diagnostics',
      date: '2026-03-01',
      status: 'pending',
    },
  ];

  const medicationReminders: MedicationReminder[] = [
    {
      id: '1',
      medication: 'Lisinopril 10mg',
      time: '08:00 AM',
      isActive: true,
    },
    {
      id: '2',
      medication: 'Metformin 500mg',
      time: '08:00 AM',
      isActive: true,
    },
    {
      id: '3',
      medication: 'Metformin 500mg',
      time: '08:00 PM',
      isActive: true,
    },
  ];

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: chatInput }]);
      setChatInput('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I understand your concern. Based on your health profile, I recommend consulting with your doctor. Would you like me to help you schedule an appointment?'
        }]);
      }, 1000);
    }
  };

  const toggleReminder = (id: string) => {
    console.log('Toggle reminder', id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation role="patient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your health journey in one place</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Upcoming Visits</p>
                <p className="text-4xl font-bold mt-2">{upcomingVisits.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Prescriptions</p>
                <p className="text-4xl font-bold mt-2">{prescriptions.length}</p>
              </div>
              <Pill className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Unread Messages</p>
                <p className="text-4xl font-bold mt-2">{messages.filter(m => !m.isRead).length}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Lab Results</p>
                <p className="text-4xl font-bold mt-2">{labTests.filter(t => t.status === 'completed').length}</p>
              </div>
              <FlaskConical className="w-12 h-12 text-orange-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Upcoming Visits</h3>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-50 p-2 rounded-lg mt-1">
                          <Stethoscope className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{visit.doctor}</h4>
                          <p className="text-sm text-gray-600">{visit.specialty}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{visit.date}</span>
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              {visit.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <FileText className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Previous Visits</h3>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {previousVisits.map((visit) => (
                  <div key={visit.id} className="border-l-4 border-gray-300 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{visit.doctor}</h4>
                        <p className="text-sm text-gray-600">{visit.diagnosis}</p>
                        <p className="text-xs text-gray-500 mt-1">{visit.date}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Active Prescriptions</h3>
                  </div>
                  <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1">
                    <Plus className="w-4 h-4" />
                    <span>Request Refill</span>
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{rx.medication}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rx.dosage} - {rx.frequency}</p>
                        <p className="text-xs text-gray-500 mt-2">Prescribed: {rx.prescribedDate}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            {rx.refills} refills left
                          </span>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 text-sm">
                        <RefreshCw className="w-4 h-4" />
                        <span>Refill</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <FlaskConical className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Laboratory Results</h3>
                  </div>
                  <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center space-x-1">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {labTests.map((test) => (
                  <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{test.testName}</h4>
                          {test.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{test.labName}</p>
                        <p className="text-xs text-gray-500 mt-1">Date: {test.date}</p>
                        {test.result && (
                          <p className="text-sm font-medium text-gray-900 mt-2">Result: {test.result}</p>
                        )}
                      </div>
                      {test.status === 'completed' && (
                        <button className="text-blue-600 hover:text-blue-700">
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Messages</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {messages.slice(0, 3).map((msg) => (
                  <div
                    key={msg.id}
                    className={`border-l-4 ${msg.isRead ? 'border-gray-300' : 'border-purple-500'} pl-4 py-2 cursor-pointer hover:bg-gray-50 rounded transition-colors`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm ${msg.isRead ? 'font-medium' : 'font-bold'} text-gray-900`}>
                          {msg.sender}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">{msg.subject}</p>
                        <p className="text-xs text-gray-500 mt-2">{msg.time}</p>
                      </div>
                      {!msg.isRead && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
                <button className="w-full text-center text-blue-600 hover:text-blue-700 text-sm font-medium py-2">
                  View All Messages
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="bg-pink-100 p-2 rounded-lg">
                    <Bell className="w-5 h-5 text-pink-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Medication Reminders</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {medicationReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{reminder.medication}</p>
                        <p className="text-xs text-gray-500">{reminder.time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`p-1 rounded-lg transition-colors ${
                        reminder.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {reminder.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <MapPin className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Pharmacies</h3>
                  </div>
                  <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium">
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {pharmacies.map((pharmacy) => (
                  <div key={pharmacy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                          {pharmacy.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{pharmacy.address}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{pharmacy.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-500">{pharmacy.distance} away</span>
                          {pharmacy.is24Hours && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              24/7
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-40"
      >
        <Bot className="w-6 h-6" />
      </button>

      {showAIChat && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6" />
              <div>
                <h3 className="font-bold">AI Health Assistant</h3>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setShowAIChat(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your health..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
