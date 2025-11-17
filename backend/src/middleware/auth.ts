import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'athlete' | 'coach' | 'both';
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default_secret';
    const decoded = jwt.verify(token, jwtSecret) as {
      userId: string;
      role: 'athlete' | 'coach' | 'both';
    };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeCoach = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.userRole === 'coach' || req.userRole === 'both') {
    next();
  } else {
    res.status(403).json({ error: 'Coach access required' });
  }
};

// Alias for compatibility
export const protect = authenticate;



