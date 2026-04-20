import { FlaskConical, ListChecks, Radio, Users } from 'lucide-react';
import type { TFunction } from 'i18next';
import type { OpsShellNavItem } from '../../components/OpsShell';

export const LAB_NAV_ITEMS = (t: TFunction): OpsShellNavItem[] => [
  { href: '/lab/dashboard', label: t('lab.dashboard.title'), icon: FlaskConical },
  { href: '/lab/referrals', label: t('lab.referrals.title'), icon: Users },
  { href: '/lab/results/entry', label: t('lab.resultEntry.title'), icon: ListChecks },
  { href: '/lab/radiology', label: t('lab.radiology.title'), icon: Radio },
];
