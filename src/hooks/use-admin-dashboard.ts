import { supabase } from '../lib/supabase';
import { useQuery } from './use-query';
import type {
  AdminAiAnalyticsPayload,
  AdminAuditEventRow,
  AdminIncident,
  AdminMetricsPayload,
  AdminSystemHealthPayload,
  AdminUserRow,
  FeatureFlag,
  Organization,
  PlatformSetting,
} from '../types';

/**
 * Admin platform metrics — aggregate counts powering /admin/dashboard.
 */
export function useAdminMetrics() {
  return useQuery<AdminMetricsPayload | null>(async () => {
    const { data, error } = await supabase.rpc('admin_get_metrics');
    if (error) {
      throw error;
    }
    return (data as AdminMetricsPayload | null) ?? null;
  }, []);
}

export interface UseAdminUsersArgs {
  search?: string;
  role?: string | null;
  limit?: number;
}

/**
 * Global users directory for /admin/users.
 */
export function useAdminUsers({ search = '', role = null, limit = 50 }: UseAdminUsersArgs = {}) {
  return useQuery<AdminUserRow[]>(async () => {
    const { data, error } = await supabase.rpc('admin_list_users', {
      search_text: search || null,
      filter_role: role,
      max_rows: limit,
    });
    if (error) {
      throw error;
    }
    return (data as AdminUserRow[]) ?? [];
  }, [search, role ?? '', limit]);
}

/**
 * Organizations registered on the platform (hospitals, clinics, labs, pharmacies).
 */
export function useAdminOrganizations() {
  return useQuery<Organization[]>(async () => {
    const { data, error } = await supabase.rpc('admin_list_organizations');
    if (error) {
      throw error;
    }
    return (data as Organization[]) ?? [];
  }, []);
}

export interface AdminComplianceData {
  incidents: AdminIncident[];
  recentAuditEvents: AdminAuditEventRow[];
  auditEventCount30d: number;
  openIncidentCount: number;
}

/**
 * Incidents register + recent audit events for /admin/compliance.
 */
export function useAdminCompliance() {
  return useQuery<AdminComplianceData>(async () => {
    const [
      { data: incidents, error: incidentsError },
      { data: auditEvents, error: auditError },
      { data: metricsPayload, error: metricsError },
    ] = await Promise.all([
      supabase.rpc('admin_list_incidents'),
      supabase.rpc('admin_list_audit_events', { max_rows: 25 }),
      supabase.rpc('admin_get_metrics'),
    ]);
    if (incidentsError) throw incidentsError;
    if (auditError) throw auditError;
    if (metricsError) throw metricsError;

    const metrics = (metricsPayload as AdminMetricsPayload | null) ?? null;
    const openIncidentCount = (incidents as AdminIncident[] | null)?.filter(
      (incident) => incident.status === 'open' || incident.status === 'investigating'
    ).length ?? 0;

    return {
      incidents: (incidents as AdminIncident[]) ?? [],
      recentAuditEvents: (auditEvents as AdminAuditEventRow[]) ?? [],
      auditEventCount30d: metrics?.compliance.auditEvents30d ?? 0,
      openIncidentCount,
    };
  }, []);
}

/**
 * Latest per-service health snapshot, grouped by category.
 */
export function useAdminSystemHealth() {
  return useQuery<AdminSystemHealthPayload | null>(async () => {
    const { data, error } = await supabase.rpc('admin_get_system_health');
    if (error) {
      throw error;
    }
    return (data as AdminSystemHealthPayload | null) ?? null;
  }, []);
}

/**
 * AI usage / safety analytics for /admin/ai-analytics.
 */
export function useAdminAiAnalytics() {
  return useQuery<AdminAiAnalyticsPayload | null>(async () => {
    const { data, error } = await supabase.rpc('admin_get_ai_analytics');
    if (error) {
      throw error;
    }
    return (data as AdminAiAnalyticsPayload | null) ?? null;
  }, []);
}

export interface AdminDiagnosticsData {
  featureFlags: FeatureFlag[];
  platformSettings: PlatformSetting[];
  metrics: AdminMetricsPayload | null;
}

/**
 * Feature flags + platform settings + system metrics for /admin/diagnostics.
 */
export function useAdminDiagnostics() {
  return useQuery<AdminDiagnosticsData>(async () => {
    const [
      { data: flags, error: flagsError },
      { data: settings, error: settingsError },
      { data: metrics, error: metricsError },
    ] = await Promise.all([
      supabase.rpc('admin_list_feature_flags'),
      supabase.from('platform_settings').select('id, key, value, updated_by, updated_at').order('key'),
      supabase.rpc('admin_get_metrics'),
    ]);
    if (flagsError) throw flagsError;
    if (settingsError) throw settingsError;
    if (metricsError) throw metricsError;

    return {
      featureFlags: (flags as FeatureFlag[]) ?? [],
      platformSettings: (settings as PlatformSetting[]) ?? [],
      metrics: (metrics as AdminMetricsPayload | null) ?? null,
    };
  }, []);
}
