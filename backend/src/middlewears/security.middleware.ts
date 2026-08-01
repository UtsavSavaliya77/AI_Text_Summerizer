import { Request, Response, NextFunction } from 'express';
// @ts-ignore
import xss from 'xss-clean';
import hpp from 'hpp';

/**
 * Custom wrapper for xss-clean to sanitize request body, query, and params.
 * Prevents Cross-Site Scripting (XSS) attacks.
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore - xss-clean doesn't have official type definitions
  return xss()(req, res, next);
};

/**
 * Prevents HTTP Parameter Pollution (HPP).
 * Ensures that duplicate query parameters are handled safely.
 */
export const preventPollution = hpp();