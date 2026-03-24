"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { validatePassword } from "@/lib/password-utils";
import { useTranslations } from "next-intl";

interface PasswordValidatorProps {
  password: string;
  show?: boolean;
}

export function PasswordValidator({ password, show = true }: PasswordValidatorProps) {
  const t = useTranslations("Common");
  const results = validatePassword(password);

  if (!password || !show) return null;

  const symbolicRequirements = [
    { key: "minLength", label: t("passwordRequirementLength"), isMet: results.minLength },
    { key: "hasLower", label: t("passwordRequirementLower"), isMet: results.hasLower },
    { key: "hasUpper", label: t("passwordRequirementUpper"), isMet: results.hasUpper },
    { key: "hasNumber", label: t("passwordRequirementNumber"), isMet: results.hasNumber },
    { key: "hasSpecial", label: t("passwordRequirementSpecial"), isMet: results.hasSpecial },
  ];

  const missing = symbolicRequirements.filter((req) => !req.isMet);
  if (missing.length === 0) return null;

  return (
    <div className="mt-2 px-1 animate-in fade-in slide-in-from-top-1 duration-300">
      <p className="text-[11px] font-medium text-red-400 leading-relaxed">
        <span className="font-bold mr-1 uppercase tracking-wider opacity-70">
          {t("missing") || "Missing"}:
        </span>
        {missing.map((req, index) => (
          <span key={req.key}>
            {req.label.toLowerCase()}
            {index < missing.length - 1 ? ", " : ""}
          </span>
        ))}
      </p>
    </div>
  );
}
