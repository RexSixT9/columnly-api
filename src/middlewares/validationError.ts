import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export const validationErrorHandler = (schema: ZodTypeAny) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

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