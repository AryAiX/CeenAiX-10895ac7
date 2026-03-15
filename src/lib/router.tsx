import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from './auth-context';
import type { UserRole } from '../types';
import { Home } from '../pages/public/Home';
import { AIChat } from '../pages/public/AIChat';
import { FindDoctor } from '../pages/public/FindDoctor';
import { FindClinic } from '../pages/public/FindClinic';
import { Insurance } from '../pages/public/Insurance';
import { HealthEducation } from '../pages/public/HealthEducation';
import { Laboratories } from '../pages/public/Laboratories';
import { Pharmacy } from '../pages/public/Pharmacy';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyOTP } from '../pages/auth/VerifyOTP';
import { Onboarding } from '../pages/auth/Onboarding';
import { PatientDashboard } from '../pages/patient/Dashboard';
import { PatientAppointments } from '../pages/patient/Appointments';
import { PatientPrescriptions } from '../pages/patient/Prescriptions';
import { PatientRecords } from '../pages/patient/Records';
import { PatientMessages } from '../pages/patient/Messages';
import { Profile as PatientProfile } from '../pages/patient/Profile';
import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { DoctorAppointments } from '../pages/doctor/Appointments';
import { DoctorPrescriptions } from '../pages/doctor/Prescriptions';
import { DoctorPatients } from '../pages/doctor/Patients';
import { DoctorMessages } from '../pages/doctor/Messages';
import { DoctorProfile } from '../pages/doctor/Profile';
import { AppointmentDesignShowcase } from '../pages/AppointmentDesignShowcase';
import { AccessDenied } from '../pages/system/AccessDenied';

const withLayout = (page: ReactNode) => <Layout>{page}</Layout>;

const withProtection = (page: ReactNode, allowedRoles?: UserRole[]) => (
  <ProtectedRoute allowedRoles={allowedRoles}>{withLayout(page)}</ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: withLayout(<Home />),
  },
  {
    path: '/appointment-showcase',
    element: withLayout(<AppointmentDesignShowcase />),
  },
  {
    path: '/auth/login',
    element: <Login />,
  },
  {
    path: '/auth/register',
    element: <Register />,
  },
  {
    path: '/auth/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/auth/verify-otp',
    element: <VerifyOTP />,
  },
  {
    path: '/auth/onboarding',
    element: (
      <ProtectedRoute>
        <Onboarding />
      </ProtectedRoute>
    ),
  },
  {
    path: '/access-denied',
    element: <AccessDenied />,
  },
  {
    path: '/patient/dashboard',
    element: withProtection(<PatientDashboard />, ['patient']),
  },
  {
    path: '/ai-chat',
    element: withLayout(<AIChat />),
  },
  {
    path: '/find-doctor',
    element: withLayout(<FindDoctor />),
  },
  {
    path: '/find-clinic',
    element: withLayout(<FindClinic />),
  },
  {
    path: '/insurance',
    element: withLayout(<Insurance />),
  },
  {
    path: '/health-education',
    element: withLayout(<HealthEducation />),
  },
  {
    path: '/laboratories',
    element: withLayout(<Laboratories />),
  },
  {
    path: '/patient/appointments',
    element: withProtection(<PatientAppointments />, ['patient']),
  },
  {
    path: '/patient/prescriptions',
    element: withProtection(<PatientPrescriptions />, ['patient']),
  },
  {
    path: '/pharmacy',
    element: withLayout(<Pharmacy />),
  },
  {
    path: '/patient/records',
    element: withProtection(<PatientRecords />, ['patient']),
  },
  {
    path: '/patient/messages',
    element: withProtection(<PatientMessages />, ['patient']),
  },
  {
    path: '/patient/profile',
    element: withProtection(<PatientProfile />, ['patient']),
  },
  {
    path: '/doctor/dashboard',
    element: withProtection(<DoctorDashboard />, ['doctor']),
  },
  {
    path: '/doctor/appointments',
    element: withProtection(<DoctorAppointments />, ['doctor']),
  },
  {
    path: '/doctor/patients',
    element: withProtection(<DoctorPatients />, ['doctor']),
  },
  {
    path: '/doctor/prescriptions',
    element: withProtection(<DoctorPrescriptions />, ['doctor']),
  },
  {
    path: '/doctor/messages',
    element: withProtection(<DoctorMessages />, ['doctor']),
  },
  {
    path: '/doctor/profile',
    element: withProtection(<DoctorProfile />, ['doctor']),
  },
]);
