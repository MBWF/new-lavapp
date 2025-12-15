export type UserRole = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/': ['admin', 'employee'],
  '/map': ['admin', 'employee'],
  '/orders': ['admin'],
  '/orders/new': ['admin'],
  '/customers': ['admin'],
  '/pieces': ['admin'],
};

export const canAccessRoute = (role: UserRole, path: string): boolean => {
  const normalizedPath = path.split('/').slice(0, 2).join('/') || '/';

  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (normalizedPath.startsWith(route) || route === normalizedPath) {
      return allowedRoles.includes(role);
    }
  }

  return role === 'admin';
};

export const canViewPrices = (role: UserRole): boolean => {
  return role === 'admin';
};
