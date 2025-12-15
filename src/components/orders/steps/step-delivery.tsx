import { useOrderWizard } from '../order-wizard-context';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Store,
  Truck,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeliveryType } from '@/types/order';

export function StepDelivery() {
  const { data, setDeliveryInfo } = useOrderWizard();

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0] ?? '';
  };

  const handleDateChange = (
    field: 'pickupDate' | 'deliveryDate',
    value: string,
  ) => {
    setDeliveryInfo({ [field]: value ? new Date(value + 'T12:00:00') : null });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Coleta e Entrega</h2>
        <p className="mt-1 text-muted-foreground">
          Configure as informações de coleta e entrega do pedido
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base font-semibold">Tipo de Entrega</Label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(['PICKUP', 'DELIVERY'] as DeliveryType[]).map((type) => (
              <Card
                key={type}
                className={cn(
                  'cursor-pointer transition-all hover:border-primary/50',
                  data.deliveryType === type &&
                    'border-2 border-primary bg-primary/5',
                )}
                onClick={() => setDeliveryInfo({ deliveryType: type })}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg',
                      data.deliveryType === type
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted',
                    )}
                  >
                    {type === 'PICKUP' ? (
                      <Store className="h-6 w-6" />
                    ) : (
                      <Truck className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {type === 'PICKUP' ? 'Retirada na Loja' : 'Delivery'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {type === 'PICKUP'
                        ? 'Cliente retira na loja'
                        : 'Entrega no endereço'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Coleta
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Data *</Label>
                  <Input
                    id="pickup-date"
                    type="date"
                    value={formatDateForInput(data.pickupDate)}
                    onChange={(e) =>
                      handleDateChange('pickupDate', e.target.value)
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-time">Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="pickup-time"
                      type="time"
                      value={data.pickupTime}
                      onChange={(e) =>
                        setDeliveryInfo({ pickupTime: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Entrega
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Data *</Label>
                  <Input
                    id="delivery-date"
                    type="date"
                    value={formatDateForInput(data.deliveryDate)}
                    onChange={(e) =>
                      handleDateChange('deliveryDate', e.target.value)
                    }
                    min={
                      formatDateForInput(data.pickupDate) ||
                      new Date().toISOString().split('T')[0]
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-time">Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="delivery-time"
                      type="time"
                      value={data.deliveryTime}
                      onChange={(e) =>
                        setDeliveryInfo({ deliveryTime: e.target.value })
                      }
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {data.deliveryType === 'DELIVERY' && (
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5 text-primary" />
                Endereço de Entrega
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery-address">Endereço Completo *</Label>
                <Input
                  id="delivery-address"
                  placeholder="Rua, número, bairro, cidade..."
                  value={data.deliveryAddress}
                  onChange={(e) =>
                    setDeliveryInfo({ deliveryAddress: e.target.value })
                  }
                />
              </div>
              {data.deliveryType === 'DELIVERY' && !data.deliveryAddress && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Endereço é obrigatório para delivery
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              Observações
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="notes">Observações Gerais</Label>
                <textarea
                  id="notes"
                  placeholder="Observações sobre o pedido..."
                  value={data.notes}
                  onChange={(e) => setDeliveryInfo({ notes: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="special-instructions">
                  Instruções Especiais das Peças
                </Label>
                <textarea
                  id="special-instructions"
                  placeholder="Ex.: manchas, cuidados especiais..."
                  value={data.specialInstructions}
                  onChange={(e) =>
                    setDeliveryInfo({ specialInstructions: e.target.value })
                  }
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
