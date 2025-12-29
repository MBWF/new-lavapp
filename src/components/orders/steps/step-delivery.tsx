import {
  AlertCircle,
  Calendar,
  Clock,
  FileText,
  MapPin,
  Store,
  Truck,
} from 'lucide-react';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import type { DeliveryType } from '@/types/order';
import { useOrderWizard } from '../order-wizard-context';

const getCurrentTime = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5);
};

export function StepDelivery() {
  const { data, setDeliveryInfo } = useOrderWizard();

  useEffect(() => {
    const now = new Date();
    const currentTime = getCurrentTime();
    const updates: Partial<typeof data> = {};

    if (!data.pickupDate) {
      updates.pickupDate = now;
    }
    if (!data.pickupTime) {
      updates.pickupTime = currentTime;
    }
    if (!data.deliveryDate) {
      updates.deliveryDate = now;
    }
    if (!data.deliveryTime) {
      updates.deliveryTime = currentTime;
    }

    if (Object.keys(updates).length > 0) {
      setDeliveryInfo(updates);
    }
  }, [
    data.pickupDate,
    data.pickupTime,
    data.deliveryDate,
    data.deliveryTime,
    setDeliveryInfo,
  ]);

  const handleDateChange = (
    field: 'pickupDate' | 'deliveryDate',
    date: Date | undefined,
  ) => {
    setDeliveryInfo({ [field]: date || null });
  };

  return (
    <div className="h-full space-y-6">
      <div className="text-center">
        <h2 className="font-bold text-2xl">Coleta e Entrega</h2>
        <p className="mt-1 text-muted-foreground">
          Configure as informações de coleta e entrega do pedido
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="font-semibold text-base">Tipo de Entrega</Label>
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
                    <p className="text-muted-foreground text-sm">
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
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Coleta
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pickup-date">Data *</Label>
                  <DatePicker
                    id="pickup-date"
                    date={data.pickupDate || new Date()}
                    onSelect={(date) => handleDateChange('pickupDate', date)}
                    placeholder="Selecione a data"
                    fromDate={new Date()}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pickup-time">Horário</Label>
                  <div className="relative">
                    <Clock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickup-time"
                      type="time"
                      value={data.pickupTime || ''}
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
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Entrega
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delivery-date">Data *</Label>
                  <DatePicker
                    id="delivery-date"
                    date={data.deliveryDate}
                    onSelect={(date) => handleDateChange('deliveryDate', date)}
                    placeholder="Selecione a data"
                    fromDate={data.pickupDate || new Date()}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery-time">Horário</Label>
                  <div className="relative">
                    <Clock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="delivery-time"
                      type="time"
                      value={data.deliveryTime || ''}
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
              <div className="flex items-center gap-2 font-semibold text-lg">
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
                <div className="flex items-center gap-2 text-amber-600 text-sm dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  Endereço é obrigatório para delivery
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-2 font-semibold text-lg">
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
