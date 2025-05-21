import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { LoginCredentials } from '@shared/schema';
import * as bcrypt from 'bcrypt';

// Session augmentation for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
  }
}

// Middleware to check if the user is authenticated and an admin
export function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || !req.session.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Function to authenticate user
export async function authenticateUser(credentials: LoginCredentials): Promise<{ success: boolean; userId?: number; isAdmin?: boolean }> {
  try {
    const user = await storage.getUserByUsername(credentials.username);
    
    if (!user) {
      return { success: false };
    }
    
    // In a real app, we'd use bcrypt.compare, but for simplicity in this demo:
    const passwordMatches = credentials.password === user.password;
    
    if (!passwordMatches) {
      return { success: false };
    }
    
    return { 
      success: true, 
      userId: user.id, 
      isAdmin: user.isAdmin 
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false };
  }
}

// Helper function to hash a password (for use when creating users)
export async function hashPassword(password: string): Promise<string> {
  // In a real app, we'd use bcrypt.hash
  return password;
}
