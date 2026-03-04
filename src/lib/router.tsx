import { createBrowserRouter } from 'react-router-dom';
import { Home } from '../pages/public/Home';
import { AIChat } from '../pages/public/AIChat';
import { FindDoctor } from '../pages/public/FindDoctor';
import { FindClinic } from '../pages/public/FindClinic';
import { Insurance } from '../pages/public/Insurance';
import { HealthEducation } from '../pages/public/HealthEducation';
import { Laboratories } from '../pages/public/Laboratories';
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
    element: <Home />,
  },
  {
    path: '/appointment-showcase',
    element: <AppointmentDesignShowcase />,
  },
  {
    path: '/patient/dashboard',
    element: <PatientDashboard />,
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
    path: '/laboratories',
    element: <Laboratories />,
  },
  {
    path: '/patient/appointments',
    element: <PatientAppointments />,
  },
  {
    path: '/patient/prescriptions',
    element: <PatientPrescriptions />,
  },
  {
    path: '/pharmacy',
    element: <PatientPrescriptions />,
  },
  {
    path: '/patient/records',
    element: <PatientRecords />,
  },
  {
    path: '/patient/messages',
    element: <PatientMessages />,
  },
  {
    path: '/patient/profile',
    element: <PatientProfile />,
  },
  {
    path: '/doctor/dashboard',
    element: <DoctorDashboard />,
  },
  {
    path: '/doctor/appointments',
    element: <DoctorAppointments />,
  },
  {
    path: '/doctor/patients',
    element: <DoctorPatients />,
  },
  {
    path: '/doctor/prescriptions',
    element: <DoctorPrescriptions />,
  },
  {
    path: '/doctor/messages',
    element: <DoctorMessages />,
  },
  {
    path: '/doctor/profile',
    element: <DoctorProfile />,
  },
]);
