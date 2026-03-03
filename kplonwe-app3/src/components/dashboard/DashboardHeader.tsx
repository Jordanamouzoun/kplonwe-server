interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{title}</h1>
      {subtitle && <p className="text-sm sm:text-base text-gray-600 mt-2">{subtitle}</p>}
    </div>
  );
}
