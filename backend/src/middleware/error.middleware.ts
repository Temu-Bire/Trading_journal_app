import type {Request, Response, NextFunction} from 'express';

export const errorMiddleware = (
  err: Error,
  _req: Request,
    res: Response,
    _next: NextFunction,
): void => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
};
