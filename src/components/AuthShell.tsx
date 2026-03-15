import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { GeometricBackground } from './GeometricBackground';

interface AuthShellProps {
  badge: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthShell = ({
  badge,
  title,
  description,
  children,
  footer,
}: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-ceenai-cyan/5 relative overflow-hidden">
      <GeometricBackground />

      <div className="relative z-10 min-h-screen px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden rounded-[2rem] bg-gradient-to-br from-ceenai-navy via-ceenai-blue-dark to-ceenai-blue p-10 text-white shadow-2xl lg:flex lg:flex-col lg:justify-between">
            <div className="space-y-6">
              <Link to="/" className="inline-flex items-center gap-3">
                <img
                  src="/ChatGPT_Image_Feb_27,_2026,_11_30_50_AM.png"
                  alt="CeenAiX"
                  className="h-11 w-auto"
                />
                <span className="text-2xl font-bold tracking-tight">CeenAiX</span>
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold">
                <Sparkles className="h-4 w-4" />
                <span>{badge}</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight">
                  Secure healthcare access built for patients and clinicians.
                </h1>
                <p className="max-w-xl text-base text-white/80">
                  Access your care journey, communicate securely, and move through the
                  CeenAiX platform with role-based experiences designed for patients and clinicians.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <HeartPulse className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">Patient-first journeys</p>
                <p className="mt-2 text-sm text-white/70">Appointments, records, prescriptions.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <Stethoscope className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">Doctor-ready workflows</p>
                <p className="mt-2 text-sm text-white/70">Role-aware routing and profile setup.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
                <ShieldCheck className="h-6 w-6 text-ceenai-cyan-light" />
                <p className="mt-3 text-sm font-semibold">Secure by default</p>
                <p className="mt-2 text-sm text-white/70">Supabase auth with guarded routes.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white/95 p-6 shadow-xl backdrop-blur sm:p-8">
              <div className="mb-8 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-ceenai-cyan/10 px-4 py-2 text-sm font-semibold text-ceenai-blue">
                  <Sparkles className="h-4 w-4" />
                  <span>{badge}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
                  <p className="mt-3 text-base leading-relaxed text-gray-600">{description}</p>
                </div>
              </div>

              <div className="space-y-6">{children}</div>

              {footer ? <div className="mt-8 border-t border-gray-100 pt-6">{footer}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
