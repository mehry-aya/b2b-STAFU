"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

const currencies = [
  { code: "TRY", label: "Turkish Lira", flagCode: "tr" },
  { code: "USD", label: "US Dollar", flagCode: "us" },
  { code: "EUR", label: "Euro", flagCode: "eu" },
] as const;

export function CurrencySelector() {
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

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all group border border-zinc-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-zinc-800 shrink-0">
            <img 
              src={`https://flagcdn.com/w40/${currentCurrency.flagCode}.png`}
              alt={currentCurrency.label}
              className="w-full h-full object-cover"
            />
          </div>
          <span>{currency}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-1">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  setCurrency(curr.code as any);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currency === curr.code
                    ? "bg-red-600/10 text-red-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-white/10 shrink-0">
                    <img 
                      src={`https://flagcdn.com/w40/${curr.flagCode}.png`}
                      alt={curr.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{curr.code}</span>
                </div>
                {currency === curr.code && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
