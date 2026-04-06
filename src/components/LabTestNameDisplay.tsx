export type LabTestNameDisplayProps = {
  canonicalName: string;
  localizedName?: string | null;
  language: string;
  variant?: 'stacked' | 'compact';
  primaryClassName?: string;
  secondaryClassName?: string;
};

export function LabTestNameDisplay({
  canonicalName,
  localizedName,
  language,
  variant = 'stacked',
  primaryClassName,
  secondaryClassName,
}: LabTestNameDisplayProps) {
  const loc = localizedName?.trim() ?? '';
  const canonical = canonicalName.trim();
  const useBoth =
    !language.startsWith('en') && loc.length > 0 && loc.toLowerCase() !== canonical.toLowerCase();

  const primaryDefault = 'font-bold text-gray-900';
  const secondaryDefault = 'mt-0.5 text-sm font-normal text-gray-500';

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
        <span className="mx-1 text-gray-400" aria-hidden>
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
