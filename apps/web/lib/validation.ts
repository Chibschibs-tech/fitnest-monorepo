/**
 * Validation Utilities
 * Common validation functions for API routes
 */

export interface ValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate required fields
 */
export function validateRequired(
  data: Record<string, any>,
  fields: string[]
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = []

  for (const field of fields) {
    if (!data[field] || (typeof data[field] === "string" && data[field].trim() === "")) {
      errors.push({
        field,
        message: `${field} is required`,
      })
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Array<{ field: string; message: string }> = []

  if (!email) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!isValidEmail(email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): ValidationResult {
  const errors: Array<{ field: string; message: string }> = []

  if (!password) {
    errors.push({ field: "password", message: "Password is required" })
  } else if (password.length < 8) {
    errors.push({ field: "password", message: "Password must be at least 8 characters" })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = "value"
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = []

  if (value < min || value > max) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be between ${min} and ${max}`,
    })
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

