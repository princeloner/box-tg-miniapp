"use client";
import React from "react";
import Image from "next/image";

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-[#1c1c1c] p-4 flex justify-around items-center">
      {/* Навигационные кнопки */}
      <button
        onClick={() => setActiveTab("TASKS")}
        className={`flex flex-col items-center ${
          activeTab === "TASKS" ? "text-[#8B5CF6]" : "text-gray-400"
        }`}
      >
        <Image 
          src="/icons/tasks.svg" 
          alt="Tasks" 
          width={24} 
          height={24}
          className={`${activeTab === "TASKS" ? "opacity-100" : "opacity-60"}`}
        />
        <span className="text-xs mt-1">TASKS</span>
      </button>
      <button
        onClick={() => setActiveTab("STAKE")}
        className={`flex flex-col items-center ${
          activeTab === "STAKE" ? "text-[#8B5CF6]" : "text-gray-400"
        }`}
      >
        <Image 
          src="/icons/stake.svg" 
          alt="Stake" 
          width={24} 
          height={24}
          className={`${activeTab === "STAKE" ? "opacity-100" : "opacity-60"}`}
        />
        <span className="text-xs mt-1">STAKE</span>
      </button>
      <button
        onClick={() => setActiveTab("TASK")}
        className="bg-[#8B5CF6] w-16 h-16 rounded-full flex items-center justify-center -mt-8 shadow-lg hover:bg-[#7C3AED] transition-colors"
      >
        <Image 
          src="/icons/gift.svg" 
          alt="Cases" 
          width={32} 
          height={32}
          className="opacity-100"
        />
      </button>
      <button
        onClick={() => setActiveTab("EARN")}
        className={`flex flex-col items-center ${
          activeTab === "EARN" ? "text-[#8B5CF6]" : "text-gray-400"
        }`}
      >
        <Image 
          src="/icons/coins.svg" 
          alt="Earn" 
          width={24} 
          height={24}
          className={`${activeTab === "EARN" ? "opacity-100" : "opacity-60"}`}
        />
        <span className="text-xs mt-1">EARN</span>
      </button>
      
      <button
        onClick={() => setActiveTab("USER")}
        className={`flex flex-col items-center ${
          activeTab === "USER" ? "text-[#8B5CF6]" : "text-gray-400"
        }`}
      >
        <Image 
          src="/icons/user.svg" 
          alt="User" 
          width={24} 
          height={24}
          className={`${activeTab === "USER" ? "opacity-100" : "opacity-60"}`}
        />
       
        <span className="text-xs mt-1">USER</span>
      </button>
    </div>
  );
};