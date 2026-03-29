export type MedicationNameDisplayProps = {
  canonicalName: string;
  localizedName?: string | null;
  /** i18n language (e.g. i18n.language) */
  language: string;
  /** Default: stacked local (primary) + canonical (secondary, LTR) */
  variant?: 'stacked' | 'compact';
  primaryClassName?: string;
  secondaryClassName?: string;
};

/**
 * When UI is non-English and `localizedName` is set, shows both: localized primary,
 * canonical (usually Latin INN) secondary for pharmacy alignment.
 */
export function MedicationNameDisplay({
  canonicalName,
  localizedName,
  language,
  variant = 'stacked',
  primaryClassName,
  secondaryClassName,
}: MedicationNameDisplayProps) {
  const loc = localizedName?.trim() ?? '';
  const canonical = canonicalName.trim();
  const useBoth =
    !language.startsWith('en') && loc.length > 0 && loc.toLowerCase() !== canonical.toLowerCase();

  const primaryDefault = 'font-bold text-gray-900';
  const secondaryDefault = 'text-sm font-normal text-gray-500 mt-0.5';

  if (!useBoth) {
    return (
      <span className={primaryClassName ?? primaryDefault} dir="auto">
        {canonical || canonicalName}
      </span>
    );
  }

  if (variant === 'compact') {
    return (
      <span className={primaryClassName ?? 'text-gray-700'} dir="auto">
        <span dir="auto">{loc}</span>
        <span className="text-gray-400 mx-1" aria-hidden>
          ·
        </span>
        <span dir="ltr">{canonical}</span>
      </span>
    );
  }

  return (
    <span className="inline-block text-start">
      <span className={`block ${primaryClassName ?? primaryDefault}`} dir="auto">
        {loc}
      </span>
      <span
        className={`block ${secondaryClassName ?? secondaryDefault}`}
        dir="ltr"
        translate="no"
      >
        {canonical}
      </span>
    </span>
  );
}
