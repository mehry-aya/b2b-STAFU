"use client";

import Image from "next/image";

interface LogoProps {
  variant?: "black" | "white";
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ variant = "white", className = "", width, height }: LogoProps) {
  const src = variant === "white" ? "/stafu-pro-logo-white.png" : "/stafu-pro-logo-black.png";
  
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <Image
        src={src}
        alt="STAFUPRO"
        width={width || 120}
        height={height || 40}
        className="w-auto h-full max-h-full object-contain"
        priority
      />
    </div>
  );
}
