"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";

const languages = [
  { code: "tr", label: "Türkçe", flagCode: "tr" },
  { code: "en", label: "English", flagCode: "us" },
] as const;

export function LanguageSelector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
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

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: "tr" | "en") => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all group border border-zinc-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-zinc-800 shrink-0">
            <img 
              src={`https://flagcdn.com/w40/${currentLanguage.flagCode}.png`}
              alt={currentLanguage.label}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="uppercase">{locale}</span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code as "tr" | "en")}
                className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  locale === lang.code
                    ? "bg-red-600/10 text-red-400"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-3.5 rounded-sm overflow-hidden border border-white/10 shrink-0">
                    <img 
                      src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                      alt={lang.label}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span>{lang.label}</span>
                </div>
                {locale === lang.code && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
