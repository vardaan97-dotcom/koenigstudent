/**
 * Authentication Middleware & Utilities
 * =====================================
 *
 * Security utilities for authentication and authorization.
 *
 * HANDOVER NOTES:
 * - JWT tokens are used for API authentication
 * - WorkOS is the primary OAuth provider for enterprise SSO
 * - Tokens are stored in httpOnly cookies in production
 * - Role-based access control (RBAC) for authorization
 */

import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/db/schema';

// ============================================================================
// TYPES
// ============================================================================

export interface JWTPayload {
  sub: string;        // User ID
  email: string;
  role: UserRole;
  companyId: string;
  companySlug: string;
  exp: number;        // Expiration timestamp
  iat: number;        // Issued at timestamp
}

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// In production, use environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'koenig-learner-portal-secret-key-change-in-production';
const JWT_EXPIRY = '7d';
const REFRESH_TOKEN_EXPIRY = '30d';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/workos',
  '/api/auth/callback',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
  '/icons',
  '/offline.html',
];

// Role hierarchy for authorization
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'learner': 1,
  'team_lead': 2,
  'manager': 3,
  'company_admin': 4,
  'koenig_sales': 5,
  'koenig_admin': 6,
};

// ============================================================================
// JWT UTILITIES (Simulated - use jsonwebtoken in production)
// ============================================================================

/**
 * Create a JWT token
 * NOTE: In production, use proper JWT library (jsonwebtoken)
 */
export function createToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60, // 7 days
  };

  // In production, sign with proper JWT library
  // For demo, using base64 encoding
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(fullPayload));
  const signature = btoa(`${header}.${body}.${JWT_SECRET}`);

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * NOTE: In production, use proper JWT library
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1])) as JWTPayload;

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // In production, verify signature properly
    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a refresh token
 */
export function createRefreshToken(userId: string): string {
  const token = crypto.randomUUID() + '-' + crypto.randomUUID();
  // In production, store in database with expiry
  return token;
}

// ============================================================================
// MIDDLEWARE FUNCTIONS
// ============================================================================

/**
 * Check if a route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Extract token from request
 */
export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get('auth_token');
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

/**
 * Main authentication middleware
 */
export function authMiddleware(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Skip public routes
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Extract and verify token
  const token = extractToken(request);
  if (!token) {
    // Redirect to login for page requests
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    // Token invalid or expired
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      { success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } },
      { status: 401 }
    );
  }

  // Token valid - continue
  return null;
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user can access company data
 */
export function canAccessCompany(user: JWTPayload, companyId: string): boolean {
  // Koenig admins and sales can access any company
  if (hasRole(user.role, 'koenig_sales')) {
    return true;
  }

  // Other users can only access their own company
  return user.companyId === companyId;
}

/**
 * Authorization middleware factory
 */
export function requireRole(requiredRole: UserRole) {
  return (request: AuthenticatedRequest): NextResponse | null => {
    if (!request.user) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (!hasRole(request.user.role, requiredRole)) {
      return NextResponse.json(
        { success: false, error: { code: 'ACCESS_DENIED', message: 'Insufficient permissions' } },
        { status: 403 }
      );
    }

    return null;
  };
}

/**
 * Require company admin or higher
 */
export const requireCompanyAdmin = requireRole('company_admin');

/**
 * Require Koenig sales or higher
 */
export const requireKoenigSales = requireRole('koenig_sales');

/**
 * Require Koenig admin
 */
export const requireKoenigAdmin = requireRole('koenig_admin');

// ============================================================================
// API ROUTE HELPERS
// ============================================================================

/**
 * Wrapper for authenticated API routes
 */
export function withAuth<T>(
  handler: (request: AuthenticatedRequest) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest): Promise<NextResponse<T | { success: false; error: { code: string; message: string } }>> => {
    const token = extractToken(request);

    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: 'AUTH_REQUIRED', message: 'Authentication required' } },
        { status: 401 }
      ) as NextResponse<{ success: false; error: { code: string; message: string } }>;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: { code: 'TOKEN_INVALID', message: 'Invalid or expired token' } },
        { status: 401 }
      ) as NextResponse<{ success: false; error: { code: string; message: string } }>;
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = payload;

    return handler(authenticatedRequest);
  };
}

/**
 * Wrapper for role-protected API routes
 */
export function withRole<T>(
  requiredRole: UserRole,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse<T>>
) {
  return withAuth(async (request: AuthenticatedRequest) => {
    const roleCheck = requireRole(requiredRole)(request);
    if (roleCheck) {
      return roleCheck as NextResponse<T>;
    }
    return handler(request);
  });
}

// ============================================================================
// PASSWORD UTILITIES
// ============================================================================

/**
 * Hash password (use bcrypt in production)
 */
export async function hashPassword(password: string): Promise<string> {
  // In production, use bcrypt:
  // return await bcrypt.hash(password, 12);

  // For demo, using simple hash
  const encoder = new TextEncoder();
  const data = encoder.encode(password + JWT_SECRET);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify password
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-src https://www.youtube.com;"
  );

  return response;
}

export default {
  createToken,
  verifyToken,
  authMiddleware,
  hasRole,
  canAccessCompany,
  withAuth,
  withRole,
  hashPassword,
  verifyPassword,
  addSecurityHeaders,
};
