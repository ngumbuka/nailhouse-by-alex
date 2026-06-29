/**
 * Validates whether a phone number matches standard WhatsApp format and returns warning if not
 */
export function validateWhatsAppNumber(
  phone: string,
  isEnglish: boolean,
): { isValid: boolean; warning?: string } {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) {
    return { isValid: true };
  }

  // Check if it's a Cameroon number format (9 digits)
  if (cleaned.length === 9) {
    if (cleaned.startsWith("6") || cleaned.startsWith("2")) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        warning: isEnglish
          ? "A 9-digit Cameroon number must start with 6 or 2."
          : "Un numéro camerounais à 9 chiffres doit commencer par 6 ou 2.",
      };
    }
  }

  // Check if it's an international format (starts with +)
  if (phone.trim().startsWith("+")) {
    if (cleaned.length >= 7 && cleaned.length <= 15) {
      return { isValid: true };
    } else {
      return {
        isValid: false,
        warning: isEnglish
          ? "Invalid international number length (must be 7-15 digits)."
          : "Longueur de numéro international invalide (doit être de 7 à 15 chiffres).",
      };
    }
  }

  // Otherwise, warn
  return {
    isValid: false,
    warning: isEnglish
      ? "Enter a 9-digit number or include country code with '+' (e.g., +237...)."
      : "Saisissez un numéro à 9 chiffres ou incluez l'indicatif avec '+' (ex : +237...).",
  };
}
