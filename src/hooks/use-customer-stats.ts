import { useOrdersByCustomerId } from './use-orders';

export interface CustomerStats {
  totalOrders: number;
  totalSpent: number;
  unpaidAmount: number;
  lastOrderDate: Date | null;
}

export function useCustomerStats(customerId: string): CustomerStats {
  const { data } = useOrdersByCustomerId(customerId, 1, 9999);

  const allOrders = data?.orders || [];

  const totalOrders = allOrders.length;
  const totalSpent = allOrders.reduce((sum, order) => sum + order.total, 0);
  const unpaidAmount = allOrders
    .filter((order) => !order.isPaid)
    .reduce((sum, order) => sum + order.total, 0);
  const lastOrderDate = allOrders.length > 0 ? allOrders[0]!.createdAt : null;

  return {
    totalOrders,
    totalSpent,
    unpaidAmount,
    lastOrderDate,
  };
}
