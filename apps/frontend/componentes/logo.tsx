export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-bold tracking-wide ${className}`}>
      SI<span className="text-acento">MEP</span>
    </span>
  );
}
