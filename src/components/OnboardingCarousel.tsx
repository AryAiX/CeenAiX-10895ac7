import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Brain, Users, Bot, Pill, FlaskConical } from 'lucide-react';

interface Slide {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
  illustration: JSX.Element;
}

const slides: Slide[] = [
  {
    icon: Brain,
    title: 'AI Healthcare Assistant',
    description: 'Experience intelligent healthcare with AI-powered diagnostics, instant symptom analysis, and personalized health recommendations available 24/7.',
    gradient: 'from-emerald-400 to-teal-500',
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-56">
        <circle cx="200" cy="150" r="80" fill="#10b981" opacity="0.1" className="animate-pulse" />
        <circle cx="200" cy="150" r="60" fill="#14b8a6" opacity="0.2" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        <path d="M200,90 Q160,110 170,140 T200,180 Q240,160 230,130 T200,90" fill="#10b981" />
        <circle cx="185" cy="135" r="8" fill="white" />
        <circle cx="215" cy="135" r="8" fill="white" />
        <path d="M175,165 Q200,175 225,165" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M150,120 L120,100 M250,120 L280,100 M150,150 L110,160 M250,150 L290,160" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="120" cy="100" r="8" fill="#14b8a6" className="animate-bounce" />
        <circle cx="280" cy="100" r="8" fill="#14b8a6" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
        <circle cx="110" cy="160" r="6" fill="#14b8a6" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
        <circle cx="290" cy="160" r="6" fill="#14b8a6" className="animate-bounce" style={{ animationDelay: '0.9s' }} />
      </svg>
    ),
  },
  {
    icon: Users,
    title: 'Profile & Family',
    description: 'Manage your health profile and link family members. Track everyone\'s health records, appointments, prescriptions, and medical history in one secure platform.',
    gradient: 'from-blue-400 to-cyan-500',
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-56">
        <circle cx="200" cy="115" r="35" fill="#3b82f6" opacity="0.9" />
        <path d="M200,155 Q175,160 160,185 L240,185 Q225,160 200,155" fill="#3b82f6" opacity="0.9" />
        <circle cx="140" cy="155" r="25" fill="#06b6d4" opacity="0.75" className="animate-pulse" />
        <path d="M140,182 Q122,186 110,205 L170,205 Q158,186 140,182" fill="#06b6d4" opacity="0.75" />
        <circle cx="260" cy="155" r="25" fill="#06b6d4" opacity="0.75" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
        <path d="M260,182 Q242,186 230,205 L290,205 Q278,186 260,182" fill="#06b6d4" opacity="0.75" />
        <path d="M160,170 L180,145 M240,170 L220,145" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <circle cx="200" cy="105" r="3" fill="white" />
        <circle cx="190" cy="110" r="2" fill="white" />
        <circle cx="210" cy="110" r="2" fill="white" />
      </svg>
    ),
  },
  {
    icon: Bot,
    title: 'AI Agent Support',
    description: 'Your intelligent 24/7 health companion. Get instant medical answers, medication reminders, health tips, and personalized wellness guidance whenever you need it.',
    gradient: 'from-amber-400 to-yellow-500',
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-56">
        <rect x="145" y="105" width="110" height="130" rx="18" fill="#f59e0b" opacity="0.9" />
        <rect x="155" y="88" width="90" height="25" rx="12" fill="#fbbf24" />
        <circle cx="175" cy="135" r="11" fill="white" className="animate-pulse" />
        <circle cx="225" cy="135" r="11" fill="white" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
        <rect x="172" y="160" width="56" height="7" rx="3.5" fill="white" opacity="0.6" />
        <rect x="165" y="173" width="70" height="5" rx="2.5" fill="white" opacity="0.4" />
        <rect x="168" y="185" width="64" height="5" rx="2.5" fill="white" opacity="0.4" />
        <rect x="172" y="197" width="56" height="5" rx="2.5" fill="white" opacity="0.4" />
        <circle cx="115" cy="135" r="5" fill="#fde68a" className="animate-bounce" />
        <circle cx="285" cy="135" r="5" fill="#fde68a" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
        <circle cx="120" cy="170" r="4" fill="#fde68a" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
        <circle cx="280" cy="170" r="4" fill="#fde68a" className="animate-bounce" style={{ animationDelay: '0.7s' }} />
        <circle cx="125" cy="200" r="3" fill="#fde68a" className="animate-bounce" style={{ animationDelay: '0.9s' }} />
        <circle cx="275" cy="200" r="3" fill="#fde68a" className="animate-bounce" style={{ animationDelay: '1.1s' }} />
      </svg>
    ),
  },
  {
    icon: Pill,
    title: 'Pharmacy Services',
    description: 'Order medications online with ease. Track prescriptions, receive refill reminders, and get safe medication delivery from verified pharmacies directly to your door.',
    gradient: 'from-orange-400 to-rose-500',
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-56">
        <rect x="155" y="105" width="90" height="110" rx="8" fill="white" stroke="#f97316" strokeWidth="4" />
        <path d="M200,88 L183,105 L217,105 Z" fill="#f97316" />
        <rect x="175" y="122" width="50" height="13" rx="3" fill="#fb923c" className="animate-pulse" />
        <rect x="175" y="142" width="50" height="13" rx="3" fill="#fb923c" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
        <rect x="175" y="162" width="50" height="13" rx="3" fill="#fb923c" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
        <rect x="175" y="182" width="50" height="13" rx="3" fill="#fb923c" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
        <circle cx="125" cy="155" r="13" fill="#f43f5e" opacity="0.85" />
        <rect x="118" y="148" width="14" height="14" fill="white" opacity="0.85" />
        <rect x="121" y="145" width="8" height="20" fill="white" opacity="0.85" />
        <circle cx="275" cy="155" r="13" fill="#f43f5e" opacity="0.85" />
        <rect x="268" y="148" width="14" height="14" fill="white" opacity="0.85" />
        <rect x="271" y="145" width="8" height="20" fill="white" opacity="0.85" />
        <circle cx="130" cy="200" r="10" fill="#fb923c" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.8s' }} />
        <circle cx="270" cy="200" r="10" fill="#fb923c" opacity="0.6" className="animate-pulse" style={{ animationDelay: '1s' }} />
      </svg>
    ),
  },
  {
    icon: FlaskConical,
    title: 'Laboratory Services',
    description: 'Book lab tests effortlessly, access results instantly, and monitor your health metrics over time with comprehensive analytics from trusted partner laboratories.',
    gradient: 'from-sky-400 to-blue-600',
    illustration: (
      <svg viewBox="0 0 400 300" className="w-full h-56">
        <path d="M175,105 L175,155 Q175,172 158,188 L158,207 Q158,215 166,215 L234,215 Q242,215 242,207 L242,188 Q225,172 225,155 L225,105 Z" fill="#0ea5e9" opacity="0.9" />
        <rect x="175" y="100" width="50" height="8" rx="2" fill="#38bdf8" />
        <path d="M183,155 Q192,163 200,155 T217,155" stroke="#7dd3fc" strokeWidth="2.5" fill="none" className="animate-pulse" />
        <circle cx="190" cy="173" r="3.5" fill="#bae6fd" className="animate-bounce" />
        <circle cx="210" cy="177" r="3" fill="#bae6fd" className="animate-bounce" style={{ animationDelay: '0.3s' }} />
        <circle cx="200" cy="185" r="4" fill="#bae6fd" className="animate-bounce" style={{ animationDelay: '0.6s' }} />
        <circle cx="195" cy="195" r="2.5" fill="#bae6fd" className="animate-bounce" style={{ animationDelay: '0.9s' }} />
        <rect x="138" y="145" width="25" height="50" rx="4" fill="#0284c7" opacity="0.75" className="animate-pulse" />
        <rect x="237" y="145" width="25" height="50" rx="4" fill="#0284c7" opacity="0.75" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
        <circle cx="150" cy="160" r="2" fill="#bae6fd" opacity="0.8" />
        <circle cx="150" cy="170" r="2" fill="#bae6fd" opacity="0.8" />
        <circle cx="150" cy="180" r="2" fill="#bae6fd" opacity="0.8" />
        <circle cx="250" cy="160" r="2" fill="#bae6fd" opacity="0.8" />
        <circle cx="250" cy="170" r="2" fill="#bae6fd" opacity="0.8" />
        <circle cx="250" cy="180" r="2" fill="#bae6fd" opacity="0.8" />
      </svg>
    ),
  },
];

export const OnboardingCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const CurrentIcon = slides[currentSlide].icon;

  return (
    <div className="relative h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-teal-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="text-center mb-10 transform transition-all duration-500 hover:scale-105">
          <div className="flex items-center justify-center mb-6">
            <img
              src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
              alt="CeenAiX Logo"
              className="h-16 w-auto filter drop-shadow-2xl"
            />
          </div>
          <h1 className="text-xl font-medium text-white/70">Welcome to the Future of Healthcare</h1>
        </div>

        <div className="relative overflow-hidden min-h-[480px]">
          {slides.map((slide, index) => {
            const Icon = slide.icon;
            const isActive = index === currentSlide;
            const offset = index - currentSlide;

            return (
              <div
                key={index}
                className={`transition-all duration-700 ease-out ${
                  isActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 absolute top-0 left-0 w-full scale-95'
                } ${offset > 0 ? 'translate-x-full' : offset < 0 ? '-translate-x-full' : ''}`}
              >
                <div className="text-center text-white">
                  <div className="mb-8 transform transition-transform duration-700 hover:scale-105">
                    {slide.illustration}
                  </div>
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${slide.gradient} mb-5 shadow-2xl transform transition-all duration-500 hover:rotate-12 hover:scale-110`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
                    {slide.title}
                  </h2>
                  <p className="text-base text-white/75 leading-relaxed max-w-md mx-auto px-4">
                    {slide.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center space-x-5 mt-10">
          <button
            onClick={prevSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 hover:-translate-x-1 hover:shadow-lg hover:shadow-white/20"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex space-x-2.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 transform hover:scale-110 ${
                  index === currentSlide
                    ? 'w-10 bg-gradient-to-r from-white to-white/90 shadow-lg shadow-white/30'
                    : 'w-2 bg-white/25 hover:bg-white/40'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 hover:translate-x-1 hover:shadow-lg hover:shadow-white/20"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-white/40 font-medium tracking-wider">
            {currentSlide + 1} / {slides.length}
          </p>
        </div>
      </div>
    </div>
  );
};
