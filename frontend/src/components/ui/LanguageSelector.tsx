"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";

const languages = [
  { code: "tr", label: "Türkçe", flagCode: "tr" },
  { code: "en", label: "English", flagCode: "us" },
] as const;

export function LanguageSelector({ variant = "sidebar" }: { variant?: "sidebar" | "compact" }) {
  const t = useTranslations("Navigation");
  const tc = useTranslations("Common");
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

  const isCompact = variant === "compact";

  return (
    <div className={isCompact ? "flex items-center gap-2" : "relative w-full"} ref={containerRef}>
      {isCompact && (
        <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 ml-1">
          {tc("language")}
        </span>
      )}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between gap-2 transition-all group ${
            isCompact 
              ? "px-2 py-1.5 rounded-lg bg-white/50 hover:bg-white text-zinc-900 border border-zinc-200 shadow-sm"
              : "w-full rounded-xl px-4 py-3 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800"
          } text-sm font-bold`}
        >
          <div className="flex items-center gap-2">
            <div className={`rounded-sm overflow-hidden border shrink-0 ${isCompact ? "w-4 h-2.5 border-zinc-200" : "w-5 h-3.5 border-zinc-800"}`}>
              <img 
                src={`https://flagcdn.com/w40/${currentLanguage.flagCode}.png`}
                alt={currentLanguage.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="uppercase text-[11px] tracking-wider">{locale}</span>
          </div>
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isCompact ? "text-zinc-400" : ""}`} />
        </button>

        {isOpen && (
          <div className={`absolute ${isCompact ? "top-full right-0 mt-2 w-32" : "bottom-full left-0 w-full mb-2"} bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200`}>
            <div className="p-1">
              {languages.map((lang) => {
                const isActive = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as "tr" | "en")}
                    className={`flex w-full items-center justify-between px-2.5 py-2 rounded-lg text-[12px] font-bold transition-colors ${
                      isActive
                        ? "bg-red-50 text-red-600"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-2.5 rounded-sm overflow-hidden border border-zinc-100 shrink-0">
                        <img 
                          src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                          alt={lang.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span>{lang.label}</span>
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
