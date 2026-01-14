import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

/**
 * Common decorator for 400 Bad Request - Validation errors
 */
export function ApiBadRequestResponse(description?: string) {
  return ApiResponse({
    status: 400,
    description: description || 'Bad Request - Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be a valid email',
          'name must be longer than or equal to 1 characters',
        ],
        error: 'Validation failed',
      },
    },
  });
}

/**
 * Common decorator for 400 Bad Request - Invalid UUID
 */
export function ApiInvalidUuidResponse() {
  return ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid UUID format',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
      },
    },
  });
}

/**
 * Common decorator for 404 Not Found
 */
export function ApiNotFoundResponse(resource = 'Employee') {
  return ApiResponse({
    status: 404,
    description: `${resource} not found`,
    schema: {
      example: {
        statusCode: 404,
        message: `${resource} with id 123e4567-e89b-12d3-a456-426614174000 not found`,
        error: 'Not Found',
      },
    },
  });
}

/**
 * Common decorator for 409 Conflict - Email already exists
 */
export function ApiEmailConflictResponse() {
  return ApiResponse({
    status: 409,
    description: 'Conflict - Email already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Employee with email john.doe@example.com already exists',
        error: 'Conflict',
      },
    },
  });
}

/**
 * Common decorator for 400 Bad Request - Empty body
 */
export function ApiEmptyBodyResponse() {
  return ApiResponse({
    status: 400,
    description: 'Bad Request - Empty body or no fields provided',
    schema: {
      example: {
        statusCode: 400,
        message: 'At least one field must be provided',
        error: 'Bad Request',
      },
    },
  });
}

/**
 * Combines common error responses for endpoints with ID param
 */
export function ApiCommonErrorsWithId() {
  return applyDecorators(ApiInvalidUuidResponse(), ApiNotFoundResponse());
}

/**
 * Combines common validation error responses
 */
export function ApiCommonValidationErrors() {
  return applyDecorators(ApiBadRequestResponse());
}

/**
 * Combines all common errors for create/update operations
 */
export function ApiCommonUpdateErrors() {
  return applyDecorators(
    ApiBadRequestResponse(),
    ApiNotFoundResponse(),
    ApiEmailConflictResponse(),
  );
}
