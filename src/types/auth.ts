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
  '/': ['admin'],
  '/map': ['admin', 'employee'],
  '/orders': ['admin'],
  '/orders/new': ['admin'],
  '/customers': ['admin'],
  '/pieces': ['admin'],
};

export const canAccessRoute = (role: UserRole, path: string): boolean => {
  // Check if the path matches any defined route
  // We check from most specific to least specific
  const sortedRoutes = Object.keys(ROUTE_PERMISSIONS).sort(
    (a, b) => b.length - a.length,
  );

  for (const route of sortedRoutes) {
    // Check if path matches the route (either exact match or starts with route + '/')
    if (path === route || path.startsWith(route + '/')) {
      const allowedRoles = ROUTE_PERMISSIONS[route];
      if (allowedRoles) {
        return allowedRoles.includes(role);
      }
    }
  }

  // If no route matches, deny access
  return false;
};

export const canViewPrices = (role: UserRole): boolean => {
  return role === 'admin';
};
