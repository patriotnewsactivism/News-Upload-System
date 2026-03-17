import React from "react";

export function AdPlaceholder({ width, height, className = "" }: { width: string; height: string; className?: string }) {
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-300 text-gray-400 text-sm font-mono text-center overflow-hidden rounded ${className}`} 
      style={{ width: width === '100%' ? '100%' : width, height, maxWidth: '100%' }}
    >
      <span className="uppercase tracking-widest font-semibold text-xs">Advertisement</span>
      <span className="text-[10px] opacity-60 mt-1">{width} x {height}</span>
    </div>
  );
}
