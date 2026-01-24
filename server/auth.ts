import { Request, Response, NextFunction } from 'express';
import { storage } from './storage.js';
import { LoginCredentials } from '../shared/schema.js';
import * as bcrypt from 'bcrypt';

// Session augmentation for TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    isAdmin?: boolean;
    role?: string;
  }
}

// Middleware to check if the user is authenticated and has dashboard access
export function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Allow admin, manager, and staff roles to access dashboard
  const allowedRoles = ['admin', 'manager', 'staff'];
  if (req.session.role && allowedRoles.includes(req.session.role)) {
    return next();
  }

  // Also maintain backward compatibility for isAdmin flag
  if (req.session.isAdmin) {
    return next();
  }

  return res.status(403).json({ message: 'Forbidden' });
}

// Function to authenticate user
export async function authenticateUser(credentials: LoginCredentials): Promise<{ success: boolean; userId?: number; isAdmin?: boolean; role?: string; error?: string }> {
  try {
    console.log('Trying to authenticate user:', credentials.username);
    const user = await storage.getUserByUsername(credentials.username);

    if (!user) {
      console.log('User not found');
      return { success: false, error: "User not found in database" };
    }

    console.log('User found, comparing credentials');

    // For the super admin account, use direct comparison with the known password
    if (credentials.username === 'superadmin' && credentials.password === 'SuperAdmin@2024!Secure') {
      console.log('Super admin login successful');
      return {
        success: true,
        userId: user.id,
        isAdmin: true,
        role: 'admin'
      };
    }

    // For the admin demo account, use a direct comparison with the known password
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      console.log('Demo admin login successful');
      return {
        success: true,
        userId: user.id,
        isAdmin: true,
        role: 'admin'
      };
    }

    // For regular users, check password normally
    const passwordMatches = credentials.password === user.password;

    if (!passwordMatches) {
      console.log('Password does not match');
      // DEBUG: Show what we compared (safe to log here in debug mode, remove later)
      return { success: false, error: `Password mismatch. DB has: ${user.password?.substring(0, 3)}...` };
    }

    console.log('Login successful for user:', user.id);
    return {
      success: true,
      userId: user.id,
      isAdmin: user.isAdmin ?? false,
      role: user.role || (user.isAdmin ? 'admin' : 'customer')
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: "Internal authentication error" };
  }
}

// Helper function to hash a password (for use when creating users)
export async function hashPassword(password: string): Promise<string> {
  // In a real app, we'd use bcrypt.hash
  return password;
}
