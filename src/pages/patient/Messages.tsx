import React from 'react';
import { MessageSquare, Send, Clock } from 'lucide-react';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';

export const PatientMessages: React.FC = () => {
  const conversations = [
    {
      id: 1,
      doctor: 'Dr. Sarah Ahmed',
      specialty: 'General Medicine',
      lastMessage: 'Your lab results look good. Continue with current medications.',
      timestamp: '2026-02-26T14:30:00',
      unread: 2,
      avatar: 'SA'
    },
    {
      id: 2,
      doctor: 'Dr. Mohammed Hassan',
      specialty: 'Cardiology',
      lastMessage: 'Please schedule a follow-up appointment for next week.',
      timestamp: '2026-02-25T10:15:00',
      unread: 0,
      avatar: 'MH'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="patient" />
      <PageHeader
        title="Messages"
        subtitle="Communicate with your healthcare providers"
        icon={<MessageSquare className="w-6 h-6 text-white" />}
        backTo="/patient/dashboard"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <h2 className="text-lg font-bold text-white">Conversations</h2>
              </div>

              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{conversation.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{conversation.doctor}</h3>
                          {conversation.unread > 0 && (
                            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {conversation.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{conversation.specialty}</p>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        <div className="flex items-center space-x-1 mt-2">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">
                            {new Date(conversation.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[600px] flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SA</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Dr. Sarah Ahmed</h3>
                    <p className="text-xs text-blue-100">General Medicine</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                    <p className="text-sm text-gray-800">Hello! I've reviewed your recent lab results.</p>
                    <span className="text-xs text-gray-500 mt-1 block">10:30 AM</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-sm">
                    <p className="text-sm text-white">Thank you, doctor. How do they look?</p>
                    <span className="text-xs text-blue-100 mt-1 block">10:32 AM</span>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
                    <p className="text-sm text-gray-800">Your lab results look good. Continue with current medications.</p>
                    <span className="text-xs text-gray-500 mt-1 block">2:30 PM</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
