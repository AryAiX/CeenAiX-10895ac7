import React, { useState } from 'react';
import { Navigation } from '../../components/Navigation';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Pill,
  MessageSquare,
  Bell,
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
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />

      <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="https://images.pexels.com/photos/3845126/pexels-photo-3845126.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Healthcare Professional"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/80 to-blue-600/80"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Welcome Back, Sarah!</h1>
              <p className="text-cyan-100 text-lg">Here's your health overview for today</p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <Heart className="w-6 h-6 text-white" />
                <div>
                  <p className="text-xs text-cyan-100">Health Score</p>
                  <p className="text-2xl font-bold text-white">{healthScore}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 -mt-20 mb-8 relative z-10">
          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/appointments')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Calendar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{upcomingAppointments}</p>
              <p className="text-sm text-cyan-600 font-medium">Appointments</p>
            </div>
          </div>

          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/prescriptions')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Medication"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Pill className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Active</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{activePrescriptions}</p>
              <p className="text-sm text-cyan-600 font-medium">Prescriptions</p>
            </div>
          </div>

          <div
            className="relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
            onClick={() => navigate('/patient/messages')}
          >
            <div className="absolute bottom-0 right-0 w-24 h-24 opacity-5">
              <img
                src="https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Communication"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">Unread</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">{unreadMessages}</p>
              <p className="text-sm text-cyan-600 font-medium">Messages</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Medical"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className="group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-cyan-50 hover:to-blue-50 border-2 border-gray-200 hover:border-cyan-500 p-6 rounded-xl transition-all duration-200 flex flex-col items-center space-y-3"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-cyan-700 text-center transition-colors">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Next Appointment
                </h2>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="text-cyan-600 text-sm font-semibold hover:text-cyan-700 transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <img
                    src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Doctor Consultation"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/70 to-blue-600/70"></div>
                <div className="relative flex items-start justify-between text-white">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=200"
                        alt="Doctor"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{nextAppointment.doctor}</h3>
                      <p className="text-cyan-100 text-sm mb-4">{nextAppointment.specialty}</p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 w-fit">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{nextAppointment.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold uppercase flex-shrink-0">
                    {nextAppointment.type}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Medical Records"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-6 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-3"></div>
                  Recent Activity
                </h2>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="group flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:border-cyan-200 border-2 border-transparent transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        {activity.type === 'lab' && <FlaskConical className="w-6 h-6 text-white" />}
                        {activity.type === 'prescription' && <Pill className="w-6 h-6 text-white" />}
                        {activity.type === 'screening' && <Stethoscope className="w-6 h-6 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.pexels.com/photos/3683041/pexels-photo-3683041.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Medication"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-2"></div>
                    Today's Medications
                  </h2>
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="space-y-3">
                  {medicationReminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        reminder.taken
                          ? 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200'
                          : 'bg-orange-50 border-orange-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{reminder.medication}</p>
                          <p className="text-xs text-gray-600 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {reminder.time}
                          </p>
                        </div>
                        {reminder.taken ? (
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-5">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=300"
                  alt="Healthcare"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-600 rounded-full mr-2"></div>
                  Health Features
                </h2>
                <div className="space-y-3">
                <button className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Wellness Goals</p>
                      <p className="text-xs text-gray-600">Track your progress</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Risk Assessment</p>
                      <p className="text-xs text-gray-600">AI health analysis</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Syringe className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Vaccination History</p>
                      <p className="text-xs text-gray-600">View & schedule</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Emergency Profile</p>
                      <p className="text-xs text-gray-600">Critical info access</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => navigate('/patient/profile')}
                  className="group w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-cyan-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Family Members</p>
                      <p className="text-xs text-gray-600">Manage linked accounts</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAIChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Health Assistant</h3>
                  <p className="text-cyan-100 text-sm">Powered by CeenAiX AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowAIChat(false)}
                className="w-10 h-10 hover:bg-white/20 rounded-xl transition-colors flex items-center justify-center"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-sm p-4 rounded-2xl shadow-md ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about symptoms, medications, or upload a document..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all"
                />
                <button className="w-12 h-12 bg-gray-100 hover:bg-gray-200 text-cyan-700 rounded-xl transition-all flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold flex items-center space-x-2"
                >
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
