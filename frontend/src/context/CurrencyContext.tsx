"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';

type Currency = 'TRY' | 'USD' | 'EUR';

interface CurrencyContextType {
  currency: Currency;
  rates: Record<string, number>;
  setCurrency: (currency: Currency) => void;
  formatPrice: (amountInTry: number | string) => string;
  convertPrice: (amountInTry: number | string) => { amount: number; symbol: string };
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const CURRENCY_COOKIE_NAME = 'NEXT_CURRENCY';
const DEFAULT_CURRENCY: Currency = 'TRY';

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};

const LOCALE_MAP: Record<Currency, string> = {
  TRY: 'tr-TR',
  USD: 'en-US',
  EUR: 'de-DE',
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number>>({ TRY: 1, USD: 0.03, EUR: 0.028 }); // Placeholder initial rates

  useEffect(() => {
    // 1. Initial currency from cookie
    const savedCurrency = Cookies.get(CURRENCY_COOKIE_NAME) as Currency;
    if (savedCurrency && ['TRY', 'USD', 'EUR'].includes(savedCurrency)) {
      setCurrencyState(savedCurrency);
    }

    // 2. Fetch live rates from our backend
    const fetchRates = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/exchange-rates`);
        if (response.ok) {
          const data = await response.json();
          setRates(data);
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
      }
    };

    fetchRates();
  }, []);

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    Cookies.set(CURRENCY_COOKIE_NAME, newCurrency, { expires: 365, path: '/' });
  };

  const convertPrice = (amountInTry: number | string) => {
    const numericAmount = typeof amountInTry === 'string' ? parseFloat(amountInTry) : amountInTry;
    const rate = rates[currency] || 1;
    return {
      amount: numericAmount * rate,
      symbol: CURRENCY_SYMBOLS[currency],
    };
  };

  const formatPrice = (amountInTry: number | string) => {
    const { amount } = convertPrice(amountInTry);
    return new Intl.NumberFormat(LOCALE_MAP[currency], {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <CurrencyContext.Provider value={{ currency, rates, setCurrency, formatPrice, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
