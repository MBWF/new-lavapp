import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Home,
  Users,
  Package,
  ClipboardList,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Droplets,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Pedidos',
    href: '/orders',
    icon: ClipboardList,
  },
  {
    title: 'Mapa',
    href: '/map',
    icon: CalendarDays,
  },
  {
    title: 'Clientes',
    href: '/customers',
    icon: Users,
  },
  {
    title: 'Peças',
    href: '/pieces',
    icon: Package,
  },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-[70px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-16 items-center border-b px-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
            <Droplets className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold tracking-tight">LavApp</h1>
              <p className="text-xs text-muted-foreground">Gerenciamento</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
          const Icon = item.icon

          const linkContent = (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                `stagger-${index + 1} animate-slide-in-left opacity-0`
              )}
              style={{ animationFillMode: 'forwards' }}
            >
              <Icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110',
                  isActive && 'text-sidebar-accent-foreground'
                )}
              />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )

          if (isCollapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          }

          return linkContent
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-center"
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  )
}

