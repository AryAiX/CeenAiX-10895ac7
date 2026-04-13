import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import {
  Activity,
  Award,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Menu,
  Shield,
  Users,
  X,
} from 'lucide-react';

type HomeCard = {
  icon: typeof Activity;
  title: string;
  description: string;
  action?: () => void;
};

type HomePlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

type HomePortal = {
  label: string;
  action: () => void;
  borderClass?: string;
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation('common');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isArabic = i18n.language.startsWith('ar');

  const copy = useMemo(
    () =>
      isArabic
        ? {
            navFeatures: 'الميزات',
            navHowItWorks: 'كيف يعمل',
            navPricing: 'الأسعار',
            navContact: 'تواصل معنا',
            signIn: 'تسجيل الدخول',
            brandTagline: 'صحتك، بإرشاد ذكي',
            heroTitleLine1: 'صحتك،',
            heroTitleLine2: 'بإرشاد ذكي',
            heroLead:
              'منصة الرعاية الصحية المدعومة بالذكاء الاصطناعي الرائدة في دبي. متوافقة مع هيئة الصحة بدبي ومعتمدة من NABIDH وموثوقة من آلاف المرضى ومقدمي الرعاية في الإمارات.',
            portalTitle: 'استعرض البوابات',
            portals: [
              { label: 'بوابة المريض', action: () => navigate('/auth/login?role=patient&redirect=%2Fpatient%2Fdashboard') },
              { label: 'بوابة الطبيب', action: () => navigate('/auth/login?role=doctor&redirect=%2Fdoctor%2Fdashboard') },
              { label: 'بوابة الصيدلية', action: () => navigate('/pharmacy') },
              { label: 'بوابة المختبر والأشعة', action: () => navigate('/laboratories') },
              { label: 'بوابة التأمين', action: () => navigate('/insurance') },
              { label: 'بوابة الإدارة', action: () => navigate('/auth/login'), borderClass: 'border-amber-600 hover:bg-amber-50' },
            ] as HomePortal[],
            stats: [
              { value: '٥٠ ألف+', label: 'مرضى نشطون' },
              { value: '٢٠٠+', label: 'منشآت رعاية صحية' },
              { value: '١ مليون+', label: 'استشارات' },
              { value: '٩٩٫٩٪', label: 'جاهزية المنصة' },
            ],
            featuresTitle: 'كل ما تحتاجه للرعاية الصحية الحديثة',
            featuresLead: 'إدارة صحية شاملة مدعومة بأحدث تقنيات الذكاء الاصطناعي',
            features: [
              {
                icon: Brain,
                title: 'رؤى صحية مدعومة بالذكاء الاصطناعي',
                description: 'احصل على توصيات صحية شخصية مدعومة بتقنيات ذكاء اصطناعي متقدمة',
                action: () => navigate('/ai-chat'),
              },
              {
                icon: Shield,
                title: 'آمن ومتوافق مع اللوائح',
                description: 'متوافق بالكامل مع لوائح الرعاية الصحية في الإمارات ومعتمد من NABIDH',
                action: () => navigate('/health-education'),
              },
              {
                icon: Clock,
                title: 'مرافق صحي على مدار الساعة',
                description: 'وصول دائم إلى بياناتك الصحية ومساعدك الذكي في أي وقت',
                action: () => navigate('/ai-chat'),
              },
              {
                icon: Users,
                title: 'فرق رعاية متكاملة',
                description: 'تعاون سلس بين الأطباء والصيدليات والمختبرات ضمن رحلة واحدة',
                action: () => navigate('/find-doctor'),
              },
              {
                icon: Activity,
                title: 'متابعة لحظية',
                description: 'تابع مؤشراتك الصحية وتلقَّ تنبيهات فورية عند الحاجة',
                action: () => navigate('/patient/dashboard'),
              },
              {
                icon: Award,
                title: 'تجربة رعاية متميزة',
                description: 'منصة الرعاية الصحية الرائدة في دبي والموثوقة من آلاف المستخدمين',
                action: () => navigate('/auth/portal-access?intent=register'),
              },
            ] as HomeCard[],
            howTitle: 'بسيط، سلس، وآمن',
            howLead: 'ابدأ مع CeenAiX في دقائق قليلة فقط',
            steps: [
              {
                num: '1',
                title: 'أنشئ حسابك',
                description: 'أنشئ حسابك مع التحقق من الهوية الإماراتية خلال أقل من 5 دقائق',
              },
              {
                num: '2',
                title: 'اربط بياناتك',
                description: 'اربط سجلاتك الصحية الحالية ومعلومات التأمين الخاصة بك',
              },
              {
                num: '3',
                title: 'ابدأ',
                description: 'ابدأ رحلتك الصحية الذكية مع رؤى وتوجيهات بالذكاء الاصطناعي',
              },
            ],
            pricingTitle: 'اختر خطتك',
            pricingLead: 'أسعار مرنة للأفراد والمؤسسات',
            pricingCta: 'ابدأ الآن',
            popular: 'الأكثر شيوعاً',
            plans: [
              {
                name: 'مريض',
                price: 'مجاني',
                description: 'للأفراد الذين يديرون صحتهم',
                features: [
                  'مساعد صحي بالذكاء الاصطناعي',
                  'سجلات صحية رقمية',
                  'حجز المواعيد',
                  'إدارة الوصفات',
                  'الوصول إلى نتائج المختبر',
                  'استشارات عن بُعد',
                ],
              },
              {
                name: 'مقدم رعاية صحية',
                price: 'مخصص',
                description: 'للعيادات والمستشفيات والمنشآت الصحية',
                highlighted: true,
                features: [
                  'كل ما في خطة المريض، بالإضافة إلى:',
                  'إدارة متعددة المستخدمين',
                  'تحليلات متقدمة',
                  'سير عمل سريري',
                  'دعم التكامل',
                  'دعم ذو أولوية',
                  'أدوات امتثال',
                ],
              },
              {
                name: 'مؤسسي',
                price: 'تواصل معنا',
                description: 'للمؤسسات الكبيرة والأنظمة الصحية',
                features: [
                  'كل ما في خطة مقدم الرعاية، بالإضافة إلى:',
                  'تكاملات مخصصة',
                  'مدير حساب مخصص',
                  'ضمانات SLA',
                  'خيارات العلامة البيضاء',
                  'أمن متقدم',
                  'تدريب وإعداد',
                ],
              },
            ] as HomePlan[],
            ctaTitle: 'هل أنت مستعد لتحويل تجربتك الصحية؟',
            ctaLead: 'انضم إلى آلاف المرضى ومقدمي الرعاية الصحية الذين يستخدمون CeenAiX',
            ctaButton: 'ابدأ اليوم',
            footerProduct: 'المنتج',
            footerCompany: 'الشركة',
            footerLegal: 'قانوني',
            footerFeatureLink: 'الميزات',
            footerPricingLink: 'الأسعار',
            footerSecurityLink: 'الأمان',
            footerAbout: 'من نحن',
            footerCareers: 'الوظائف',
            footerContactLink: 'تواصل معنا',
            footerPrivacy: 'سياسة الخصوصية',
            footerTerms: 'شروط الخدمة',
            footerCompliance: 'الامتثال',
            footerCopyright: '© 2026 CeenAiX Healthcare Technologies, Dubai, UAE. جميع الحقوق محفوظة.',
          }
        : {
            navFeatures: 'Features',
            navHowItWorks: 'How It Works',
            navPricing: 'Pricing',
            navContact: 'Contact',
            signIn: 'Sign In',
            brandTagline: 'Your Health, Intelligently Guided',
            heroTitleLine1: 'Your Health,',
            heroTitleLine2: 'Intelligently Guided',
            heroLead:
              "Dubai's leading AI-powered healthcare platform. DHA-compliant, NABIDH-certified, and trusted by thousands of patients and healthcare providers across the UAE.",
            portalTitle: 'Access Portal Demos',
            portals: [
              { label: 'Patient Portal', action: () => navigate('/auth/login?role=patient&redirect=%2Fpatient%2Fdashboard') },
              { label: 'Doctor Portal', action: () => navigate('/auth/login?role=doctor&redirect=%2Fdoctor%2Fdashboard') },
              { label: 'Pharmacy Portal', action: () => navigate('/pharmacy') },
              { label: 'Lab & Radiology Portal', action: () => navigate('/laboratories') },
              { label: 'Insurance Portal', action: () => navigate('/insurance') },
              { label: 'Admin Portal', action: () => navigate('/auth/login'), borderClass: 'border-amber-600 hover:bg-amber-50' },
            ] as HomePortal[],
            stats: [
              { value: '50K+', label: 'Active Patients' },
              { value: '200+', label: 'Healthcare Facilities' },
              { value: '1M+', label: 'Consultations' },
              { value: '99.9%', label: 'Uptime' },
            ],
            featuresTitle: 'Everything You Need for Modern Healthcare',
            featuresLead: 'Comprehensive healthcare management powered by cutting-edge AI technology',
            features: [
              {
                icon: Brain,
                title: 'AI-Powered Health Insights',
                description: 'Get personalized health recommendations powered by advanced AI technology',
                action: () => navigate('/ai-chat'),
              },
              {
                icon: Shield,
                title: 'DHA-Compliant & Secure',
                description: 'Fully compliant with UAE healthcare regulations and NABIDH-certified',
                action: () => navigate('/health-education'),
              },
              {
                icon: Clock,
                title: '24/7 Health Guardian',
                description: 'Round-the-clock access to your health data and AI assistant',
                action: () => navigate('/ai-chat'),
              },
              {
                icon: Users,
                title: 'Integrated Care Teams',
                description: 'Seamless collaboration between doctors, pharmacies, and laboratories',
                action: () => navigate('/find-doctor'),
              },
              {
                icon: Activity,
                title: 'Real-time Monitoring',
                description: 'Track your health metrics and receive instant alerts',
                action: () => navigate('/patient/dashboard'),
              },
              {
                icon: Award,
                title: 'Premium Care Experience',
                description: "Dubai's leading healthcare platform trusted by thousands",
                action: () => navigate('/auth/portal-access?intent=register'),
              },
            ] as HomeCard[],
            howTitle: 'Simple, Seamless, Secure',
            howLead: 'Get started with CeenAiX in just a few minutes',
            steps: [
              {
                num: '1',
                title: 'Sign Up',
                description: 'Create your account with Emirates ID verification in under 5 minutes',
              },
              {
                num: '2',
                title: 'Connect',
                description: 'Link your existing health records and insurance information',
              },
              {
                num: '3',
                title: 'Start',
                description: 'Begin your intelligent healthcare journey with AI-powered insights',
              },
            ],
            pricingTitle: 'Choose Your Plan',
            pricingLead: 'Flexible pricing for individuals and organizations',
            pricingCta: 'Get Started',
            popular: 'Most Popular',
            plans: [
              {
                name: 'Patient',
                price: 'Free',
                description: 'For individuals managing their health',
                features: [
                  'AI Health Assistant',
                  'Digital Health Records',
                  'Appointment Booking',
                  'Prescription Management',
                  'Lab Results Access',
                  'Telemedicine Consultations',
                ],
              },
              {
                name: 'Healthcare Provider',
                price: 'Custom',
                description: 'For clinics, hospitals, and healthcare facilities',
                highlighted: true,
                features: [
                  'Everything in Patient, plus:',
                  'Multi-user Management',
                  'Advanced Analytics',
                  'Clinical Workflows',
                  'Integration Support',
                  'Priority Support',
                  'Compliance Tools',
                ],
              },
              {
                name: 'Enterprise',
                price: 'Contact Us',
                description: 'For large organizations and health systems',
                features: [
                  'Everything in Healthcare Provider, plus:',
                  'Custom Integrations',
                  'Dedicated Account Manager',
                  'SLA Guarantees',
                  'White-label Options',
                  'Advanced Security',
                  'Training & Onboarding',
                ],
              },
            ] as HomePlan[],
            ctaTitle: 'Ready to Transform Your Healthcare Experience?',
            ctaLead: 'Join thousands of patients and healthcare providers using CeenAiX',
            ctaButton: 'Get Started Today',
            footerProduct: 'Product',
            footerCompany: 'Company',
            footerLegal: 'Legal',
            footerFeatureLink: 'Features',
            footerPricingLink: 'Pricing',
            footerSecurityLink: 'Security',
            footerAbout: 'About Us',
            footerCareers: 'Careers',
            footerContactLink: 'Contact',
            footerPrivacy: 'Privacy Policy',
            footerTerms: 'Terms of Service',
            footerCompliance: 'Compliance',
            footerCopyright: '© 2026 CeenAiX Healthcare Technologies, Dubai, UAE. All rights reserved.',
          },
    [isArabic, navigate]
  );

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-cyan-100 bg-white/95 shadow-sm shadow-cyan-500/5 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-3 text-start"
            >
              <img
                src="/ChatGPT_Image_Feb_27,_2026,_11_29_01_AM.png"
                alt="CeenAiX Logo"
                className="h-12 w-12 object-contain transition-transform duration-300 hover:scale-110"
              />
              <div>
                <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                  CeenAiX
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  {copy.brandTagline}
                </p>
              </div>
            </button>

            <div className="hidden items-center gap-8 md:flex">
              <a href="#features" className="font-medium text-slate-600 transition-all duration-300 hover:text-cyan-600">
                {copy.navFeatures}
              </a>
              <a href="#how-it-works" className="font-medium text-slate-600 transition-all duration-300 hover:text-cyan-600">
                {copy.navHowItWorks}
              </a>
              <a href="#pricing" className="font-medium text-slate-600 transition-all duration-300 hover:text-cyan-600">
                {copy.navPricing}
              </a>
              <a href="#contact" className="font-medium text-slate-600 transition-all duration-300 hover:text-cyan-600">
                {copy.navContact}
              </a>
              <LanguageSwitcher dense />
              <button
                type="button"
                onClick={() => navigate('/auth/portal-access?intent=login')}
                className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-2 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                {copy.signIn}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="p-2 text-gray-600 hover:text-gray-900 md:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <div className="space-y-3 px-4 py-4">
              <a href="#features" className="block text-slate-600 hover:text-gray-900">
                {copy.navFeatures}
              </a>
              <a href="#how-it-works" className="block text-slate-600 hover:text-gray-900">
                {copy.navHowItWorks}
              </a>
              <a href="#pricing" className="block text-slate-600 hover:text-gray-900">
                {copy.navPricing}
              </a>
              <a href="#contact" className="block text-slate-600 hover:text-gray-900">
                {copy.navContact}
              </a>
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
              <button
                type="button"
                onClick={() => navigate('/auth/portal-access?intent=login')}
                className="w-full rounded-lg bg-teal-600 px-6 py-2 text-white transition-colors hover:bg-teal-700"
              >
                {copy.signIn}
              </button>
            </div>
          </div>
        ) : null}
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-white px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-50">
          <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzA2YjZkNCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="animate-slideUp mb-6 text-5xl font-bold leading-tight text-slate-900 md:text-6xl">
              {copy.heroTitleLine1}
              <br />
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {copy.heroTitleLine2}
              </span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600">{copy.heroLead}</p>

            <div className="mb-12">
              <h3 className="mb-4 text-lg font-semibold text-gray-700">{copy.portalTitle}</h3>
              <div className="mx-auto grid max-w-2xl grid-cols-2 gap-3 md:grid-cols-3">
                {copy.portals.map((portal) => (
                  <button
                    key={portal.label}
                    type="button"
                    onClick={portal.action}
                    className={`rounded-lg border-2 border-teal-600 bg-white px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-teal-50 ${portal.borderClass ?? ''}`}
                  >
                    {portal.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mx-auto mt-20 grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            {copy.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mb-2 text-4xl font-bold text-teal-600">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{copy.featuresTitle}</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">{copy.featuresLead}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {copy.features.map((feature) => (
              <button
                key={feature.title}
                type="button"
                onClick={feature.action}
                className="group rounded-xl border-2 border-gray-200 bg-white p-8 text-start transition-all hover:border-teal-500 hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-teal-100">
                  <feature.icon className="h-7 w-7 text-teal-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="leading-relaxed text-gray-600">{feature.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{copy.howTitle}</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">{copy.howLead}</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {copy.steps.map((step) => (
              <div key={step.num} className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-2xl font-bold text-white">
                  {step.num}
                </div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">{copy.pricingTitle}</h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">{copy.pricingLead}</p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {copy.plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl bg-white p-8 ${
                  plan.highlighted ? 'scale-105 border-2 border-teal-600 shadow-xl' : 'border-2 border-gray-200'
                }`}
              >
                {plan.highlighted ? (
                  <div className="mb-4 inline-block rounded-full bg-teal-600 px-3 py-1 text-sm font-medium text-white">
                    {copy.popular}
                  </div>
                ) : null}
                <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mb-2 text-4xl font-bold text-gray-900">{plan.price}</div>
                <p className="mb-6 text-gray-600">{plan.description}</p>
                <button
                  type="button"
                  onClick={() => navigate('/auth/portal-access?intent=login')}
                  className={`mb-6 w-full rounded-lg py-3 font-medium transition-colors ${
                    plan.highlighted
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {copy.pricingCta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-600" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-teal-600 to-teal-700 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-4xl font-bold text-white">{copy.ctaTitle}</h2>
          <p className="mb-8 text-xl text-teal-100">{copy.ctaLead}</p>
          <button
            type="button"
            onClick={() => navigate('/auth/portal-access?intent=login')}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-medium text-teal-600 transition-colors hover:bg-gray-100"
          >
            {copy.ctaButton}
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <footer id="contact" className="bg-gray-900 px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-600">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CeenAiX</span>
              </div>
              <p className="text-gray-400">{copy.brandTagline}</p>
            </div>
            <div>
              <h4 className="mb-4 font-bold">{copy.footerProduct}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    {copy.footerFeatureLink}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    {copy.footerPricingLink}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white">
                    {copy.footerSecurityLink}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold">{copy.footerCompany}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white">{copy.footerAbout}</a></li>
                <li><a href="#contact" className="hover:text-white">{copy.footerCareers}</a></li>
                <li><a href="#contact" className="hover:text-white">{copy.footerContactLink}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-bold">{copy.footerLegal}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#contact" className="hover:text-white">{copy.footerPrivacy}</a></li>
                <li><a href="#contact" className="hover:text-white">{copy.footerTerms}</a></li>
                <li><a href="#contact" className="hover:text-white">{copy.footerCompliance}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>{copy.footerCopyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
