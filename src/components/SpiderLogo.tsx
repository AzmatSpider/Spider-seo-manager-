interface SpiderLogoProps {
  size?: number;
  className?: string;
}

export function SpiderLogo({ size = 44, className = '' }: SpiderLogoProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-[#080808] border border-[#FFD700]/30 shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.72)}
        height={Math.round(size * 0.72)}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Geometric cephalothorax */}
        <polygon points="32,16 39,22 37,31 27,31 25,22" fill="#FFD700" />
        {/* Geometric abdomen */}
        <polygon points="32,33 41,41 37,54 32,58 27,54 23,41" fill="#FFD700" />
        {/* Mandibles */}
        <path
          d="M28 16L25 11L29 14M36 16L39 11L35 14"
          stroke="#FFD700"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Left legs */}
        <path
          d="M25 22L14 14L10 6"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 26L11 22L6 13"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25 30L11 33L7 44"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26 35L15 44L14 57"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right legs */}
        <path
          d="M39 22L50 14L54 6"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M40 26L53 22L58 13"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M39 30L53 33L57 44"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M38 35L49 44L50 57"
          stroke="#FFD700"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Core highlight lines */}
        <path
          d="M32 37L36 43L32 52L28 43L32 37Z"
          fill="#080808"
        />
      </svg>
    </div>
  );
}
