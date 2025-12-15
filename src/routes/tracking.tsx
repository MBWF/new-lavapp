import { createFileRoute, Link } from '@tanstack/react-router';
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Droplets,
  Hash,
  Loader2,
  MapPin,
  Package,
  Phone,
  Search,
  Shirt,
  Truck,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type Order, useOrdersByPhone } from '@/supabase/hooks';
import {
  deliveryTypeLabels,
  orderStatusColors,
  orderStatusLabels,
} from '@/types/order';

export const Route = createFileRoute('/tracking')({
  component: TrackingPage,
});

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

const statusSteps = ['RECEIVED', 'WASHING', 'READY', 'DELIVERED'];

function OrderStatusTimeline({ currentStatus }: { currentStatus: string }) {
  const currentIndex = statusSteps.indexOf(currentStatus);

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center justify-center rounded-lg bg-red-500/20 p-3">
        <span className="font-medium text-red-300 text-sm">
          Pedido Cancelado
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {statusSteps.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={status} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-white/30 bg-transparent text-white/40',
                  isCurrent &&
                    'ring-2 ring-primary/50 ring-offset-2 ring-offset-transparent',
                )}
              >
                {index === 0 && <Package className="h-4 w-4" />}
                {index === 1 && <Droplets className="h-4 w-4" />}
                {index === 2 && <Shirt className="h-4 w-4" />}
                {index === 3 && <Truck className="h-4 w-4" />}
              </div>
              <span
                className={cn(
                  'mt-1 text-center text-xs',
                  isCompleted ? 'text-white/80' : 'text-white/40',
                )}
              >
                {orderStatusLabels[status]}
              </span>
            </div>
            {index < statusSteps.length - 1 && (
              <div
                className={cn(
                  'mx-1 h-0.5 flex-1',
                  index < currentIndex ? 'bg-primary' : 'bg-white/20',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-white/10 bg-white/10 shadow-xl backdrop-blur-xl transition-all hover:bg-white/15">
      <CardHeader
        className="cursor-pointer pb-2"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-primary" />
              <span className="font-bold text-lg text-white">{order.code}</span>
              <Badge className={cn('ml-2', orderStatusColors[order.status])}>
                {orderStatusLabels[order.status]}
              </Badge>
            </div>
            {order.customer && (
              <div className="flex items-center gap-2 text-white/60">
                <User className="h-3.5 w-3.5" />
                <span className="text-sm">{order.customer.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg text-primary">
              {formatCurrency(order.total)}
            </span>
            <ChevronRight
              className={cn(
                'h-5 w-5 text-white/40 transition-transform',
                expanded && 'rotate-90',
              )}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <OrderStatusTimeline currentStatus={order.status} />

        {expanded && (
          <>
            <Separator className="bg-white/10" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Retirada</span>
                </div>
                <p className="font-medium text-sm text-white">
                  {formatDate(order.pickupDate)} às {order.pickupTime}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Entrega</span>
                </div>
                <p className="font-medium text-sm text-white">
                  {formatDate(order.deliveryDate)} às {order.deliveryTime}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/60 text-xs">
                <Truck className="h-3.5 w-3.5" />
                <span>Tipo de Entrega</span>
              </div>
              <p className="font-medium text-sm text-white">
                {deliveryTypeLabels[order.deliveryType]}
              </p>
            </div>

            {order.deliveryAddress && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Endereço de Entrega</span>
                </div>
                <p className="font-medium text-sm text-white">
                  {order.deliveryAddress}
                </p>
              </div>
            )}

            <Separator className="bg-white/10" />

            <div className="space-y-2">
              <span className="font-medium text-sm text-white/80">
                Itens do Pedido
              </span>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Shirt className="h-4 w-4 text-primary" />
                      <span className="text-sm text-white">
                        {item.piece.name}
                      </span>
                      <span className="text-white/40 text-xs">
                        x{item.quantity}
                      </span>
                    </div>
                    <span className="font-medium text-sm text-white">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {order.history.length > 0 && (
              <>
                <Separator className="bg-white/10" />
                <div className="space-y-2">
                  <span className="font-medium text-sm text-white/80">
                    Histórico
                  </span>
                  <div className="space-y-2">
                    {order.history.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Clock className="mt-0.5 h-3.5 w-3.5 text-white/40" />
                        <div>
                          <p className="text-white/80">{entry.description}</p>
                          <p className="text-white/40 text-xs">
                            {new Intl.DateTimeFormat('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).format(entry.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function TrackingPage() {
  const [phoneInput, setPhoneInput] = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const { data: orders, isLoading, isFetched } = useOrdersByPhone(searchPhone);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhoneInput(formatted);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneInput.replace(/\D/g, '');
    if (cleanPhone.length >= 8) {
      setSearchPhone(cleanPhone);
    }
  };

  const hasSearched = isFetched && searchPhone.length >= 8;
  const hasResults = orders && orders.length > 0;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="-left-40 -top-40 absolute h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
      <div className="-bottom-40 -right-40 absolute h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />

      <div className="relative z-10 flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <Link
              to="/login"
              search={{ redirect: '/tracking' }}
              className="inline-block"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/25">
                <Droplets className="h-8 w-8 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="font-bold text-3xl text-white">Consultar Pedidos</h1>
            <p className="mt-2 text-white/60">
              Digite seu número de celular para ver o status dos seus pedidos
            </p>
          </div>

          <Card className="mb-6 border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/80">
                    Número de Celular
                  </Label>
                  <div className="relative">
                    <Phone className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-white/40" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={phoneInput}
                      onChange={handlePhoneChange}
                      maxLength={16}
                      className="border-white/20 bg-white/10 pl-10 text-white placeholder:text-white/40 focus-visible:border-primary focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    isLoading || phoneInput.replace(/\D/g, '').length < 8
                  }
                  className="w-full bg-gradient-to-r from-primary to-purple-600 font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/30 hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Buscar Pedidos
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {hasSearched && !isLoading && (
            <div className="space-y-4">
              {hasResults ? (
                <>
                  <p className="text-center text-sm text-white/60">
                    {orders.length} pedido{orders.length !== 1 ? 's' : ''}{' '}
                    encontrado{orders.length !== 1 ? 's' : ''}
                  </p>
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </>
              ) : (
                <Card className="border-white/10 bg-white/10 shadow-xl backdrop-blur-xl">
                  <CardContent className="py-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-white/30" />
                    <h3 className="font-medium text-lg text-white">
                      Nenhum pedido encontrado
                    </h3>
                    <p className="mt-1 text-sm text-white/60">
                      Não encontramos pedidos associados a este número de
                      celular
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-white/40">
            © 2024 LavApp. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
