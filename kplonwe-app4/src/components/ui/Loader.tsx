import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ size = 'md', text, fullScreen = false }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const loader = (
    <div className="flex flex-col items-center justify-center gap-3" role="status">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} aria-hidden="true" />
      {text && <p className="text-gray-600">{text}</p>}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        {loader}
      </div>
    );
  }

  return loader;
}
