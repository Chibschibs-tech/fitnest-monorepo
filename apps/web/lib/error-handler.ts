/**
 * Centralized Error Handling Utility
 * Provides consistent error responses across the application
 */

import { NextResponse } from "next/server"

export interface ApiError {
  code: string
  message: string
  details?: any
  statusCode: number
}

export class AppError extends Error {
  code: string
  statusCode: number
  details?: any

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message)
    this.name = "AppError"
    this.statusCode = statusCode
    this.code = code || "INTERNAL_ERROR"
    this.details = details
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "An error occurred",
  defaultStatusCode: number = 500
): NextResponse {
  // Log error for debugging (in production, use proper logging service)
  console.error("API Error:", error)

  // Handle AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const isProduction = process.env.NODE_ENV === "production"
    const message = isProduction ? defaultMessage : error.message

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message,
          ...(!isProduction && { stack: error.stack }),
        },
      },
      { status: defaultStatusCode }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: defaultMessage,
      },
    },
    { status: defaultStatusCode }
  )
}

/**
 * Create a success response
 */
export function createSuccessResponse(data: any, statusCode: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  )
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  
  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",
  MISSING_FIELD: "MISSING_FIELD",
  INVALID_INPUT: "INVALID_INPUT",
  
  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  CONFLICT: "CONFLICT",
  
  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  EXTERNAL_SERVICE_ERROR: "EXTERNAL_SERVICE_ERROR",
} as const

/**
 * Predefined error creators
 */
export const Errors = {
  unauthorized: (message: string = "Unauthorized") =>
    new AppError(message, 401, ErrorCodes.UNAUTHORIZED),
  
  forbidden: (message: string = "Forbidden") =>
    new AppError(message, 403, ErrorCodes.FORBIDDEN),
  
  notFound: (message: string = "Resource not found") =>
    new AppError(message, 404, ErrorCodes.NOT_FOUND),
  
  validation: (message: string, details?: any) =>
    new AppError(message, 400, ErrorCodes.VALIDATION_ERROR, details),
  
  conflict: (message: string = "Resource conflict") =>
    new AppError(message, 409, ErrorCodes.CONFLICT),
  
  database: (message: string = "Database error") =>
    new AppError(message, 500, ErrorCodes.DATABASE_ERROR),
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      return createErrorResponse(error)
    }
  }
}







