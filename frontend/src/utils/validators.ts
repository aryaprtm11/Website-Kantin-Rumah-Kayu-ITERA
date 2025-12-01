/**
 * Validation utility functions
 * Reusable validators untuk form inputs
 */

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indonesian format)
 * @param phone - Phone number string
 * @returns true if valid Indonesian phone format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate required field
 * @param value - Value to validate
 * @returns true if not empty
 */
export function isRequired(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum required length
 * @returns true if meets minimum length
 */
export function minLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validate maximum length
 * @param value - String to validate
 * @param maxLength - Maximum allowed length
 * @returns true if within maximum length
 */
export function maxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validate number range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns true if within range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}



