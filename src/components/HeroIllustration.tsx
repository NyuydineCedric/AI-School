import React from "react";

// Landing-page hero illustration: an AI tutor at a "screen" surrounded by
// floating stat/progress cards, evoking the classroom-of-the-future concept
// without needing a raster asset.
const HeroIllustration: React.FC = () => (
  <svg
    viewBox="0 0 560 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full"
  >
    <defs>
      <linearGradient id="hero-panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#eef2ff" />
        <stop offset="100%" stopColor="#e0e7ff" />
      </linearGradient>
      <linearGradient id="hero-bot" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4338ca" />
      </linearGradient>
      <radialGradient id="hero-glow" cx="50%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0" />
      </radialGradient>
    </defs>

    <circle cx="290" cy="220" r="230" fill="url(#hero-glow)" />

    {/* big screen / whiteboard */}
    <rect x="90" y="60" width="380" height="260" rx="24" fill="url(#hero-panel)" stroke="#c7d2fe" />
    <rect x="118" y="88" width="140" height="10" rx="5" fill="#c7d2fe" />
    <rect x="118" y="108" width="100" height="8" rx="4" fill="#ddd6fe" />

    {/* mini bar chart on the screen */}
    <g transform="translate(118,150)">
      {[38, 62, 48, 78, 56, 90].map((h, i) => (
        <rect
          key={i}
          x={i * 24}
          y={96 - h}
          width="14"
          height={h}
          rx="4"
          fill={i % 2 === 0 ? "#6366f1" : "#a5b4fc"}
        />
      ))}
    </g>

    {/* donut */}
    <g transform="translate(340,150)">
      <circle cx="48" cy="48" r="42" fill="none" stroke="#e0e7ff" strokeWidth="14" />
      <circle
        cx="48"
        cy="48"
        r="42"
        fill="none"
        stroke="#10b981"
        strokeWidth="14"
        strokeDasharray="185 264"
        strokeLinecap="round"
        transform="rotate(-90 48 48)"
      />
      <text x="48" y="54" textAnchor="middle" fontSize="20" fontWeight="700" fill="#1e293b">
        70%
      </text>
    </g>

    {/* AI tutor bot standing in front of the screen */}
    <g transform="translate(228,214)">
      <line x1="72" y1="-10" x2="72" y2="6" stroke="#818cf8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="72" cy="-16" r="7" fill="#a5b4fc" />

      <rect x="24" y="6" width="96" height="80" rx="26" fill="url(#hero-bot)" />
      <rect x="44" y="34" width="18" height="18" rx="5" fill="#eef2ff" />
      <rect x="82" y="34" width="18" height="18" rx="5" fill="#eef2ff" />
      <rect x="52" y="64" width="40" height="6" rx="3" fill="#eef2ff" opacity="0.85" />

      <rect x="8" y="88" width="128" height="108" rx="22" fill="#4338ca" />
      <circle cx="72" cy="132" r="15" fill="#eef2ff" opacity="0.95" />
      <path
        d="M64 132l6 6 12-13"
        stroke="#4338ca"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </g>

    {/* floating "assignment graded" card */}
    <g transform="translate(30,330)">
      <rect width="150" height="76" rx="16" fill="white" stroke="#e2e8f0" />
      <circle cx="30" cy="38" r="16" fill="#ecfdf5" />
      <path
        d="M23 38l4.5 4.5L37 32"
        stroke="#10b981"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <rect x="58" y="26" width="72" height="8" rx="4" fill="#e2e8f0" />
      <rect x="58" y="42" width="50" height="7" rx="3.5" fill="#c7d2fe" />
    </g>

    {/* floating "new message" card */}
    <g transform="translate(376,330)">
      <rect width="154" height="76" rx="16" fill="white" stroke="#e2e8f0" />
      <circle cx="30" cy="38" r="16" fill="#eef2ff" />
      <path d="M22 32h16v12H22z" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      <path d="M22 32l8 7 8-7" stroke="#4f46e5" strokeWidth="2.2" fill="none" strokeLinejoin="round" />
      <rect x="58" y="26" width="76" height="8" rx="4" fill="#e2e8f0" />
      <rect x="58" y="42" width="54" height="7" rx="3.5" fill="#e2e8f0" />
    </g>

    {/* graduation cap accent */}
    <g transform="translate(250,392)">
      <path d="M40 0L80 18 40 36 0 18z" fill="#f59e0b" />
      <path d="M18 24v16c0 6 10 11 22 11s22-5 22-11V24" fill="none" stroke="#f59e0b" strokeWidth="3.4" />
    </g>
  </svg>
);

export default HeroIllustration;
