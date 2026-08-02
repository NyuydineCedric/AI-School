import React from "react";

// Hand-built vector illustration for the auth screens (login/register side
// panel). Replaces the old placeholder oval + rectangle divs with an actual
// AI-tutor-in-a-classroom scene, in the app's indigo/emerald palette.
const AuthIllustration: React.FC = () => (
  <svg
    viewBox="0 0 420 520"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full max-w-sm"
  >
    <defs>
      <linearGradient id="auth-bot-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <radialGradient id="auth-glow" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* soft glow + dot grid backdrop */}
    <circle cx="210" cy="190" r="200" fill="url(#auth-glow)" />
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 8 }).map((_, col) => (
        <circle
          key={`${row}-${col}`}
          cx={40 + col * 48}
          cy={40 + row * 46}
          r="1.6"
          fill="#c7d2fe"
        />
      )),
    )}

    {/* floating card: quiz score */}
    <g transform="translate(24,300)">
      <rect width="118" height="66" rx="14" fill="white" stroke="#e2e8f0" />
      <circle cx="26" cy="33" r="14" fill="#ecfdf5" />
      <path
        d="M20 33l4 4 8-9"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="50" y="22" width="52" height="8" rx="4" fill="#e2e8f0" />
      <rect x="50" y="36" width="36" height="7" rx="3.5" fill="#c7d2fe" />
    </g>

    {/* floating card: notification */}
    <g transform="translate(272,90)">
      <rect width="124" height="58" rx="14" fill="white" stroke="#e2e8f0" />
      <circle cx="24" cy="29" r="12" fill="#eef2ff" />
      <path d="M24 22v14M24 22l6 4" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="46" y="18" width="60" height="7" rx="3.5" fill="#e2e8f0" />
      <rect x="46" y="31" width="42" height="6" rx="3" fill="#e2e8f0" />
    </g>

    {/* central podium / stage */}
    <ellipse cx="210" cy="430" rx="130" ry="18" fill="#eef2ff" />

    {/* AI tutor bot */}
    <g transform="translate(130,140)">
      {/* antenna */}
      <line x1="80" y1="0" x2="80" y2="18" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="-4" r="7" fill="#a5b4fc" />

      {/* head */}
      <rect x="30" y="18" width="100" height="88" rx="28" fill="url(#auth-bot-grad)" />
      <rect x="52" y="50" width="20" height="20" rx="6" fill="#eef2ff" />
      <rect x="88" y="50" width="20" height="20" rx="6" fill="#eef2ff" />
      <rect x="60" y="82" width="40" height="6" rx="3" fill="#eef2ff" opacity="0.8" />

      {/* body */}
      <rect x="16" y="112" width="128" height="120" rx="24" fill="#4338ca" />
      <rect x="44" y="136" width="72" height="52" rx="10" fill="#eef2ff" opacity="0.15" />
      <circle cx="80" cy="162" r="16" fill="#eef2ff" opacity="0.9" />
      <path
        d="M72 162l6 6 12-13"
        stroke="#4338ca"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* arms */}
      <rect x="-14" y="130" width="30" height="14" rx="7" fill="#4338ca" />
      <rect x="144" y="130" width="30" height="14" rx="7" fill="#4338ca" />
    </g>

    {/* graduation cap accent */}
    <g transform="translate(178,246)">
      <path d="M32 0L64 14 32 28 0 14z" fill="#10b981" />
      <path d="M14 19v14c0 5 8 9 18 9s18-4 18-9V19" fill="none" stroke="#10b981" strokeWidth="3" />
      <circle cx="60" cy="16" r="2.4" fill="#10b981" />
      <line x1="60" y1="16" x2="60" y2="30" stroke="#10b981" strokeWidth="2" />
    </g>
  </svg>
);

export default AuthIllustration;
