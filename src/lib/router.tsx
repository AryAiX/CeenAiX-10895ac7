import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Home } from '../pages/public/Home';
import { AIChat } from '../pages/public/AIChat';
import { FindDoctor } from '../pages/public/FindDoctor';
import { FindClinic } from '../pages/public/FindClinic';
import { Insurance } from '../pages/public/Insurance';
import { HealthEducation } from '../pages/public/HealthEducation';
import { Laboratories } from '../pages/public/Laboratories';
import { Pharmacy } from '../pages/public/Pharmacy';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>,
  },
  {
    path: '/appointment-showcase',
    element: <Layout><AppointmentDesignShowcase /></Layout>,
  },
  {
    path: '/patient/dashboard',
    element: <Layout><PatientDashboard /></Layout>,
  },
  {
    path: '/ai-chat',
    element: <Layout><AIChat /></Layout>,
  },
  {
    path: '/find-doctor',
    element: <Layout><FindDoctor /></Layout>,
  },
  {
    path: '/find-clinic',
    element: <Layout><FindClinic /></Layout>,
  },
  {
    path: '/insurance',
    element: <Layout><Insurance /></Layout>,
  },
  {
    path: '/health-education',
    element: <Layout><HealthEducation /></Layout>,
  },
  {
    path: '/laboratories',
    element: <Layout><Laboratories /></Layout>,
  },
  {
    path: '/patient/appointments',
    element: <Layout><PatientAppointments /></Layout>,
  },
  {
    path: '/patient/prescriptions',
    element: <Layout><PatientPrescriptions /></Layout>,
  },
  {
    path: '/pharmacy',
    element: <Layout><Pharmacy /></Layout>,
  },
  {
    path: '/patient/records',
    element: <Layout><PatientRecords /></Layout>,
  },
  {
    path: '/patient/messages',
    element: <Layout><PatientMessages /></Layout>,
  },
  {
    path: '/patient/profile',
    element: <Layout><PatientProfile /></Layout>,
  },
  {
    path: '/doctor/dashboard',
    element: <Layout><DoctorDashboard /></Layout>,
  },
  {
    path: '/doctor/appointments',
    element: <Layout><DoctorAppointments /></Layout>,
  },
  {
    path: '/doctor/patients',
    element: <Layout><DoctorPatients /></Layout>,
  },
  {
    path: '/doctor/prescriptions',
    element: <Layout><DoctorPrescriptions /></Layout>,
  },
  {
    path: '/doctor/messages',
    element: <Layout><DoctorMessages /></Layout>,
  },
  {
    path: '/doctor/profile',
    element: <Layout><DoctorProfile /></Layout>,
  },
]);
