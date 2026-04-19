import { useQuery } from './use-query';

export interface DoctorConsultationStub {
  appointmentId: string | null;
  patientName: string | null;
  subjective: string | null;
  objective: string | null;
  assessment: string | null;
  plan: string | null;
  aiSuggestions: string[];
}

export interface DoctorEarningsStub {
  totalsByMonth: Array<{ month: string; amount: number }>;
  pendingClaims: number;
  paidClaims: number;
  payoutsCurrency: string;
}

export interface DoctorPortalStub {
  clinics: Array<{ id: string; name: string }>;
  activeClinicId: string | null;
}

export interface SettingsStub {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  privacy: {
    shareWithDoctors: boolean;
    shareWithPharmacy: boolean;
    shareWithInsurance: boolean;
  };
}

export interface ImagingStudyStub {
  id: string;
  modality: string;
  bodyPart: string;
  capturedAt: string;
  hasAiReading: boolean;
}

export interface PatientInsuranceStub {
  plans: Array<{ id: string; name: string; coverageStatus: 'active' | 'lapsed' | 'pending' }>;
  claims: Array<{ id: string; status: string; amount: number }>;
}

export interface AdminMetricsStub {
  platformHealth: {
    uptimePercent: number;
    activeIncidents: number;
  };
  pendingApprovals: number;
  aiUsage30d: number;
}

export interface AdminComplianceStub {
  auditEvents: number;
  openIncidents: number;
  nextReportDue: string | null;
}

export interface AdminSystemHealthStub {
  services: Array<{ id: string; name: string; status: 'healthy' | 'degraded' | 'down' }>;
  integrations: Array<{ id: string; name: string; status: 'healthy' | 'degraded' | 'down' }>;
}

export interface AdminOrganizationsStub {
  tenants: Array<{ id: string; name: string; seats: number }>;
}

export interface AdminUsersStub {
  total: number;
  byRole: Record<string, number>;
}

export interface AdminDiagnosticsStub {
  queues: Array<{ id: string; name: string; depth: number }>;
  featureFlags: Array<{ id: string; name: string; enabled: boolean }>;
}

export interface AdminAiAnalyticsStub {
  sessions30d: number;
  flaggedOutputs30d: number;
  savedActions30d: number;
}

export interface LabDashboardStub {
  pendingOrders: number;
  inProgressOrders: number;
  completedToday: number;
}

export interface LabReferralsStub {
  incomingByPriority: Array<{ priority: 'stat' | 'routine' | 'scheduled'; count: number }>;
}

export interface LabResultEntryStub {
  drafts: Array<{ id: string; labOrderId: string; status: 'draft' | 'ready_to_sign' }>;
}

export interface LabRadiologyStub {
  worklist: Array<{ id: string; patientName: string; modality: string }>;
}

export interface PharmacyDashboardStub {
  dispensingQueue: number;
  nearExpiryItems: number;
  openClaims: number;
}

export interface PharmacyDispensingStub {
  drafts: Array<{ id: string; prescriptionId: string; status: 'verifying' | 'ready' }>;
}

export interface PharmacyInventoryStub {
  items: Array<{ id: string; name: string; stock: number }>;
}

export interface InsurancePortalStub {
  plans: Array<{ id: string; name: string; members: number }>;
  pendingClaims: number;
}

function emptyAsync<T>(value: T) {
  return () => Promise.resolve(value);
}

export const useDoctorConsultationStub = (appointmentId: string | null | undefined) =>
  useQuery<DoctorConsultationStub>(
    emptyAsync<DoctorConsultationStub>({
      appointmentId: appointmentId ?? null,
      patientName: null,
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      aiSuggestions: [],
    }),
    [appointmentId ?? '']
  );

export const useDoctorEarningsStub = () =>
  useQuery<DoctorEarningsStub>(
    emptyAsync<DoctorEarningsStub>({
      totalsByMonth: [],
      pendingClaims: 0,
      paidClaims: 0,
      payoutsCurrency: 'AED',
    }),
    []
  );

export const useDoctorPortalStub = () =>
  useQuery<DoctorPortalStub>(
    emptyAsync<DoctorPortalStub>({
      clinics: [],
      activeClinicId: null,
    }),
    []
  );

export const useSettingsStub = (userId: string | null | undefined) =>
  useQuery<SettingsStub>(
    emptyAsync<SettingsStub>({
      notifications: { email: false, sms: false, push: false },
      language: 'en',
      privacy: { shareWithDoctors: true, shareWithPharmacy: false, shareWithInsurance: false },
    }),
    [userId ?? '']
  );

export const useImagingStudiesStub = (userId: string | null | undefined) =>
  useQuery<ImagingStudyStub[]>(emptyAsync<ImagingStudyStub[]>([]), [userId ?? '']);

export const usePatientInsuranceStub = (userId: string | null | undefined) =>
  useQuery<PatientInsuranceStub>(
    emptyAsync<PatientInsuranceStub>({ plans: [], claims: [] }),
    [userId ?? '']
  );

export const useAdminMetricsStub = () =>
  useQuery<AdminMetricsStub>(
    emptyAsync<AdminMetricsStub>({
      platformHealth: { uptimePercent: 100, activeIncidents: 0 },
      pendingApprovals: 0,
      aiUsage30d: 0,
    }),
    []
  );

export const useAdminComplianceStub = () =>
  useQuery<AdminComplianceStub>(
    emptyAsync<AdminComplianceStub>({
      auditEvents: 0,
      openIncidents: 0,
      nextReportDue: null,
    }),
    []
  );

export const useAdminSystemHealthStub = () =>
  useQuery<AdminSystemHealthStub>(
    emptyAsync<AdminSystemHealthStub>({ services: [], integrations: [] }),
    []
  );

export const useAdminOrganizationsStub = () =>
  useQuery<AdminOrganizationsStub>(emptyAsync<AdminOrganizationsStub>({ tenants: [] }), []);

export const useAdminUsersStub = () =>
  useQuery<AdminUsersStub>(emptyAsync<AdminUsersStub>({ total: 0, byRole: {} }), []);

export const useAdminDiagnosticsStub = () =>
  useQuery<AdminDiagnosticsStub>(
    emptyAsync<AdminDiagnosticsStub>({ queues: [], featureFlags: [] }),
    []
  );

export const useAdminAiAnalyticsStub = () =>
  useQuery<AdminAiAnalyticsStub>(
    emptyAsync<AdminAiAnalyticsStub>({
      sessions30d: 0,
      flaggedOutputs30d: 0,
      savedActions30d: 0,
    }),
    []
  );

export const useLabDashboardStub = () =>
  useQuery<LabDashboardStub>(
    emptyAsync<LabDashboardStub>({ pendingOrders: 0, inProgressOrders: 0, completedToday: 0 }),
    []
  );

export const useLabReferralsStub = () =>
  useQuery<LabReferralsStub>(emptyAsync<LabReferralsStub>({ incomingByPriority: [] }), []);

export const useLabResultEntryStub = () =>
  useQuery<LabResultEntryStub>(emptyAsync<LabResultEntryStub>({ drafts: [] }), []);

export const useLabRadiologyStub = () =>
  useQuery<LabRadiologyStub>(emptyAsync<LabRadiologyStub>({ worklist: [] }), []);

export const usePharmacyDashboardStub = () =>
  useQuery<PharmacyDashboardStub>(
    emptyAsync<PharmacyDashboardStub>({ dispensingQueue: 0, nearExpiryItems: 0, openClaims: 0 }),
    []
  );

export const usePharmacyDispensingStub = () =>
  useQuery<PharmacyDispensingStub>(emptyAsync<PharmacyDispensingStub>({ drafts: [] }), []);

export const usePharmacyInventoryStub = () =>
  useQuery<PharmacyInventoryStub>(emptyAsync<PharmacyInventoryStub>({ items: [] }), []);

export const useInsurancePortalStub = () =>
  useQuery<InsurancePortalStub>(
    emptyAsync<InsurancePortalStub>({ plans: [], pendingClaims: 0 }),
    []
  );
