"use client";

import React from "react";

export function LogoLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="relative flex items-center justify-center">
        {/* Outer ring for subtle pulsing effect */}
        <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-pulse"></div>
        
        {/* Inner spinning logo */}
        <div 
          className="relative w-20 h-20 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30 animate-spin"
          style={{
            background: "linear-gradient(to right, #249e5e, #16a34a)",
          }}
        >
          <span className="text-3xl font-bold text-gray-900 drop-shadow-md">XM</span>
        </div>
      </div>
    </div>
  );
}
