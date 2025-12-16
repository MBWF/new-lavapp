import { zodResolver } from '@hookform/resolvers/zod';
import {
  createFileRoute,
  useNavigate,
  useSearch,
} from '@tanstack/react-router';
import { Droplets, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';
import { type LoginFormData, loginSchema } from '@/schemas/auth-schema';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || '/',
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: '/login' });
  const { login, isAuthenticated, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated) {
    const defaultRoute = user?.role === 'employee' ? '/map' : '/';
    navigate({ to: redirect || defaultRoute });
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError('');
      const loggedInUser = await login(data);
      const defaultRoute = loggedInUser?.role === 'employee' ? '/map' : '/';
      navigate({ to: redirect || defaultRoute });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="-left-40 -top-40 absolute h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="-bottom-40 -right-40 absolute h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/25">
            <Droplets className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-bold text-3xl text-white">LavApp</h1>
          <p className="mt-1 text-white/60">Gerenciamento de Lavanderia</p>
        </div>

        <Card className="border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pt-6 pb-4 text-center">
            <h2 className="font-semibold text-white text-xl">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-white/60">
              Entre com suas credenciais para acessar
            </p>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/20 p-3 text-center text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    {...register('email')}
                    className={cn(
                      'border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-primary/30',
                      errors.email && 'border-red-500',
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                    className={cn(
                      'border-white/20 bg-white/10 pr-10 pl-10 text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-primary/30',
                      errors.password && 'border-red-500',
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="-translate-y-1/2 absolute top-1/2 right-3 text-white/40 hover:text-white/60"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-purple-600 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-lg bg-white/5 p-4">
              <p className="mb-2 text-center font-medium text-white/60 text-xs">
                Credenciais de demonstração
              </p>
              <div className="space-y-1 text-center text-sm text-white/80">
                <p>
                  <span className="text-white/50">Email:</span> admin@lavapp.com
                </p>
                <p>
                  <span className="text-white/50">Senha:</span> 123456
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-white/40">
          © 2024 LavApp. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
