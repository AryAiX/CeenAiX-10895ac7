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

export interface PharmacyQueueItem {
  id: string;
  patientName: string;
  medication: string;
  prescriber: string;
  priority: 'stat' | 'routine' | 'scheduled';
}

export interface PharmacyStockAlert {
  id: string;
  item: string;
  quantity: number;
  severity: 'critical' | 'low' | 'reorder';
}

export interface PharmacyDashboardStub {
  pendingPrescriptions: number;
  dispensedToday: number;
  lowStockAlerts: number;
  claimsInReview: number;
  queue: PharmacyQueueItem[];
  stockAlerts: PharmacyStockAlert[];
}

export interface PharmacyDispensingItem {
  id: string;
  prescriptionId: string;
  patientName: string;
  medication: string;
  status: 'verifying' | 'ready' | 'counseling';
  dispensedBy: string | null;
  waitMinutes: number;
}

export interface PharmacyDispensingStub {
  inVerification: number;
  readyForCounseling: number;
  handoverToday: number;
  items: PharmacyDispensingItem[];
}

export interface PharmacyInventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  expiryMonth: string | null;
  status: 'healthy' | 'low' | 'near_expiry' | 'out';
}

export interface PharmacyInventoryStub {
  items: PharmacyInventoryItem[];
  nearExpiry: number;
  outOfStock: number;
  totalSkus: number;
}

export interface InsurancePlanSummary {
  id: string;
  name: string;
  members: number;
  utilization: number;
  claimsOpen: number;
  status: 'active' | 'draft' | 'closed';
}

export interface InsuranceClaimSummary {
  id: string;
  patientName: string;
  plan: string;
  amountAed: number;
  status: 'submitted' | 'under_review' | 'approved' | 'denied';
}

export interface InsurancePortalStub {
  plans: InsurancePlanSummary[];
  claims: InsuranceClaimSummary[];
  totalMembers: number;
  pendingClaims: number;
  approvedThisMonth: number;
  escalations: number;
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

const PHARMACY_DASHBOARD_SAMPLE: PharmacyDashboardStub = {
  pendingPrescriptions: 14,
  dispensedToday: 42,
  lowStockAlerts: 3,
  claimsInReview: 7,
  queue: [
    {
      id: 'rx-1042',
      patientName: 'Mariam Al Mansoori',
      medication: 'Metformin 500 mg × 60',
      prescriber: 'Dr. Ahmed Al Maktoum',
      priority: 'routine',
    },
    {
      id: 'rx-1043',
      patientName: 'Noura Khalifa',
      medication: 'Amoxicillin 875 mg × 21',
      prescriber: 'Dr. Sara Al Shamsi',
      priority: 'stat',
    },
    {
      id: 'rx-1044',
      patientName: 'Hassan Al Zaabi',
      medication: 'Atorvastatin 20 mg × 30',
      prescriber: 'Dr. Rashid Al Nuaimi',
      priority: 'scheduled',
    },
    {
      id: 'rx-1045',
      patientName: 'Layla Hussein',
      medication: 'Salbutamol inhaler × 1',
      prescriber: 'Dr. Fatima Al Suwaidi',
      priority: 'routine',
    },
  ],
  stockAlerts: [
    { id: 'stk-01', item: 'Insulin glargine 100 IU/mL', quantity: 4, severity: 'critical' },
    { id: 'stk-02', item: 'Omeprazole 20 mg', quantity: 28, severity: 'low' },
    { id: 'stk-03', item: 'Paracetamol 500 mg', quantity: 110, severity: 'reorder' },
  ],
};

const PHARMACY_DISPENSING_SAMPLE: PharmacyDispensingStub = {
  inVerification: 6,
  readyForCounseling: 4,
  handoverToday: 32,
  items: [
    {
      id: 'disp-01',
      prescriptionId: 'rx-1042',
      patientName: 'Mariam Al Mansoori',
      medication: 'Metformin 500 mg × 60',
      status: 'verifying',
      dispensedBy: null,
      waitMinutes: 8,
    },
    {
      id: 'disp-02',
      prescriptionId: 'rx-1043',
      patientName: 'Noura Khalifa',
      medication: 'Amoxicillin 875 mg × 21',
      status: 'counseling',
      dispensedBy: 'Pharmacist Aisha',
      waitMinutes: 2,
    },
    {
      id: 'disp-03',
      prescriptionId: 'rx-1044',
      patientName: 'Hassan Al Zaabi',
      medication: 'Atorvastatin 20 mg × 30',
      status: 'ready',
      dispensedBy: 'Pharmacist Khaled',
      waitMinutes: 0,
    },
  ],
};

const PHARMACY_INVENTORY_SAMPLE: PharmacyInventoryStub = {
  totalSkus: 847,
  nearExpiry: 12,
  outOfStock: 2,
  items: [
    {
      id: 'sku-101',
      name: 'Insulin glargine 100 IU/mL',
      sku: 'INS-100-LAN',
      stock: 4,
      reorderPoint: 10,
      expiryMonth: '2026-08',
      status: 'low',
    },
    {
      id: 'sku-102',
      name: 'Omeprazole 20 mg',
      sku: 'OME-020-30C',
      stock: 28,
      reorderPoint: 40,
      expiryMonth: '2027-03',
      status: 'low',
    },
    {
      id: 'sku-103',
      name: 'Paracetamol 500 mg',
      sku: 'PAR-500-20T',
      stock: 0,
      reorderPoint: 50,
      expiryMonth: '2026-11',
      status: 'out',
    },
    {
      id: 'sku-104',
      name: 'Salbutamol 100 mcg inhaler',
      sku: 'SAL-100-INH',
      stock: 36,
      reorderPoint: 25,
      expiryMonth: '2026-06',
      status: 'near_expiry',
    },
  ],
};

const INSURANCE_PORTAL_SAMPLE: InsurancePortalStub = {
  totalMembers: 42_310,
  pendingClaims: 128,
  approvedThisMonth: 1_842,
  escalations: 9,
  plans: [
    {
      id: 'plan-basic',
      name: 'Basic Shield',
      members: 12_040,
      utilization: 68,
      claimsOpen: 32,
      status: 'active',
    },
    {
      id: 'plan-silver',
      name: 'Silver Plus',
      members: 18_920,
      utilization: 74,
      claimsOpen: 41,
      status: 'active',
    },
    {
      id: 'plan-gold',
      name: 'Gold Complete',
      members: 8_400,
      utilization: 81,
      claimsOpen: 38,
      status: 'active',
    },
    {
      id: 'plan-family',
      name: 'Family Care Pro',
      members: 2_950,
      utilization: 62,
      claimsOpen: 17,
      status: 'draft',
    },
  ],
  claims: [
    {
      id: 'clm-9001',
      patientName: 'Mariam Al Mansoori',
      plan: 'Silver Plus',
      amountAed: 2_450,
      status: 'under_review',
    },
    {
      id: 'clm-9002',
      patientName: 'Hassan Al Zaabi',
      plan: 'Gold Complete',
      amountAed: 15_900,
      status: 'approved',
    },
    {
      id: 'clm-9003',
      patientName: 'Noura Khalifa',
      plan: 'Basic Shield',
      amountAed: 620,
      status: 'submitted',
    },
    {
      id: 'clm-9004',
      patientName: 'Omar Al Balushi',
      plan: 'Family Care Pro',
      amountAed: 3_280,
      status: 'denied',
    },
  ],
};

export const usePharmacyDashboardStub = () =>
  useQuery<PharmacyDashboardStub>(emptyAsync<PharmacyDashboardStub>(PHARMACY_DASHBOARD_SAMPLE), []);

export const usePharmacyDispensingStub = () =>
  useQuery<PharmacyDispensingStub>(emptyAsync<PharmacyDispensingStub>(PHARMACY_DISPENSING_SAMPLE), []);

export const usePharmacyInventoryStub = () =>
  useQuery<PharmacyInventoryStub>(emptyAsync<PharmacyInventoryStub>(PHARMACY_INVENTORY_SAMPLE), []);

export const useInsurancePortalStub = () =>
  useQuery<InsurancePortalStub>(emptyAsync<InsurancePortalStub>(INSURANCE_PORTAL_SAMPLE), []);
