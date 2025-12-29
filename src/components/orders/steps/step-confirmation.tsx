import { useOrderWizard } from '../order-wizard-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  UserX,
  Package,
  Calendar,
  MapPin,
  FileText,
  Store,
  Truck,
  Pencil,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { formatCurrency, formatPhone } from '@/lib/utils';
import {
  deliveryTypeLabels,
  PAYMENT_METHOD_OPTIONS,
  paymentMethodLabels,
} from '@/types/order';

export function StepConfirmation() {
  const { data, setCurrentStep, getTotal, setDeliveryInfo } = useOrderWizard();

  const formatDate = (date: Date | null): string => {
    if (!date) return '-';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Confirmação do Pedido</h2>
        <p className="mt-1 text-muted-foreground">
          Revise os dados antes de confirmar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {data.isAnonymous ? (
                <UserX className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
              Cliente
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(1)}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            {data.isAnonymous ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <UserX className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Cliente Avulso</p>
                  <p className="text-sm text-muted-foreground">
                    Pedido sem cliente vinculado
                  </p>
                </div>
              </div>
            ) : data.customer ? (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-semibold text-primary">
                  {data.customer.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{data.customer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPhone(data.customer.phone)} • {data.customer.code}
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              {data.deliveryType === 'PICKUP' ? (
                <Store className="h-5 w-5" />
              ) : (
                <Truck className="h-5 w-5" />
              )}
              Entrega
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(3)}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {deliveryTypeLabels[data.deliveryType]}
              </span>
            </div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Coleta:</span>
                <span>
                  {formatDate(data.pickupDate)} às {data.pickupTime || '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Entrega:</span>
                <span>
                  {formatDate(data.deliveryDate)} às {data.deliveryTime || '-'}
                </span>
              </div>
              {data.deliveryType === 'DELIVERY' && data.deliveryAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span>{data.deliveryAddress}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="h-5 w-5" />
            Itens do Pedido ({data.items.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep(2)}
            className="gap-1"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.items.map((item) => (
              <div
                key={item.piece.id}
                className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.piece.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.quantity}x {formatCurrency(item.piece.price)}
                    </p>
                  </div>
                </div>
                <span className="font-semibold">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total do Pedido</span>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(getTotal())}
            </span>
          </div>
        </CardContent>
      </Card>

      {(data.notes || data.specialInstructions) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-5 w-5" />
              Observações
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(3)}
              className="gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Observações Gerais
                </p>
                <p className="mt-1">{data.notes}</p>
              </div>
            )}
            {data.specialInstructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Instruções Especiais
                </p>
                <p className="mt-1">{data.specialInstructions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-5 w-5" />
            Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-method">Forma de Pagamento *</Label>
            <Select
              value={data.paymentMethod || ''}
              onValueChange={(value) =>
                setDeliveryInfo({
                  paymentMethod:
                    value as (typeof PAYMENT_METHOD_OPTIONS)[number]['value'],
                })
              }
            >
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Selecione a forma de pagamento" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-4">
            <button
              type="button"
              onClick={() => setDeliveryInfo({ isPaid: !data.isPaid })}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                data.isPaid
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <CreditCard className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <p className="font-medium">
                {data.isPaid ? 'Pagamento Recebido' : 'Pagamento Pendente'}
              </p>
              <p className="text-sm text-muted-foreground">
                {data.isPaid
                  ? 'O pagamento já foi realizado'
                  : 'Aguardando pagamento do cliente'}
              </p>
            </div>
            <Button
              type="button"
              variant={data.isPaid ? 'secondary' : 'default'}
              size="sm"
              onClick={() => setDeliveryInfo({ isPaid: !data.isPaid })}
            >
              {data.isPaid ? 'Marcar como Não Pago' : 'Marcar como Pago'}
            </Button>
          </div>

          {data.paymentMethod && (
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Forma de pagamento:
                </span>
                <span className="font-medium">
                  {paymentMethodLabels[data.paymentMethod]}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    data.isPaid
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}
                >
                  {data.isPaid ? 'Pago' : 'Não Pago'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
