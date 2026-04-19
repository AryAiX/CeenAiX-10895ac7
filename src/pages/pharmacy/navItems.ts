import { ClipboardList, Package, Pill } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { OpsShellNavItem } from '../../components/OpsShell';

export const PHARMACY_NAV_ITEMS = (t: TFunction): OpsShellNavItem[] => [
  { href: '/pharmacy/dashboard', label: t('pharmacy.dashboard.title'), icon: Pill },
  { href: '/pharmacy/dispensing', label: t('pharmacy.dispensing.title'), icon: ClipboardList },
  { href: '/pharmacy/inventory', label: t('pharmacy.inventory.title'), icon: Package },
];
