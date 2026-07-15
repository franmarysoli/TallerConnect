export function Logo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      width={size} 
      height={size}
      fill="none" 
      stroke="#ef4444" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="6" cy="6" r="3"/>
      <path d="M8.12 8.12 12 12"/>
      <path d="M20 4 8.12 15.88"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M14.8 14.8 20 20"/>
    </svg>
  );
}
