import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

type SchemaFactory = (req: Request) => ZodTypeAny;

export const validationErrorHandler = (
  schema: ZodTypeAny | SchemaFactory,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const resolvedSchema =
      typeof schema === 'function' ? schema(req) : schema;
    const result = await resolvedSchema.safeParseAsync(req.body);

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

    req.body = result.data;
    next();
  };
};

export default validationErrorHandler;