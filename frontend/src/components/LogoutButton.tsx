"use client";

import { logoutAction } from "@/app/login/actions";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
    >
      Sign Out
    </button>
  );
}
