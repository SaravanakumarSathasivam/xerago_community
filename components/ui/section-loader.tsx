"use client";

import React from "react";

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center w-full h-40 bg-background/50 rounded-lg">
      <div className="relative flex items-center justify-center">
        <div className="absolute w-12 h-12 rounded-full bg-emerald-500/10 animate-pulse"></div>
        <div
          className="relative w-10 h-10 rounded-lg flex items-center justify-center shadow-lg border border-emerald-500/30 animate-spin"
          style={{
            background: "linear-gradient(to right, #249e5e, #16a34a)",
          }}
        >
          <span className="text-xl font-bold text-gray-900 drop-shadow-md">XM</span>
        </div>
      </div>
    </div>
  );
}
