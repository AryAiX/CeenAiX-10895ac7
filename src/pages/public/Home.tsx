import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Footer } from '../../components/Footer';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import {
  Activity,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  MessageSquare,
  Pill,
  Search,
  Shield,
  Sparkles,
  TestTube,
  Users,
} from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const openRegistration = useCallback((role: 'patient' | 'doctor') => {
    navigate(`/auth/register?role=${role}&reset=1`);
  }, [navigate]);

  const features = useMemo(
    () => [
      {
        icon: Calendar,
        titleKey: 'home.featureCards.scheduling.title',
        descriptionKey: 'home.featureCards.scheduling.description',
        action: () => navigate('/find-doctor'),
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: FileText,
        titleKey: 'home.featureCards.records.title',
        descriptionKey: 'home.featureCards.records.description',
        action: () => openRegistration('patient'),
        color: 'from-emerald-500 to-teal-500',
      },
      {
        icon: Pill,
        titleKey: 'home.featureCards.prescription.title',
        descriptionKey: 'home.featureCards.prescription.description',
        action: () => navigate('/patient/prescriptions'),
        color: 'from-violet-500 to-fuchsia-500',
      },
      {
        icon: TestTube,
        titleKey: 'home.featureCards.intake.title',
        descriptionKey: 'home.featureCards.intake.description',
        action: () => navigate('/ai-chat'),
        color: 'from-amber-500 to-orange-500',
      },
      {
        icon: Sparkles,
        titleKey: 'home.featureCards.aiChat.title',
        descriptionKey: 'home.featureCards.aiChat.description',
        action: () => navigate('/ai-chat'),
        color: 'from-pink-500 to-rose-500',
      },
      {
        icon: Shield,
        titleKey: 'home.featureCards.secure.title',
        descriptionKey: 'home.featureCards.secure.description',
        action: () => navigate('/health-education'),
        color: 'from-indigo-500 to-blue-600',
      },
    ],
    [navigate, openRegistration]
  );

  const stats = useMemo(
    () => [
      { valueKey: 'home.stats.patientsValue', labelKey: 'home.stats.patients' },
      { valueKey: 'home.stats.doctorsValue', labelKey: 'home.stats.doctors' },
      { valueKey: 'home.stats.appointmentsValue', labelKey: 'home.stats.appointments' },
      { valueKey: 'home.stats.aiSupportValue', labelKey: 'home.stats.aiSupport' },
    ],
    []
  );

  const steps = useMemo(
    () => [
      {
        stepKey: 'home.steps.one.num',
        titleKey: 'home.steps.one.title',
        descriptionKey: 'home.steps.one.description',
        icon: Users,
      },
      {
        stepKey: 'home.steps.two.num',
        titleKey: 'home.steps.two.title',
        descriptionKey: 'home.steps.two.description',
        icon: Search,
      },
      {
        stepKey: 'home.steps.three.num',
        titleKey: 'home.steps.three.title',
        descriptionKey: 'home.steps.three.description',
        icon: Activity,
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="CeenAiX" className="h-10 w-10 rounded-xl" />
            <div>
              <p className="bg-gradient-to-r from-ceenai-cyan to-ceenai-blue bg-clip-text text-2xl font-bold text-transparent">
                CeenAiX
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                {t('brand.tagline')}
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              {t('home.features')}
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
              {t('home.howItWorks')}
            </a>
            <button
              type="button"
              onClick={() => navigate('/find-doctor')}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {t('home.findCare')}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher dense />
            <button
              type="button"
              onClick={() => openRegistration('patient')}
              className="rounded-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-xl"
            >
              {t('header.patient')}
            </button>
            <button
              type="button"
              onClick={() => openRegistration('doctor')}
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-ceenai-cyan hover:text-ceenai-blue"
            >
              {t('header.doctor')}
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-4 pb-28 pt-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.14),_transparent_34%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-900">
              <Sparkles className="h-4 w-4 text-cyan-600" />
              {t('home.hero.badge')}
            </div>

            <h1 className="mt-8 text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              {t('home.hero.line1')}
              <span className="block bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
                {t('home.hero.line2')}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              {t('home.hero.lead')}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/find-doctor')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:shadow-2xl"
              >
                {t('home.hero.ctaFindDoctor')}
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/ai-chat')}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4 text-lg font-semibold text-slate-900 shadow-sm transition hover:border-cyan-500 hover:text-cyan-700"
              >
                {t('home.hero.ctaAi')}
              </button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-slate-600">
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {t('home.hero.checkBooking')}
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {t('home.hero.checkIntake')}
              </div>
              <div className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                {t('home.hero.checkRecords')}
              </div>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-5 sm:pt-10">
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <img
                  src="https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt={t('home.hero.altConsultation')}
                  className="h-64 w-full object-cover"
                />
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{t('home.hero.supportValue')}</p>
                    <p className="text-sm text-slate-600">{t('home.hero.supportCaption')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
                <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  {t('home.hero.sideBadge')}
                </div>
                <h2 className="mt-5 text-2xl font-semibold">{t('home.hero.sideTitle')}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {t('home.hero.sideBody')}
                </p>
              </div>
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
                <img
                  src="https://images.pexels.com/photos/5215024/pexels-photo-5215024.jpeg?auto=compress&cs=tinysrgb&w=900"
                  alt={t('home.hero.altDoctorTools')}
                  className="h-80 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.labelKey} className="text-center">
              <div className="text-4xl font-bold md:text-5xl">{t(stat.valueKey)}</div>
              <div className="mt-2 text-sm font-medium uppercase tracking-[0.16em] text-cyan-100">
                {t(stat.labelKey)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t('home.featureSection.title')}
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              {t('home.featureSection.lead')}
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <button
                  key={feature.titleKey}
                  type="button"
                  onClick={feature.action}
                  className="group rounded-3xl border border-slate-200 bg-slate-50 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:bg-white hover:shadow-xl"
                >
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold text-slate-900 transition group-hover:text-cyan-700">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-slate-600">{t(feature.descriptionKey)}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {t('home.howItWorksSection.title')}
            </h2>
            <p className="mt-4 text-lg text-slate-600">{t('home.howItWorksSection.lead')}</p>
          </div>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.stepKey} className="relative">
                  <div className="mb-5 text-6xl font-bold text-cyan-100">{t(step.stepKey)}</div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold text-slate-900">{t(step.titleKey)}</h3>
                      <p className="mt-2 text-slate-600">{t(step.descriptionKey)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-ceenai-cyan via-ceenai-blue to-ceenai-navy px-8 py-16 text-center text-white shadow-2xl sm:px-12">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('home.cta.title')}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-cyan-50">
            {t('home.cta.lead')}
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => openRegistration('patient')}
              className="rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-ceenai-blue shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              {t('home.cta.patientPortal')}
            </button>
            <button
              type="button"
              onClick={() => openRegistration('doctor')}
              className="rounded-2xl border-2 border-white/70 bg-white/10 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/20"
            >
              {t('home.cta.doctorPortal')}
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
