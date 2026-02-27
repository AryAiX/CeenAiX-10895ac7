import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Pill,
  FileText,
  MessageSquare,
  Activity,
  Bell,
  Plus,
  Bot,
  Send,
  X,
  ChevronRight,
  Heart,
  Stethoscope,
  FlaskConical,
  Shield,
  Users,
  TrendingUp,
  Target,
  Syringe,
  Video,
  CreditCard,
  Camera,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m your AI health assistant. How can I help you today? I can help with symptom checking, medication queries, appointment booking, and analyzing your health documents.' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const healthScore = 85;
  const upcomingAppointments = 2;
  const activePrescriptions = 3;
  const unreadMessages = 2;

  const nextAppointment = {
    doctor: 'Dr. Sarah Ahmed',
    specialty: 'General Medicine',
    date: '2026-03-02',
    time: '10:00 AM',
    type: 'in-person'
  };

  const medicationReminders = [
    { id: 1, medication: 'Lisinopril 10mg', time: '8:00 AM', taken: true },
    { id: 2, medication: 'Metformin 500mg', time: '8:00 PM', taken: false }
  ];

  const recentActivity = [
    { id: 1, type: 'lab', title: 'Blood Test Results Available', time: '2 hours ago', status: 'new' },
    { id: 2, type: 'prescription', title: 'Prescription Ready for Pickup', time: '1 day ago', status: 'action' },
    { id: 3, type: 'screening', title: 'Annual Physical Due', time: '3 days ago', status: 'reminder' }
  ];

  const quickActions = [
    { icon: Calendar, label: 'Book Appointment', action: () => navigate('/patient/appointments'), color: 'from-blue-500 to-blue-600' },
    { icon: Bot, label: 'AI Health Chat', action: () => setShowAIChat(true), color: 'from-purple-500 to-purple-600' },
    { icon: Camera, label: 'Scan Document', action: () => {}, color: 'from-green-500 to-green-600' },
    { icon: FlaskConical, label: 'Symptom Checker', action: () => {}, color: 'from-orange-500 to-orange-600' },
    { icon: Video, label: 'Virtual Consult', action: () => {}, color: 'from-pink-500 to-pink-600' },
    { icon: CreditCard, label: 'Insurance', action: () => {}, color: 'from-cyan-500 to-cyan-600' },
  ];

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: chatInput }]);
      setChatInput('');
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I understand your concern. Based on your health profile, I can help you with that. Would you like me to analyze any documents, check symptoms, or schedule an appointment?'
        }]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Navigation role="patient" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Here's your health overview for today</p>
        </div>

        {/* AI Health Summary & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <Heart className="w-10 h-10 text-white/80" />
              <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full">AI Score</span>
            </div>
            <div className="text-5xl font-bold mb-2">{healthScore}</div>
            <p className="text-green-100 text-sm">Health Wellness Score</p>
            <div className="mt-4 bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: `${healthScore}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/patient/appointments')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Upcoming Appointments</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{upcomingAppointments}</p>
                <p className="text-sm text-blue-600 mt-2 flex items-center">
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/patient/prescriptions')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active Prescriptions</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{activePrescriptions}</p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  Manage <ChevronRight className="w-4 h-4 ml-1" />
                </p>
              </div>
              <Pill className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all cursor-pointer" onClick={() => navigate('/patient/messages')}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Unread Messages</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{unreadMessages}</p>
                <p className="text-sm text-purple-600 mt-2 flex items-center">
                  Read messages <ChevronRight className="w-4 h-4 ml-1" />
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`bg-gradient-to-br ${action.color} text-white p-6 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 flex flex-col items-center space-y-3`}
                  >
                    <action.icon className="w-8 h-8" />
                    <span className="text-sm font-semibold text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Next Appointment */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Next Appointment</h2>
                <button onClick={() => navigate('/patient/appointments')} className="text-blue-600 text-sm font-semibold hover:text-blue-700">
                  View All
                </button>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-5">
                <div className="flex items-start justify-between text-white">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{nextAppointment.doctor}</h3>
                    <p className="text-blue-100 text-sm">{nextAppointment.specialty}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{new Date(nextAppointment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{nextAppointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase">
                    {nextAppointment.type}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'new' ? 'bg-blue-100' :
                      activity.status === 'action' ? 'bg-orange-100' :
                      'bg-purple-100'
                    }`}>
                      {activity.type === 'lab' && <FlaskConical className="w-5 h-5 text-blue-600" />}
                      {activity.type === 'prescription' && <Pill className="w-5 h-5 text-orange-600" />}
                      {activity.type === 'screening' && <Stethoscope className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Medication Reminders */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Today's Medications</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {medicationReminders.map((reminder) => (
                  <div key={reminder.id} className={`p-4 rounded-xl border-2 ${
                    reminder.taken ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm">{reminder.medication}</p>
                        <p className="text-xs text-gray-600 mt-1">{reminder.time}</p>
                      </div>
                      {reminder.taken ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Features */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Health Features</h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:shadow-md transition-all border border-purple-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Wellness Goals</p>
                      <p className="text-xs text-gray-600">Track your progress</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:shadow-md transition-all border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Risk Assessment</p>
                      <p className="text-xs text-gray-600">AI health analysis</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:shadow-md transition-all border border-green-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Syringe className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Vaccination History</p>
                      <p className="text-xs text-gray-600">View & schedule</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl hover:shadow-md transition-all border border-orange-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Emergency Profile</p>
                      <p className="text-xs text-gray-600">Critical info access</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>

                <button onClick={() => navigate('/patient/profile')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:shadow-md transition-all border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-500 p-2 rounded-lg">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Family Members</p>
                      <p className="text-xs text-gray-600">Manage linked accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Health Assistant</h3>
                  <p className="text-purple-100 text-sm">Powered by CeenAiX AI</p>
                </div>
              </div>
              <button onClick={() => setShowAIChat(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-sm p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none'
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-100">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about symptoms, medications, or upload a document..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <button className="flex items-center space-x-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
                <button onClick={handleSendMessage} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
