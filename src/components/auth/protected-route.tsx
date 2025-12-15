import { Navigate, useLocation } from '@tanstack/react-router';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { canAccessRoute } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" search={{ redirect: location.pathname }} />;
  }

  if (user && !canAccessRoute(user.role, location.pathname)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AccessDenied() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldX className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="font-bold text-2xl">Acesso Negado</h1>
      <p className="max-w-md text-center text-muted-foreground">
        Você não tem permissão para acessar esta página. Entre em contato com um
        administrador se acredita que isso é um erro.
      </p>
      <Button asChild>
        <a href="/map">Ir para o Mapa</a>
      </Button>
    </div>
  );
}
