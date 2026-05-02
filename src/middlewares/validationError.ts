import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

type SchemaFactory = (req: Request) => ZodTypeAny;
type ValidationTarget = 'body' | 'params' | 'query';

export const validationErrorHandler = (
  schema: ZodTypeAny | SchemaFactory,
  target: ValidationTarget = 'body',
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const resolvedSchema =
      typeof schema === 'function' ? schema(req) : schema;
    const input =
      target === 'params'
        ? req.params
        : target === 'query'
          ? req.query
          : req.body;
    const result = await resolvedSchema.safeParseAsync(input);

    if (!result.success) {
      const errors = result.error.flatten();
      res.status(400).json({
        code: 'ValidationError',
        message: 'Validation failed',
        errors: {
          ...errors.fieldErrors,
          _errors: errors.formErrors,
        },
      });
      return;
    }

    if (target === 'params') {
      req.params = result.data as Request['params'];
    } else if (target === 'query') {
      req.query = result.data as Request['query'];
    } else {
      req.body = result.data;
    }
    next();
  };
};

export default validationErrorHandler;