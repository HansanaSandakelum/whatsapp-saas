export function CountryFlag({ flag, className = "" }: { flag: string; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm ${className}`}>
      {flag}
    </span>
  );
}
