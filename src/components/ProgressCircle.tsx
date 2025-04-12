"use client";
import React from "react";

interface ProgressCircleProps {
  progress: number;
}

export const ProgressCircle: React.FC<ProgressCircleProps> = ({ progress }) => {
  return (
    <div className="relative w-48 h-48">
      <svg className="transform -rotate-90 w-48 h-48">
        <circle
          cx="96"
          cy="96"
          r="88"
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx="96"
          cy="96"
          r="88"
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray="553"
          strokeDashoffset={553 - (553 * progress) / 100}
          className="text-[#8B5CF6]"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
        {progress}%
      </div>
    </div>
  );
}; 