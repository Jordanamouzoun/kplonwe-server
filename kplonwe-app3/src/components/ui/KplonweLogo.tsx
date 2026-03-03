interface KplonweLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'text-base sm:text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-2xl sm:text-3xl',
  xl: 'text-3xl sm:text-4xl lg:text-5xl',
};

export function KplonweLogo({ className = '', size = 'md' }: KplonweLogoProps) {
  return (
    <span className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="text-primary-600">KPL</span>
      <span className="text-[#FDB32A]">O</span>
      <span className="text-primary-600">NWE</span>
    </span>
  );
}
