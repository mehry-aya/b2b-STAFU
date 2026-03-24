"use client";

import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useState, useRef, useEffect } from "react";

const currencies = [
  { code: "TRY", label: "Turkish Lira (₺)", flagCode: "tr" },
  { code: "USD", label: "US Dollar ($)", flagCode: "us" },
  { code: "EUR", label: "Euro (€)", flagCode: "eu" },
] as const;

import { useTranslations } from "next-intl";

export function CurrencySelector({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const tc = useTranslations("Common");
  const { currency, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isCompact = variant === "compact";

  return (
    <div className={isCompact ? "flex items-center gap-2" : "relative w-full"} ref={containerRef}>
      {isCompact && (
        <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-tighter text-zinc-400 ml-1">
          {tc("currency")}
        </span>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-1 sm:gap-2 transition-all group ${
            isCompact 
              ? "px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg bg-white hover:bg-white text-zinc-900 border border-zinc-200 shadow-sm"
              : "w-full rounded-xl px-4 py-3 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
          } text-sm font-bold`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`rounded-sm overflow-hidden border shrink-0 ${isCompact ? "w-4 h-2.5 border-zinc-200" : "w-5 h-3.5 border-zinc-800"}`}>
              <img 
                src={`https://flagcdn.com/w40/${currencies.find(c => c.code === currency)?.flagCode}.png`}
                alt={currency}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] sm:text-[11px] tracking-wider">{currency}</span>
          </div>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isCompact ? "text-zinc-400" : ""}`} />
        </button>

        {isOpen && (
          <div className={`absolute ${isCompact ? "top-full right-0 mt-2 w-40" : "bottom-full left-0 w-full mb-2"} bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200`}>
            <div className="p-1">
              {currencies.map((curr) => {
                const isActive = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => {
                      setCurrency(curr.code);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2.5 rounded-sm overflow-hidden border border-zinc-100 shrink-0">
                        <img 
                          src={`https://flagcdn.com/w40/${curr.flagCode}.png`}
                          alt={curr.code}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{curr.label}</span>
                    </div>
                    {isActive && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
