import type { ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { PortalShell } from '../components/PortalShell';
import { ProtectedRoute } from './auth-context';
import { Home } from '../pages/public/Home';
import { AIChat } from '../pages/public/AIChat';
import { FindDoctor } from '../pages/public/FindDoctor';
import { FindClinic } from '../pages/public/FindClinic';
import { Insurance } from '../pages/public/Insurance';
import { HealthEducation } from '../pages/public/HealthEducation';
import { Laboratories } from '../pages/public/Laboratories';
import { Pharmacy } from '../pages/public/Pharmacy';
import { Login } from '../pages/auth/Login';
import { PortalAccess } from '../pages/auth/PortalAccess';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyOTP } from '../pages/auth/VerifyOTP';
import { Onboarding } from '../pages/auth/Onboarding';
import { PatientDashboard } from '../pages/patient/Dashboard';
import { PatientAppointments } from '../pages/patient/Appointments';
import { BookAppointment } from '../pages/patient/BookAppointment';
import { PatientPrescriptions } from '../pages/patient/Prescriptions';
import { PatientRecords } from '../pages/patient/Records';
import { PatientAIChat } from '../pages/patient/AIChat';
import { PatientPreVisitAssessment } from '../pages/patient/PreVisitAssessment';
import { PatientMessages } from '../pages/patient/Messages';
import { Profile as PatientProfile } from '../pages/patient/Profile';
import { PatientLabResults } from '../pages/patient/LabResults';
import { PatientNotifications } from '../pages/patient/Notifications';
import { PatientTelemedicineConsultation } from '../pages/patient/TelemedicineConsultation';
import { PatientSettings } from '../pages/patient/Settings';
import { PatientImaging } from '../pages/patient/Imaging';
import { PatientInsurance } from '../pages/patient/Insurance';
import { PatientDocuments } from '../pages/patient/Documents';
import { DoctorDashboard } from '../pages/doctor/Dashboard';
import { DoctorAppointments } from '../pages/doctor/Appointments';
import { DoctorAppointmentDetail } from '../pages/doctor/AppointmentDetail';
import { DoctorPrescriptions } from '../pages/doctor/Prescriptions';
import { CreatePrescription } from '../pages/doctor/CreatePrescription';
import { DoctorPatients } from '../pages/doctor/Patients';
import { DoctorPatientDetail } from '../pages/doctor/PatientDetail';
import { DoctorLabOrders } from '../pages/doctor/LabOrders';
import { CreateLabOrder } from '../pages/doctor/CreateLabOrder';
import { DoctorMessages } from '../pages/doctor/Messages';
import { DoctorNotifications } from '../pages/doctor/Notifications';
import { DoctorSchedule } from '../pages/doctor/Schedule';
import { DoctorProfile } from '../pages/doctor/Profile';
import { DoctorConsultationWorkspace } from '../pages/doctor/ConsultationWorkspace';
import { DoctorSettings } from '../pages/doctor/Settings';
import { DoctorImaging } from '../pages/doctor/Imaging';
import { DoctorEarnings } from '../pages/doctor/Earnings';
import { DoctorPortal } from '../pages/doctor/Portal';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminCompliance } from '../pages/admin/Compliance';
import { AdminSystemHealth } from '../pages/admin/SystemHealth';
import { AdminOrganizations } from '../pages/admin/Organizations';
import { AdminUsers } from '../pages/admin/Users';
import { AdminDiagnostics } from '../pages/admin/Diagnostics';
import { AdminAiAnalytics } from '../pages/admin/AIAnalytics';
import { LabDashboard } from '../pages/lab/Dashboard';
import { LabReferrals } from '../pages/lab/Referrals';
import { LabResultEntry } from '../pages/lab/ResultEntry';
import { LabRadiology } from '../pages/lab/Radiology';
import { PharmacyDashboard } from '../pages/pharmacy/Dashboard';
import { PharmacyDispensing } from '../pages/pharmacy/Dispensing';
import { PharmacyInventory } from '../pages/pharmacy/Inventory';
import { PharmacyMessages } from '../pages/pharmacy/Messages';
import { PharmacyProfile } from '../pages/pharmacy/Profile';
import { PharmacyReports } from '../pages/pharmacy/Reports';
import { PharmacyRevenue } from '../pages/pharmacy/Revenue';
import { PharmacySettings } from '../pages/pharmacy/Settings';
import { InsurancePortal } from '../pages/insurance/Portal';
import { AppointmentDesignShowcase } from '../pages/AppointmentDesignShowcase';
import { AccessDenied } from '../pages/system/AccessDenied';

const withLayout = (page: ReactNode) => <Layout>{page}</Layout>;

const withPortalProtection = (
  page: ReactNode,
  role: 'patient' | 'doctor',
  options: { contentBleed?: boolean; contentClassName?: string } = {}
) => (
  <ProtectedRoute allowedRoles={[role]}>
    {withLayout(
      <PortalShell
        role={role}
        contentBleed={options.contentBleed}
        contentClassName={options.contentClassName}
      >
        {page}
      </PortalShell>
    )}
  </ProtectedRoute>
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
    path: '/auth/portal-access',
    element: <PortalAccess />,
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
    element: withPortalProtection(<PatientDashboard />, 'patient'),
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
    element: withPortalProtection(<PatientAppointments />, 'patient'),
  },
  {
    path: '/patient/appointments/book',
    element: withPortalProtection(<BookAppointment />, 'patient'),
  },
  {
    path: '/patient/prescriptions',
    element: withPortalProtection(<PatientPrescriptions />, 'patient', {
      contentClassName: 'w-full min-w-0 space-y-6 p-6 sm:p-8',
    }),
  },
  {
    path: '/pharmacy',
    element: withLayout(<Pharmacy />),
  },
  {
    path: '/patient/records',
    element: withPortalProtection(<PatientRecords />, 'patient'),
  },
  {
    path: '/patient/ai-chat',
    element: withPortalProtection(<PatientAIChat />, 'patient', { contentBleed: true }),
  },
  {
    path: '/patient/pre-visit/:assessmentId',
    element: withPortalProtection(<PatientPreVisitAssessment />, 'patient'),
  },
  {
    path: '/patient/messages',
    element: withPortalProtection(<PatientMessages />, 'patient'),
  },
  {
    path: '/patient/messages/:conversationId',
    element: withPortalProtection(<PatientMessages />, 'patient'),
  },
  {
    path: '/patient/profile',
    element: withPortalProtection(<PatientProfile />, 'patient'),
  },
  {
    path: '/patient/lab-results',
    element: withPortalProtection(<PatientLabResults />, 'patient'),
  },
  {
    path: '/patient/notifications',
    element: withPortalProtection(<PatientNotifications />, 'patient'),
  },
  {
    path: '/patient/telemedicine/:appointmentId',
    element: withPortalProtection(<PatientTelemedicineConsultation />, 'patient'),
  },
  {
    path: '/patient/settings',
    element: withPortalProtection(<PatientSettings />, 'patient'),
  },
  {
    path: '/patient/imaging',
    element: withPortalProtection(<PatientImaging />, 'patient'),
  },
  {
    path: '/patient/insurance',
    element: withPortalProtection(<PatientInsurance />, 'patient'),
  },
  {
    path: '/patient/documents',
    element: withPortalProtection(<PatientDocuments />, 'patient'),
  },
  {
    path: '/doctor/dashboard',
    element: withPortalProtection(<DoctorDashboard />, 'doctor'),
  },
  {
    path: '/doctor/today',
    element: withPortalProtection(<DoctorAppointments />, 'doctor'),
  },
  {
    path: '/doctor/appointments',
    element: withPortalProtection(<DoctorAppointments />, 'doctor'),
  },
  {
    path: '/doctor/appointments/:appointmentId',
    element: withPortalProtection(<DoctorAppointmentDetail />, 'doctor'),
  },
  {
    path: '/doctor/patients',
    element: withPortalProtection(<DoctorPatients />, 'doctor'),
  },
  {
    path: '/doctor/patients/:patientId',
    element: withPortalProtection(<DoctorPatientDetail />, 'doctor'),
  },
  {
    path: '/doctor/schedule',
    element: withPortalProtection(<DoctorSchedule />, 'doctor'),
  },
  {
    path: '/doctor/prescribe',
    element: withPortalProtection(<CreatePrescription />, 'doctor'),
  },
  {
    path: '/doctor/prescriptions',
    element: withPortalProtection(<DoctorPrescriptions />, 'doctor'),
  },
  {
    path: '/doctor/prescriptions/new',
    element: withPortalProtection(<CreatePrescription />, 'doctor'),
  },
  {
    path: '/doctor/labs',
    element: withPortalProtection(<DoctorLabOrders />, 'doctor'),
  },
  {
    path: '/doctor/lab-orders',
    element: withPortalProtection(<DoctorLabOrders />, 'doctor'),
  },
  {
    path: '/doctor/lab-orders/new',
    element: withPortalProtection(<CreateLabOrder />, 'doctor'),
  },
  {
    path: '/doctor/messages',
    element: withPortalProtection(<DoctorMessages />, 'doctor'),
  },
  {
    path: '/doctor/messages/:conversationId',
    element: withPortalProtection(<DoctorMessages />, 'doctor'),
  },
  {
    path: '/doctor/profile',
    element: withPortalProtection(<DoctorProfile />, 'doctor'),
  },
  {
    path: '/doctor/notifications',
    element: withPortalProtection(<DoctorNotifications />, 'doctor'),
  },
  {
    path: '/doctor/consultations/:appointmentId',
    element: withPortalProtection(<DoctorConsultationWorkspace />, 'doctor'),
  },
  {
    path: '/doctor/settings',
    element: withPortalProtection(<DoctorSettings />, 'doctor'),
  },
  {
    path: '/doctor/imaging',
    element: withPortalProtection(<DoctorImaging />, 'doctor'),
  },
  {
    path: '/doctor/earnings',
    element: withPortalProtection(<DoctorEarnings />, 'doctor'),
  },
  {
    path: '/doctor/portal',
    element: withPortalProtection(<DoctorPortal />, 'doctor'),
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminDashboard />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/compliance',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminCompliance />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/system-health',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminSystemHealth />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/organizations',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminOrganizations />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminUsers />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/diagnostics',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminDiagnostics />)}</ProtectedRoute>
    ),
  },
  {
    path: '/admin/ai-analytics',
    element: (
      <ProtectedRoute allowedRoles={['super_admin']}>{withLayout(<AdminAiAnalytics />)}</ProtectedRoute>
    ),
  },
  {
    path: '/lab/dashboard',
    element: <ProtectedRoute allowedRoles={['lab']}>{withLayout(<LabDashboard />)}</ProtectedRoute>,
  },
  {
    path: '/lab/referrals',
    element: <ProtectedRoute allowedRoles={['lab']}>{withLayout(<LabReferrals />)}</ProtectedRoute>,
  },
  {
    path: '/lab/results/entry',
    element: <ProtectedRoute allowedRoles={['lab']}>{withLayout(<LabResultEntry />)}</ProtectedRoute>,
  },
  {
    path: '/lab/radiology',
    element: <ProtectedRoute allowedRoles={['lab']}>{withLayout(<LabRadiology />)}</ProtectedRoute>,
  },
  {
    path: '/pharmacy/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyDashboard />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/dispensing',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyDispensing />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/inventory',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyInventory />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/messages',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyMessages />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/reports',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyReports />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/revenue',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyRevenue />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/profile',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacyProfile />)}</ProtectedRoute>
    ),
  },
  {
    path: '/pharmacy/settings',
    element: (
      <ProtectedRoute allowedRoles={['pharmacy']}>{withLayout(<PharmacySettings />)}</ProtectedRoute>
    ),
  },
  {
    path: '/insurance/portal',
    element: withLayout(<InsurancePortal />),
  },
]);
