"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Option {
  id: string | number;
  label: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.id.toString() === value.toString());

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchQuery("");
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.id);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={handleToggle}
        className={`
          w-full bg-zinc-50 border-none rounded-2xl px-4 py-3.5 text-sm font-bold uppercase tracking-widest cursor-pointer
          flex items-center justify-between transition-all duration-300
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-100/80"}
          ${isOpen ? "ring-2 ring-blue-500/20 bg-white shadow-sm" : ""}
        `}
      >
        <span className={`truncate ${!selectedOption ? "text-zinc-400" : "text-zinc-900"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-2">
          {selectedOption && !disabled && (
            <X 
              className="w-4 h-4 text-zinc-400 hover:text-zinc-900 transition-colors" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-zinc-100 shadow-2xl rounded-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
          {/* Search Input */}
          <div className="p-3 border-b border-zinc-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-blue-500/10 outline-none"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto py-2 px-2 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">No results found</p>
              </div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer flex items-center justify-between transition-all group
                    ${value.toString() === opt.id.toString() 
                      ? "bg-blue-600 text-white" 
                      : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}
                  `}
                >
                  <span className="truncate">{opt.label}</span>
                  {value.toString() === opt.id.toString() && <Check className="w-4 h-4" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4d4d8;
        }
      `}</style>
    </div>
  );
}
