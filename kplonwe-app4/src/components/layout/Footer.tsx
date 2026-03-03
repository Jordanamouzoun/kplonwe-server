export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/logo-kplonwe.png" 
            alt="KPLONWE" 
            className="h-12 w-auto object-contain"
          />
          <p className="text-sm text-gray-600">&copy; {currentYear} Plateforme éducative accessible.</p>
        </div>
      </div>
    </footer>
  );
}
