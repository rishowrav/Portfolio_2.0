import React from "react";

export const BackgroundDecorations: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Top-Left Soft Corner Wave matching mockup */}
      <svg
        className="absolute top-0 left-0 w-[240px] sm:w-[320px] md:w-[380px] h-[240px] sm:h-[320px] md:h-[380px] text-[#EFF5FD]"
        viewBox="0 0 380 380"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 0 0 L 260 0 C 180 80, 100 160, 0 280 Z" />
      </svg>

      {/* Bottom-Left Soft Corner Wave matching mockup */}
      <svg
        className="absolute bottom-0 left-0 w-[220px] sm:w-[280px] md:w-[340px] h-[220px] sm:h-[280px] md:h-[340px] text-[#EDF4FE]"
        viewBox="0 0 340 340"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 0 120 C 80 180, 140 240, 180 340 L 0 340 Z" />
      </svg>

      {/* Top-Right Thin Concentric Circular Arcs matching mockup */}
      <svg
        className="absolute top-0 right-0 w-[260px] sm:w-[340px] md:w-[420px] h-[260px] sm:h-[340px] md:h-[420px]"
        viewBox="0 0 420 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="420" cy="0" r="180" stroke="#DFEBFA" strokeWidth="1.5" />
        <circle cx="420" cy="0" r="280" stroke="#E6F0FC" strokeWidth="1.2" />
      </svg>

      {/* Bottom-Right Soft Circular Shape & Thin Arc Ring matching mockup */}
      <svg
        className="absolute bottom-0 right-0 w-[380px] sm:w-[480px] md:w-[580px] h-[380px] sm:h-[480px] md:h-[580px]"
        viewBox="0 0 580 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft pale blue circular sector fill */}
        <path
          d="M 580 140 A 440 440 0 0 0 140 580 L 580 580 Z"
          fill="#F1F5FD"
        />
        {/* Thin concentric circle arc lines */}
        <circle cx="580" cy="580" r="440" stroke="#E2ECFA" strokeWidth="1.5" />
        <circle cx="580" cy="580" r="540" stroke="#EBF3FD" strokeWidth="1.2" />
      </svg>

      {/* Right Edge: Exactly 4 Vertical Blue Dots matching mockup */}
      <div className="hidden lg:flex absolute right-6 sm:right-8 xl:right-12 top-[54%] -translate-y-1/2 flex-col gap-4 z-10 select-none">
        {[...Array(4)].map((_, i) => (
          <span
            key={`mockup-dot-${i}`}
            className="w-[7px] h-[7px] rounded-full bg-[#9DBFF2]"
          />
        ))}
      </div>
    </div>
  );
};
