import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { usersQueries } from '@/supabase/queries/users';
import type { AuthState, LoginCredentials, User, UserRole } from '@/types/auth';
import { canViewPrices } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => void;
  canViewPrices: boolean;
  isAdmin: boolean;
  isEmployee: boolean;
}

const AUTH_STORAGE_KEY = 'lavapp_auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        try {
          const storedUser = JSON.parse(storedAuth) as User;
          const freshUser = await usersQueries.getById(storedUser.id);

          if (freshUser) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(freshUser));
            setState({
              user: freshUser,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setState({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    loadStoredUser();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const user = await usersQueries.login(
      credentials.email,
      credentials.password,
    );

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      return user;
    } else {
      throw new Error('Email ou senha inválidos');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const userRole: UserRole = state.user?.role ?? 'employee';

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        canViewPrices: canViewPrices(userRole),
        isAdmin: userRole === 'admin',
        isEmployee: userRole === 'employee',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
