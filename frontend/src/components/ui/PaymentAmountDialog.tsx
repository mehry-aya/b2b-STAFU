"use client";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./AlertDialog";
import { useTranslations } from "next-intl";
import { useCurrency } from "@/context/CurrencyContext";

interface PaymentAmountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number) => void;
  maxAmount: number;
}

export function PaymentAmountDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  maxAmount,
}: PaymentAmountDialogProps) {
  const t = useTranslations("OrderDetail");
  const tCommon = useTranslations("Common");
  const { formatPrice } = useCurrency();
  const [amount, setAmount] = useState<string>("");

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount > 0) {
      onConfirm(numAmount);
      onOpenChange(false);
      setAmount("");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md bg-white border-zinc-800 text-black rounded-3xl p-8 shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-2xl font-black tracking-tighter text-black uppercase italic">
            {t("markAsFirstPaid")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400 font-medium leading-relaxed">
            {t("enterPaymentAmount")}
            <div className="mt-2 text-xs font-black uppercase tracking-widest text-zinc-500">
              Maximum: <span className="text-red-500">{formatPrice(maxAmount)}</span>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-gray-200 border-2 border-zinc-800 rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-black placeholder-zinc-700 focus:outline-none focus:border-red-600 transition-all"
            autoFocus
          />
        </div>

        <AlertDialogFooter className="gap-3 sm:space-x-0">
          <AlertDialogCancel 
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-transparent border-2 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-2xl py-4 font-black uppercase tracking-widest text-xs transition-all"
          >
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0 rounded-2xl py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-red-900/20 active:scale-95 transition-all disabled:opacity-30"
          >
            {tCommon("save")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
