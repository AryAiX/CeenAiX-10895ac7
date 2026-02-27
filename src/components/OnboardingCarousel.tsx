import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bot, Stethoscope, Calendar, Shield, Activity } from 'lucide-react';

interface Slide {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    icon: Bot,
    title: 'AI-Powered Health Assistant',
    description: 'Get instant medical guidance and personalized health insights powered by advanced artificial intelligence.',
    gradient: 'from-ceenai-cyan to-ceenai-blue',
  },
  {
    icon: Stethoscope,
    title: 'Connect with Top Doctors',
    description: 'Find and consult with verified healthcare professionals across all specialties in your area.',
    gradient: 'from-ceenai-blue to-ceenai-navy',
  },
  {
    icon: Calendar,
    title: 'Easy Appointment Booking',
    description: 'Schedule consultations, manage appointments, and receive reminders all in one place.',
    gradient: 'from-ceenai-cyan-light to-ceenai-blue',
  },
  {
    icon: Shield,
    title: 'Secure Health Records',
    description: 'Your medical history, prescriptions, and health data are encrypted and stored securely.',
    gradient: 'from-ceenai-blue-dark to-ceenai-cyan',
  },
  {
    icon: Activity,
    title: 'Track Your Health Journey',
    description: 'Monitor your health metrics, view trends, and share information with your healthcare providers.',
    gradient: 'from-ceenai-cyan to-ceenai-blue-light',
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
    <div className="relative h-full flex flex-col justify-center items-center p-12 bg-gradient-to-br from-ceenai-cyan/10 via-ceenai-blue/5 to-ceenai-navy/10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-ceenai-cyan/20 to-ceenai-blue/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-ceenai-blue/20 to-ceenai-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-8">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${slides[currentSlide].gradient} flex items-center justify-center shadow-2xl transform transition-all duration-500 hover:scale-110`}>
              <CurrentIcon className="w-16 h-16 text-white" />
            </div>
          </div>

          <div className="min-h-[200px] flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 transition-all duration-300">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed transition-all duration-300">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-ceenai-blue" />
          </button>

          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-8 bg-gradient-to-r from-ceenai-cyan to-ceenai-blue'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-ceenai-blue" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            {currentSlide + 1} / {slides.length}
          </p>
        </div>
      </div>
    </div>
  );
};
