export function Logo({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      width={size} 
      height={size}
      className={className}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#BE185D" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      {/* Background */}
      <circle cx="50" cy="50" r="45" fill="#FDF2F8" />
      {/* Needle */}
      <path d="M 45 20 L 55 20 L 50 85 Z" fill="#0F172A" />
      {/* Needle Eye */}
      <ellipse cx="50" cy="25" rx="1.5" ry="4" fill="#FDF2F8" />
      {/* Thread forming a C */}
      <path 
        d="M 50 25 C 20 20, 20 80, 50 75 C 80 70, 70 40, 50 40" 
        fill="none" 
        stroke="url(#grad1)" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
    </svg>
  );
}
