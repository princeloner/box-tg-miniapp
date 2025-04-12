"use client";
import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0F0F0F] flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8B5CF6] mb-4"></div>
        <div className="text-white text-xl font-bold" style={{
          fontFamily: '"Press Start 2P", system-ui',
          fontSize: '1rem'
        }}>
          Loading...
        </div>
      </div>
    </div>
  );
}; 