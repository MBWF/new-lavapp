export type {
  Order,
  OrderItem,
  OrderHistory,
  OrderStatus,
  DeliveryType,
  CreateOrderInput,
  UpdateOrderInput,
} from '@/supabase/hooks';

export const orderStatusLabels: Record<string, string> = {
  RECEIVED: 'Recebido',
  WASHING: 'Em Lavagem',
  READY: 'Pronto',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export const orderStatusColors: Record<string, string> = {
  RECEIVED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  WASHING:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  READY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DELIVERED:
    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const deliveryTypeLabels: Record<string, string> = {
  PICKUP: 'Retirada na Loja',
  DELIVERY: 'Delivery',
};

export const ORDER_STATUS_OPTIONS = [
  { value: 'RECEIVED' as const, label: orderStatusLabels.RECEIVED },
  { value: 'WASHING' as const, label: orderStatusLabels.WASHING },
  { value: 'READY' as const, label: orderStatusLabels.READY },
  { value: 'DELIVERED' as const, label: orderStatusLabels.DELIVERED },
  { value: 'CANCELLED' as const, label: orderStatusLabels.CANCELLED },
];

export const ORDER_STATUS_STEPS = ['RECEIVED', 'WASHING', 'READY', 'DELIVERED'] as const;
