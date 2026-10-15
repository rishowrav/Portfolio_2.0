import React from "react";

export const DoodleArrow: React.FC = () => {
  return (
    <div className="relative pointer-events-none select-none">
      {/* Whimsical handwritten phrase matching mockup */}
      <div className="relative transform -rotate-12 transition-transform duration-300">
        <p className="font-handwriting text-3xl xl:text-4xl text-slate-500/80 font-normal tracking-wide leading-[1.15]">
          Let’s build
          <br />
          <span className="ml-3">something great!</span>
        </p>

        {/* Hand-drawn curved arrow pointing toward Showrav */}
        <div className="mt-2 ml-2 w-28 h-20 text-slate-400/90">
          <svg
            viewBox="0 0 110 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full stroke-current"
          >
            {/* Smooth C-curve looping down and pointing left */}
            <path
              d="M 50 4 C 42 28, 30 42, 8 46"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Hand-drawn arrowhead */}
            <path
              d="M 18 38 L 6 46 L 16 54"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export const ShoulderSparks: React.FC = () => {
  return (
    <div className="absolute top-10 sm:top-14 right-2 sm:right-6 pointer-events-none select-none z-20">
      {/* 3 blue action burst marks matching mockup */}
      <svg
        width="65"
        height="65"
        viewBox="0 0 65 65"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-brand-500"
      >
        <line
          x1="8"
          y1="38"
          x2="26"
          y2="22"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="22"
          y1="52"
          x2="48"
          y2="40"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <line
          x1="36"
          y1="24"
          x2="46"
          y2="8"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
