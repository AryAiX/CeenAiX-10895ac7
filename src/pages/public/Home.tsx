import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Building2,
  Shield,
  BookOpen,
  User,
  Stethoscope,
  Calendar,
  Heart,
  Star,
  CheckCircle2,
  ArrowRight,
  Award,
  TrendingUp
} from 'lucide-react';
import { GeometricBackground } from '../../components/GeometricBackground';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Health Chat',
      description: 'Get instant medical guidance from our AI-powered health assistant',
      action: () => navigate('/ai-chat'),
      gradient: 'from-ceenai-cyan to-ceenai-blue',
      image: 'https://images.pexels.com/photos/8438971/pexels-photo-8438971.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: Search,
      title: 'Find a Doctor',
      description: 'Browse specialists by expertise, location, and availability',
      action: () => navigate('/find-doctor'),
      gradient: 'from-ceenai-blue to-ceenai-navy',
      image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: Building2,
      title: 'Find Clinics',
      description: 'Discover healthcare facilities near you',
      action: () => navigate('/find-clinic'),
      gradient: 'from-ceenai-cyan-light to-ceenai-cyan',
      image: 'https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: Shield,
      title: 'Insurance Plans',
      description: 'Compare coverage options and find the right plan',
      action: () => navigate('/insurance'),
      gradient: 'from-ceenai-blue-dark to-ceenai-blue',
      image: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: BookOpen,
      title: 'Health Education',
      description: 'Access medical articles and preventive care guides',
      action: () => navigate('/health-education'),
      gradient: 'from-ceenai-cyan to-ceenai-blue-light',
      image: 'https://images.pexels.com/photos/3401897/pexels-photo-3401897.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      icon: User,
      title: 'Patient Profile',
      description: 'Manage your health information and medical history',
      action: () => navigate('/patient/profile'),
      gradient: 'from-ceenai-blue to-ceenai-cyan',
      image: 'https://images.pexels.com/photos/4386464/pexels-photo-4386464.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
  ];

  const stats = [
    { icon: User, value: '15,000+', label: 'Active Patients' },
    { icon: Stethoscope, value: '850+', label: 'Expert Doctors' },
    { icon: Calendar, value: '75,000+', label: 'Appointments' },
    { icon: Star, value: '4.9/5', label: 'Patient Rating' }
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Patient',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
      comment: 'CeenAiX has completely transformed how I manage my healthcare. The AI chat feature is incredibly helpful and booking appointments is seamless.',
      rating: 5
    },
    {
      name: 'Dr. James Martinez',
      role: 'Cardiologist',
      image: 'https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=200',
      comment: 'This platform streamlined my practice management. I can focus more on patient care and less on administrative tasks.',
      rating: 5
    },
    {
      name: 'Emily Chen',
      role: 'Patient',
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
      comment: 'The convenience of accessing my health records and communicating with my doctor anytime is unmatched. Highly recommended!',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ceenai-cyan/5 relative overflow-hidden">
      <GeometricBackground />

      <nav className="bg-white/95 backdrop-blur-lg shadow-soft sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                alt="CeenAiX Logo"
                className="h-12 w-auto"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy bg-clip-text text-transparent">
                CeenAiX
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => navigate('/find-doctor')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
                Doctors
              </button>
              <button onClick={() => navigate('/find-clinic')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
                Clinics
              </button>
              <button onClick={() => navigate('/pharmacy')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
                Pharmacy
              </button>
              <button onClick={() => navigate('/laboratories')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
                Laboratories
              </button>
              <button onClick={() => navigate('/insurance')} className="text-gray-700 hover:text-ceenai-blue font-medium transition-colors">
                Insurance
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/patient/profile')}
                className="px-6 py-2.5 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue hover:from-ceenai-cyan-dark hover:to-ceenai-blue-dark text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                Patient
              </button>
              <button
                onClick={() => navigate('/doctor/profile')}
                className="px-6 py-2.5 border-2 border-ceenai-navy text-ceenai-navy hover:bg-ceenai-navy hover:text-white font-semibold rounded-xl transition-all"
              >
                Doctor
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern healthcare"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center space-x-2 bg-ceenai-cyan/10 border border-ceenai-cyan/30 text-ceenai-blue px-5 py-2.5 rounded-full backdrop-blur-sm">
                <Award className="w-5 h-5" />
                <span className="text-sm font-semibold">Trusted by 15,000+ Patients</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="block mt-2 bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Experience healthcare powered by AI. Get instant medical insights, connect with top specialists,
                and manage your health journey all in one intelligent platform.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/find-doctor')}
                  className="group px-8 py-4 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white rounded-xl font-semibold shadow-medium hover:shadow-hard transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                >
                  <span>Find a Doctor</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/ai-chat')}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-ceenai-cyan hover:text-ceenai-blue transition-all duration-300 hover:shadow-lg"
                >
                  Try AI Assistant
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">No waiting time</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <span className="text-gray-700 font-medium">24/7 available</span>
                </div>
              </div>
            </div>

            <div className="relative animate-fade-in lg:block hidden">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 h-64">
                    <img
                      src="https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Doctor with patient"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 h-80">
                    <img
                      src="https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Healthcare technology"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-12">
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 h-80">
                    <img
                      src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Medical professional"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 h-64">
                    <img
                      src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Modern clinic"
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-hard p-6 animate-bounce-in border border-gray-100 z-20">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">24/7</p>
                    <p className="text-sm text-gray-600 font-medium">Healthcare Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="w-12 h-12 text-white/90 mx-auto mb-4" />
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-ceenai-cyan-light font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need for Better Health
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed for the modern patient
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <button
                  key={index}
                  onClick={feature.action}
                  className="group bg-white rounded-3xl shadow-soft hover:shadow-hard transition-all duration-500 overflow-hidden text-left border border-gray-100 hover:border-ceenai-cyan/50 hover:-translate-y-2 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className={`absolute bottom-4 left-4 w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ceenai-blue transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Patients & Doctors
            </h2>
            <p className="text-xl text-gray-600">
              See what our community has to say
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 border border-gray-100 animate-scale-in"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center space-x-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-ceenai-cyan/30"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy rounded-3xl p-16 text-center shadow-hard">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Transform Your Healthcare?
              </h2>
              <p className="text-xl text-ceenai-cyan-light mb-10 max-w-2xl mx-auto">
                Join thousands of patients and healthcare providers using CeenAiX for smarter,
                faster, and more personalized care.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate('/patient/profile')}
                  className="px-10 py-4 bg-white text-ceenai-blue hover:bg-gray-50 font-bold rounded-xl transition-all text-lg shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  Patient Portal
                </button>
                <button
                  onClick={() => navigate('/doctor/profile')}
                  className="px-10 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 font-bold rounded-xl transition-all text-lg"
                >
                  Doctor Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                  alt="CeenAiX Logo"
                  className="h-10 w-auto"
                />
                <span className="text-xl font-bold text-white">CeenAiX</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Secure healthcare platform with AI-powered insights
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/find-doctor')} className="hover:text-ceenai-cyan transition-colors">Find Doctors</button></li>
                <li><button onClick={() => navigate('/find-clinic')} className="hover:text-ceenai-cyan transition-colors">Find Clinics</button></li>
                <li><button onClick={() => navigate('/ai-chat')} className="hover:text-ceenai-cyan transition-colors">AI Health Chat</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/health-education')} className="hover:text-ceenai-cyan transition-colors">Health Education</button></li>
                <li><button onClick={() => navigate('/insurance')} className="hover:text-ceenai-cyan transition-colors">Insurance</button></li>
                <li><a href="#" className="hover:text-ceenai-cyan transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@ceenaix.com</li>
                <li>1-800-CEENAIX</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">© 2026 CeenAiX. DHA-compliant healthcare technology. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
