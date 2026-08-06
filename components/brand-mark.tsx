export type BrandVariant = 'main' | 'journal';

export function BrandMark({
  variant = 'main',
  className = '',
}: {
  variant?: BrandVariant;
  className?: string;
}) {
  const label = variant === 'journal' ? '时工工程杂志' : '时工的半导体实验室';

  return (
    <span className={`brand-mark brand-mark-${variant} ${className}`.trim()} aria-hidden="true">
      <img
        src={`/brand/shi-lab-${variant === 'journal' ? 'journal' : 'main'}-96.webp`}
        srcSet={`/brand/shi-lab-${variant === 'journal' ? 'journal' : 'main'}-96.webp 96w, /brand/shi-lab-${variant === 'journal' ? 'journal' : 'main'}-512.webp 512w`}
        sizes="96px"
        width="96"
        height="96"
        alt=""
        title={label}
      />
    </span>
  );
}
