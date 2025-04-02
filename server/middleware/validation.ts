import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { validationError } from '../utils/api-error';
import { logger } from '../logger';

export enum ValidationTarget {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers',
  ALL = 'all'
}

interface ValidationOptions {
  /**
   * Whether to abort validation on the first error
   * @default false
   */
  abortEarly?: boolean;

  /**
   * The message to use for the error
   * @default "Validation failed"
   */
  message?: string;

  /**
   * Additional details to include with the error
   */
  details?: any;
}

/**
 * Creates a middleware function that validates request data against a Zod schema
 * 
 * @param schema Zod schema to validate against
 * @param target Part of the request to validate (body, query, params, headers, or all)
 * @param options Validation options
 * @returns Express middleware function
 */
export function validate(
  schema: AnyZodObject,
  target: ValidationTarget = ValidationTarget.BODY,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Select the target data to validate
      let data: any;
      switch (target) {
        case ValidationTarget.BODY:
          data = req.body;
          break;
        case ValidationTarget.QUERY:
          data = req.query;
          break;
        case ValidationTarget.PARAMS:
          data = req.params;
          break;
        case ValidationTarget.HEADERS:
          data = req.headers;
          break;
        case ValidationTarget.ALL:
          data = {
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers
          };
          break;
      }

      // Parse and validate the data
      await schema.parseAsync(data);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the validation errors
        const formattedErrors = error.errors.map((err) => ({
          path: err.path,
          message: err.message,
          code: err.code
        }));

        // Log the validation error at INFO level since it's a client issue
        logger.info(`Validation failed for ${req.method} ${req.path}: ${JSON.stringify(formattedErrors)}`);

        // Create a standardized API error for consistent response
        const apiError = validationError(
          options.message || 'Validation failed',
          {
            errors: formattedErrors,
            target,
            path: req.path,
            ...options.details
          }
        );

        next(apiError);
      } else {
        // For non-validation errors, pass to the next middleware
        next(error);
      }
    }
  };
}

/**
 * Validate multiple parts of a request with different schemas
 * 
 * @param schemas Object mapping targets to their schemas
 * @param options Validation options
 * @returns Express middleware function
 */
export function validateRequest(
  schemas: Partial<Record<ValidationTarget, AnyZodObject>>,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Collect all validation errors across all targets
      const validationPromises = [];
      const validationErrors: Array<{ target: string, errors: ZodError }> = [];

      // Process each target schema
      for (const [target, schema] of Object.entries(schemas)) {
        if (!schema) continue;

        let data: any;
        switch (target) {
          case ValidationTarget.BODY:
            data = req.body;
            break;
          case ValidationTarget.QUERY:
            data = req.query;
            break;
          case ValidationTarget.PARAMS:
            data = req.params;
            break;
          case ValidationTarget.HEADERS:
            data = req.headers;
            break;
          default:
            continue;
        }

        // Create a promise for each validation
        const validationPromise = schema.safeParseAsync(data)
          .then(result => {
            if (!result.success) {
              validationErrors.push({
                target,
                errors: result.error
              });
            }
          });

        validationPromises.push(validationPromise);
      }

      // Wait for all validations to complete
      await Promise.all(validationPromises);

      // If there are validation errors, format and return them
      if (validationErrors.length > 0) {
        // Format all errors
        const formattedErrors = validationErrors.flatMap(({ target, errors }) => 
          errors.errors.map((err) => ({
            target,
            path: err.path,
            message: err.message,
            code: err.code
          }))
        );

        // Log the validation errors
        logger.info(`Validation failed for ${req.method} ${req.path}: ${JSON.stringify(formattedErrors)}`);

        // Create a standardized API error
        const apiError = validationError(
          options.message || 'Validation failed',
          {
            errors: formattedErrors,
            path: req.path,
            ...options.details
          }
        );

        next(apiError);
        return;
      }

      // If validation passes for all targets, proceed
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Helper function to create a validation middleware for the request body
 * 
 * @param schema Zod schema to validate against
 * @param options Validation options
 * @returns Express middleware function
 */
export function validateBody(schema: AnyZodObject, options: ValidationOptions = {}) {
  return validate(schema, ValidationTarget.BODY, options);
}

/**
 * Helper function to create a validation middleware for query parameters
 * 
 * @param schema Zod schema to validate against
 * @param options Validation options
 * @returns Express middleware function
 */
export function validateQuery(schema: AnyZodObject, options: ValidationOptions = {}) {
  return validate(schema, ValidationTarget.QUERY, options);
}

/**
 * Helper function to create a validation middleware for route parameters
 * 
 * @param schema Zod schema to validate against
 * @param options Validation options
 * @returns Express middleware function
 */
export function validateParams(schema: AnyZodObject, options: ValidationOptions = {}) {
  return validate(schema, ValidationTarget.PARAMS, options);
}

/**
 * Create a middleware that transforms the validated data and adds it to the request
 * 
 * @param schema Zod schema to validate and transform with
 * @param target Part of the request to validate
 * @param options Validation options
 * @returns Express middleware function
 */
export function transformRequest<T extends AnyZodObject>(
  schema: T,
  target: ValidationTarget = ValidationTarget.BODY,
  options: ValidationOptions = {}
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Select the target data to validate and transform
      let data: any;
      switch (target) {
        case ValidationTarget.BODY:
          data = req.body;
          break;
        case ValidationTarget.QUERY:
          data = req.query;
          break;
        case ValidationTarget.PARAMS:
          data = req.params;
          break;
        case ValidationTarget.HEADERS:
          data = req.headers;
          break;
        default:
          data = req.body;
      }

      // Parse, validate, and transform the data
      const validated = await schema.parseAsync(data);

      // Store the validated/transformed data on the request object
      switch (target) {
        case ValidationTarget.BODY:
          req.body = validated;
          break;
        case ValidationTarget.QUERY:
          // @ts-ignore - We're intentionally overwriting the query
          req.query = validated;
          break;
        case ValidationTarget.PARAMS:
          // @ts-ignore - We're intentionally overwriting the params
          req.params = validated;
          break;
        default:
          // For anything else, store in a new validatedData property
          (req as any).validatedData = validated;
      }

      next();
    } catch (error) {
      // Handle validation errors the same way as the validate middleware
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path,
          message: err.message,
          code: err.code
        }));

        logger.info(`Validation failed for ${req.method} ${req.path}: ${JSON.stringify(formattedErrors)}`);

        const apiError = validationError(
          options.message || 'Validation failed',
          {
            errors: formattedErrors,
            target,
            path: req.path,
            ...options.details
          }
        );

        next(apiError);
      } else {
        next(error);
      }
    }
  };
}

export function validateRegistration(req: Request, res: Response, next: NextFunction) {
  const { username, email, password, firstName, lastName, role } = req.body;

  if (!username || typeof username !== 'string' || username.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }

  if (!firstName || typeof firstName !== 'string') {
    return res.status(400).json({ message: 'First name is required' });
  }

  if (!lastName || typeof lastName !== 'string') {
    return res.status(400).json({ message: 'Last name is required' });
  }

  if (!role || typeof role !== 'string' || !['admin', 'therapist', 'client'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { username, password } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ message: 'Username is required' });
  }

  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required' });
  }

  next();
} 