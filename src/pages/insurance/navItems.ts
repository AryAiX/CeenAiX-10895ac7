import { LayoutDashboard } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { OpsShellNavItem } from '../../components/OpsShell';

export const INSURANCE_NAV_ITEMS = (t: TFunction): OpsShellNavItem[] => [
  { href: '/insurance/portal', label: t('insurance.portal.title'), icon: LayoutDashboard },
];
