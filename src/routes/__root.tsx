import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Toaster } from '@/components/ui/toaster';

export const Route = createRootRoute({
  component: RootComponent,
});

const PUBLIC_ROUTES = ['/login', '/tracking'];

function RootComponent() {
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  if (isPublicRoute) {
    return (
      <>
        <Outlet />
        <Toaster />
      </>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Outlet />
        <Toaster />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
