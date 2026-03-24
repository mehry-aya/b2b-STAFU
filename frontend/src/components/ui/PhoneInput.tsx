"use client";

import React from "react";
import "react-phone-number-input/style.css";
import PhoneInputLib from "react-phone-number-input";
import { cn } from "@/lib/utils";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  variant?: "auth" | "profile";
  required?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  placeholder = "555 555 55 55",
  className,
  label,
  variant = "auth",
  required = false,
}: PhoneInputProps) {
  // Ensure value is E.164 (starts with +)
  const safeValue = value && !value.startsWith("+") ? `+${value}` : value;

  // Base styles for the container
  const containerStyles = cn(
    "flex flex-col gap-1.5",
    className
  );

  // Input wrapper styles based on variant
  const wrapperStyles = cn(
    "flex h-14 transition-all overflow-hidden rounded-xl border",
    variant === "auth" 
      ? "bg-white/5 border-white/10 focus-within:ring-2 focus-within:ring-white/30 text-black" 
      : "bg-white border-zinc-200 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 text-zinc-900"
  );

  return (
    <div className={containerStyles}>
      {label && (
        <label className={cn(
          "text-sm font-bold mb-0.5",
          variant === "auth" ? "text-slate-100" : "text-zinc-700"
        )}>
          {label}
        </label>
      )}
      <div className={wrapperStyles}>
        <PhoneInputLib
          international
          defaultCountry="TR"
          value={safeValue}
          onChange={(val) => onChange(val || "")}
          placeholder={placeholder}
          required={required}
          className="w-full px-4 phone-input-custom"
        />
      </div>

      <style jsx global>{`
        .phone-input-custom .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.875rem;
          font-weight: 500;
          height: 100%;
          width: 100%;
          color: inherit;
        }
        .phone-input-custom .PhoneInputCountry {
          margin-right: 0.75rem;
          padding-right: 0.75rem;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        ${variant === "profile" ? `
          .phone-input-custom .PhoneInputCountry {
            border-right: 1px solid #f4f4f5;
          }
        ` : ""}
        .phone-input-custom .PhoneInputCountrySelect {
          cursor: pointer;
        }
        .phone-input-custom .PhoneInputCountryIcon {
          width: 1.5rem;
          height: auto;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
