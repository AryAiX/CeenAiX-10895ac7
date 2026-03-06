import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Upload, User, Bot, Calendar, Sparkles } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI health assistant powered by advanced medical knowledge. I can help you:\n\n• Understand symptoms and health concerns\n• Get guidance on when to see a doctor\n• Find the right specialist for your needs\n• Answer general health questions\n• Provide wellness tips\n\nWhat can I help you with today?",
      timestamp: new Date(),
      suggestions: ['I have a headache', 'Check symptoms', 'Find a doctor', 'Wellness tips'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateResponse = (userInput: string): { content: string; suggestions?: string[] } => {
    const input = userInput.toLowerCase();

    if (input.includes('headache') || input.includes('head pain')) {
      return {
        content: "I understand you're experiencing a headache. Let me help you assess this:\n\n**Common causes:**\n• Tension or stress\n• Dehydration\n• Eye strain from screens\n• Lack of sleep\n• Caffeine withdrawal\n\n**When to see a doctor:**\n• Severe or sudden onset\n• Accompanied by fever, stiff neck, or vision changes\n• Lasting more than a few days\n• Getting progressively worse\n\n**Immediate relief:**\n• Rest in a quiet, dark room\n• Stay hydrated\n• Apply a cold compress\n\nWould you like me to help you find a neurologist or general practitioner?",
        suggestions: ['Find a neurologist', 'Find a GP', 'Other symptoms', 'Book appointment'],
      };
    }

    if (input.includes('fever') || input.includes('temperature')) {
      return {
        content: "Fever can be a sign your body is fighting an infection. Here's what you should know:\n\n**Normal response if:**\n• Temperature is below 102°F (39°C)\n• You have other cold/flu symptoms\n• It responds to medication\n\n**See a doctor if:**\n• Temperature above 103°F (39.4°C)\n• Lasts more than 3 days\n• Accompanied by severe headache, rash, or difficulty breathing\n• You have a weakened immune system\n\n**Self-care:**\n• Rest and stay hydrated\n• Take fever-reducing medication if appropriate\n• Monitor your temperature regularly\n\nShould I help you find a doctor for evaluation?",
        suggestions: ['Find a doctor now', 'Emergency care', 'More about fever', 'Other symptoms'],
      };
    }

    if (input.includes('find') && (input.includes('doctor') || input.includes('specialist'))) {
      return {
        content: "I can help you find the right healthcare professional! Our platform has:\n\n• **General Practitioners** - for routine care and checkups\n• **Specialists** - cardiologists, dermatologists, orthopedic surgeons, and more\n• **Video Consultations** - available for many doctors\n• **Same-day appointments** - often available\n\nWhat type of specialist are you looking for, or would you like to browse all available doctors?",
        suggestions: ['Browse all doctors', 'Cardiologist', 'Dermatologist', 'Pediatrician'],
      };
    }

    if (input.includes('appointment') || input.includes('book')) {
      return {
        content: "Great! I can help you book an appointment. Here's how it works:\n\n**Quick & Easy Process:**\n1. Browse our verified doctors\n2. Check available time slots\n3. Choose in-person or video consultation\n4. Confirm your booking\n\nYou can book appointments instantly with most of our doctors. Would you like to see available doctors now?",
        suggestions: ['View doctors', 'Video consultations', 'Emergency care', 'Ask another question'],
      };
    }

    if (input.includes('wellness') || input.includes('health tips') || input.includes('prevention')) {
      return {
        content: "Here are some evidence-based wellness tips for optimal health:\n\n**Daily Habits:**\n• Get 7-9 hours of quality sleep\n• Stay hydrated (8 glasses of water daily)\n• Exercise for 30 minutes most days\n• Eat a balanced diet with fruits and vegetables\n\n**Preventive Care:**\n• Regular health checkups\n• Keep vaccinations up to date\n• Mental health is as important as physical health\n• Manage stress through meditation or hobbies\n\n**Warning Signs to Watch:**\n• Unexplained weight changes\n• Persistent fatigue\n• Changes in appetite or sleep patterns\n\nWould you like specific tips for any health area?",
        suggestions: ['Nutrition advice', 'Exercise tips', 'Mental health', 'Schedule checkup'],
      };
    }

    if (input.includes('emergency') || input.includes('urgent') || input.includes('911')) {
      return {
        content: "**IMPORTANT: For life-threatening emergencies, call 911 immediately.**\n\nSeek emergency care if you experience:\n• Chest pain or pressure\n• Difficulty breathing\n• Severe bleeding\n• Loss of consciousness\n• Severe allergic reaction\n• Stroke symptoms (face drooping, arm weakness, speech difficulty)\n\nFor urgent but non-emergency care, I can help you:\n• Find urgent care clinics nearby\n• Connect with on-call doctors\n• Schedule same-day appointments\n\nIs this a medical emergency requiring 911?",
        suggestions: ['Find urgent care', 'Same-day appointment', 'Not an emergency', 'Continue chat'],
      };
    }

    if (input.includes('medication') || input.includes('medicine') || input.includes('prescription')) {
      return {
        content: "I can provide general information about medications, but remember:\n\n**Important:**\n• Always follow your doctor's prescription\n• Never share medications\n• Report side effects to your healthcare provider\n• Check for drug interactions\n\n**Common Questions:**\n• Take medications at the same time daily\n• Store as directed (temperature, light)\n• Don't skip doses without consulting your doctor\n• Keep a list of all medications you take\n\nFor prescription needs, I recommend:\n• Consulting with a doctor\n• Using our pharmacy finder\n• Setting up medication reminders\n\nWhat specific medication information do you need?",
        suggestions: ['Find pharmacy', 'Talk to doctor', 'Side effects info', 'Refill prescription'],
      };
    }

    if (input.includes('mental health') || input.includes('anxiety') || input.includes('depression') || input.includes('stress')) {
      return {
        content: "Your mental health matters just as much as physical health. I'm here to help:\n\n**Common Feelings:**\n• Stress and anxiety are normal responses\n• Many people experience these challenges\n• Help is available and effective\n\n**When to Seek Help:**\n• Feelings interfere with daily life\n• Lasting more than 2 weeks\n• Thoughts of self-harm\n• Significant changes in sleep or appetite\n\n**Immediate Support:**\n• National Suicide Prevention Lifeline: 988\n• Crisis Text Line: Text HOME to 741741\n\n**Professional Help:**\nI can connect you with:\n• Licensed therapists\n• Psychiatrists\n• Support groups\n\nWould you like help finding a mental health professional?",
        suggestions: ['Find therapist', 'Find psychiatrist', 'Coping strategies', 'Continue talking'],
      };
    }

    return {
      content: "I understand your concern. Based on what you've shared, here's my recommendation:\n\n**Next Steps:**\n• Consider scheduling a consultation with a healthcare professional for proper evaluation\n• Keep track of any symptoms and when they occur\n• Note any triggers or patterns you notice\n\n**I Can Help You:**\n• Find the right specialist for your needs\n• Book an appointment quickly\n• Answer more specific health questions\n• Provide general wellness guidance\n\nWhat would be most helpful for you right now?",
      suggestions: ['Find a doctor', 'Describe symptoms', 'Book appointment', 'Ask another question'],
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { content, suggestions } = generateResponse(currentInput);
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
        suggestions,
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion.toLowerCase().includes('browse') || suggestion.toLowerCase().includes('view doctors')) {
      navigate('/find-doctor');
      return;
    }
    setInput(suggestion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex flex-col">
      <Header />

      <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 mb-4 flex items-start space-x-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">AI Health Assistant</h3>
            <p className="text-xs text-blue-800">
              Get instant health guidance powered by medical knowledge. For appointments and records,{' '}
              <button
                onClick={() => navigate('/auth')}
                className="underline hover:text-blue-700 font-medium"
              >
                create a free account
              </button>
              .
            </p>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold">AI Health Chat</h2>
                <p className="text-blue-100 text-xs">Always here to help</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
            {messages.map((message) => (
              <div key={message.id} className="animate-fade-in">
                <div
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                        : 'bg-gradient-to-br from-green-100 to-cyan-100'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 max-w-2xl">
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-white border border-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                      <p
                        className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 text-blue-700 rounded-full text-xs font-medium transition-all hover:shadow-md hover:scale-105"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start space-x-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-cyan-100 flex items-center justify-center shadow-md">
                  <Bot className="w-5 h-5 text-green-600" />
                </div>
                <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-4 sm:p-6">
            <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Ask me anything about your health..."
                  rows={1}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none transition-colors"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Press Enter to send, Shift+Enter for new line
              </p>
              <p className="text-xs text-gray-400">
                AI-powered health guidance
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-white" />
              <div>
                <p className="text-white font-semibold text-sm">Ready for professional care?</p>
                <p className="text-blue-100 text-xs">Book with verified specialists instantly</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/find-doctor')}
              className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
            >
              Find Doctors
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4 px-4">
          This AI assistant provides general health information only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
      </div>
      <Footer />
    </div>
  );
};
