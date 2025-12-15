import { useNavigate } from '@tanstack/react-router';
import { LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: '/login', search: { redirect: '/' } });
  };

  const userInitials =
    user?.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="animate-fade-in">
        <h1 className="font-semibold text-xl tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label={
                theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'
              }
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="hover:-rotate-12 h-5 w-5 transition-transform" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-2 h-6" />

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Avatar className="h-9 w-9 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 font-medium text-sm">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{user?.name}</span>
              <span className="text-muted-foreground text-xs">
                {user?.role === 'admin' ? 'Administrador' : 'Funcionário'}
              </span>
            </div>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="rounded-full text-muted-foreground hover:text-destructive"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
