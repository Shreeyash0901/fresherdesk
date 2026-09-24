/**
 * Normalizes phone numbers to standard format (e.g., "+919876543210" or "9876543210").
 * This is a pure utility function — NOT a server action.
 */
export function normalizePhoneNumber(rawPhone: string, defaultCountryCode = "+91"): string {
  if (!rawPhone) return "";
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned;
  }

  // If 10 digits and starts without +, prefix default country code
  if (cleaned.length === 10) {
    return `${defaultCountryCode}${cleaned}`;
  }

  // If 12 digits starting with 91, prefix +
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return `+${cleaned}`;
  }

  return cleaned.startsWith("+") ? cleaned : `${defaultCountryCode}${cleaned}`;
}
