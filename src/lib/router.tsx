import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home } from '../pages/public/Home';
import { AIChat } from '../pages/public/AIChat';
import { FindDoctor } from '../pages/public/FindDoctor';
import { FindClinic } from '../pages/public/FindClinic';
import { Insurance } from '../pages/public/Insurance';
import { HealthEducation } from '../pages/public/HealthEducation';
import { Auth } from '../pages/Auth';
import { PatientDashboard } from '../pages/patient/Dashboard';
import { PatientAppointments } from '../pages/patient/Appointments';
import { PatientPrescriptions } from '../pages/patient/Prescriptions';
import { PatientRecords } from '../pages/patient/Records';
import { PatientMessages } from '../pages/patient/Messages';
import { PatientProfile } from '../pages/patient/Profile';
import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { DoctorAppointments } from '../pages/doctor/Appointments';
import { DoctorPrescriptions } from '../pages/doctor/Prescriptions';
import { DoctorPatients } from '../pages/doctor/Patients';
import { DoctorMessages } from '../pages/doctor/Messages';
import { DoctorProfile } from '../pages/doctor/Profile';
import { Navigation } from '../components/Navigation';

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: string[];
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && !requiredRole.includes(userProfile?.role || '')) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <>
      <Navigation />
      {children}
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/ai-chat',
    element: <AIChat />,
  },
  {
    path: '/find-doctor',
    element: <FindDoctor />,
  },
  {
    path: '/find-clinic',
    element: <FindClinic />,
  },
  {
    path: '/insurance',
    element: <Insurance />,
  },
  {
    path: '/health-education',
    element: <HealthEducation />,
  },
  {
    path: '/auth',
    element: <Auth />,
  },
  {
    path: '/patient/dashboard',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/appointments',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientAppointments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/prescriptions',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientPrescriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/records',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientRecords />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/messages',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientMessages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient/profile',
    element: (
      <ProtectedRoute requiredRole={['patient']}>
        <PatientProfile />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/dashboard',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/appointments',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorAppointments />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/patients',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorPatients />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/prescriptions',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorPrescriptions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/messages',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorMessages />
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctor/profile',
    element: (
      <ProtectedRoute requiredRole={['doctor']}>
        <DoctorProfile />
      </ProtectedRoute>
    ),
  },
]);
