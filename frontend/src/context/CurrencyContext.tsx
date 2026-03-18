"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type Currency = "TRY" | "USD" | "EUR";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInTry: number) => string;
  rates: Record<Currency, number>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_COOKIE = "NEXT_CURRENCY";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("TRY");
  const [rates, setRates] = useState<Record<Currency, number>>({
    TRY: 1,
    USD: 0.029, // Mock rates, should be fetched from API
    EUR: 0.027,
  });

  useEffect(() => {
    const savedCurrency = Cookies.get(CURRENCY_COOKIE) as Currency;
    if (savedCurrency && ["TRY", "USD", "EUR"].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    // Fetch live rates if possible
    fetch("https://open.er-api.com/v6/latest/TRY")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) {
          setRates({
            TRY: 1,
            USD: data.rates.USD,
            EUR: data.rates.EUR,
          });
        }
      })
      .catch((err) => console.error("Failed to fetch rates:", err));
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    Cookies.set(CURRENCY_COOKIE, newCurrency, { expires: 365 });
  };

  const formatPrice = (priceInTry: number) => {
    const amount = priceInTry * rates[currency];
    
    return new Intl.NumberFormat(currency === "TRY" ? "tr-TR" : "en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
