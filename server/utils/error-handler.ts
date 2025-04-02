import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';
import { 
  ApiError, 
  validationError,
  fromError,
  resourceNotFoundError,
  forbiddenError 
} from '../utils/api-error';

/**
 * Wraps an async route handler with a try-catch block that forwards errors to the error middleware
 * @param fn The async route handler function
 * @returns A wrapped function that forwards errors to next()
 */
export const asyncHandler = <T extends Request, U extends Response>(
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return async (req: T, res: U, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Convert any errors that aren't ApiErrors to ApiErrors
      if (!(error instanceof ApiError)) {
        if (error instanceof ZodError) {
          error = validationError('Validation failed', {
            errors: error.errors,
            path: req.path
          });
        } else {
          error = fromError(error);
        }
      }
      
      next(error);
    }
  };
};

/**
 * A more descriptive version of asyncHandler that shows the route and method in logs
 * @param routeName Name of the route or operation
 * @param fn The async route handler function
 */
export const asyncRoute = <T extends Request, U extends Response>(
  routeName: string,
  fn: (req: T, res: U, next: NextFunction) => Promise<any>
) => {
  return async (req: T, res: U, next: NextFunction) => {
    try {
      logger.debug(`Executing route handler: ${routeName} [${req.method} ${req.path}]`);
      await fn(req, res, next);
    } catch (error) {
      logger.debug(`Error in route handler: ${routeName} [${req.method} ${req.path}]`);
      
      // Convert any errors that aren't ApiErrors to ApiErrors
      if (!(error instanceof ApiError)) {
        if (error instanceof ZodError) {
          error = validationError('Validation failed', {
            errors: error.errors,
            path: req.path,
            route: routeName
          });
        } else {
          error = fromError(error, `Error in ${routeName}`);
          // Add source information
          error.source = routeName;
        }
      }
      
      next(error);
    }
  };
};

/**
 * Creates a validation handler for request validation
 * @param schema The Zod schema to validate against
 * @param dataSelector Function to select the data to validate from the request
 */
export const validateRequest = <T>(
  schema: ZodError,
  dataSelector: (req: Request) => any = (req) => ({ body: req.body, query: req.query, params: req.params })
) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = dataSelector(req);
      await schema.parseAsync(data);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(validationError('Request validation failed', {
          errors: error.errors,
          path: req.path
        }));
      } else {
        next(error);
      }
    }
  });
};

// For backward compatibility, re-export these functions
export {
  resourceNotFoundError as notFoundError,
  forbiddenError
};

// Export the commonly used error functions directly
export { 
  validationError,
  fromError as createError
}; 