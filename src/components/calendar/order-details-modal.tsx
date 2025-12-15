import {
  UserX,
  Package,
  Calendar,
  MapPin,
  FileText,
  Store,
  Truck,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUpdateOrderStatus } from '@/hooks/use-orders';
import { toast } from '@/hooks/use-toast';
import { formatCurrency, formatPhone, cn } from '@/lib/utils';
import {
  orderStatusLabels,
  orderStatusColors,
  deliveryTypeLabels,
  type OrderStatus,
} from '@/types/order';
import type { CalendarEvent } from '@/types/calendar';
import { Link } from '@tanstack/react-router';

interface OrderDetailsModalProps {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusActions: Array<{
  status: OrderStatus;
  label: string;
  color: string;
}> = [
  {
    status: 'RECEIVED',
    label: 'Recebido',
    color: 'bg-blue-500 hover:bg-blue-600',
  },
  {
    status: 'WASHING',
    label: 'Em Lavagem',
    color: 'bg-yellow-500 hover:bg-yellow-600',
  },
  {
    status: 'READY',
    label: 'Pronto',
    color: 'bg-green-500 hover:bg-green-600',
  },
  {
    status: 'DELIVERED',
    label: 'Entregue',
    color: 'bg-purple-500 hover:bg-purple-600',
  },
];

export function OrderDetailsModal({
  event,
  open,
  onOpenChange,
}: OrderDetailsModalProps) {
  const updateStatus = useUpdateOrderStatus();

  if (!event) return null;

  const { order, type } = event;

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: newStatus });
      toast({
        title: 'Status atualizado',
        description: `Pedido alterado para ${orderStatusLabels[newStatus]}`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {type === 'pickup' ? (
                <Package className="h-5 w-5 text-blue-500" />
              ) : (
                <Truck className="h-5 w-5 text-green-500" />
              )}
              {type === 'pickup' ? 'Coleta' : 'Entrega'} - {order.code}
            </DialogTitle>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                orderStatusColors[order.status],
              )}
            >
              {orderStatusLabels[order.status]}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            {order.isAnonymous ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Cliente Avulso</p>
                  <p className="text-sm text-muted-foreground">Sem cadastro</p>
                </div>
              </>
            ) : order.customer ? (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
                  {order.customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(order.customer.phone)}
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Coleta</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatDate(order.pickupDate)} às {order.pickupTime}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entrega</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {formatDate(order.deliveryDate)} às {order.deliveryTime}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {order.deliveryType === 'PICKUP' ? (
              <Store className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Truck className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm">
              {deliveryTypeLabels[order.deliveryType]}
            </span>
          </div>

          {order.deliveryType === 'DELIVERY' && order.deliveryAddress && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{order.deliveryAddress}</span>
            </div>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Itens ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded bg-muted/50 p-2"
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="text-sm">{item.piece.name}</span>
                    <span className="text-xs text-muted-foreground">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>

          {(order.notes || order.specialInstructions) && (
            <>
              <Separator />
              <div className="space-y-2">
                {order.notes && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Observações
                      </p>
                      <p className="text-sm">{order.notes}</p>
                    </div>
                  </div>
                )}
                {order.specialInstructions && (
                  <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Instruções Especiais
                      </p>
                      <p className="text-sm">{order.specialInstructions}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Alterar Status
            </p>
            <div className="flex flex-wrap gap-2">
              {statusActions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  disabled={
                    order.status === action.status || updateStatus.isPending
                  }
                  onClick={() => handleStatusChange(action.status)}
                  className={cn(
                    'gap-1 text-white',
                    order.status === action.status
                      ? 'opacity-50'
                      : action.color,
                  )}
                >
                  {updateStatus.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/orders/$orderId" params={{ orderId: order.id }}>
                Ver Detalhes Completos
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
