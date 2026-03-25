import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function mapBackendError(message: string): string {
  if (!message) return "unknownError";
  
  const mapping: Record<string, string> = {
    "Invalid credentials": "invalidCredentials",
    "Account is inactive": "accountInactive",
    "Email already exists": "emailAlreadyExists",
    "One or more product variants not found": "itemNotFound",
    "Only draft orders can be deleted": "onlyDraftsDeletable",
    "Authentication required": "authRequired",
    "Failed to fetch admin stats": "fetchStatsFailed",
    "Failed to fetch dealer stats": "fetchStatsFailed",
    "Failed to connect to server": "connectionError",
  };

  if (mapping[message]) return mapping[message];
  
  // Handle dynamic messages using regex
  if (/Order #\d+ not found/.test(message)) return "orderNotFound";
  if (/Variant #\d+ not found/.test(message)) return "itemNotFound";

  // Default fallbacks for common backend patterns
  if (message.toLowerCase().includes("not found")) return "itemNotFound";
  if (message.toLowerCase().includes("unauthorized")) return "authRequired";

  return message; 
}
